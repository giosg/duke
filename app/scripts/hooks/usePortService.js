import { useState, useEffect, useRef, useCallback } from 'react';

export const usePortService = () => {
  const [isConnected, setIsConnected] = useState(false);
  const portRef = useRef(null);
  const queryCounterRef = useRef(0);
  const queriesRef = useRef({});
  const listenersRef = useRef({});
  const contentScriptReadyRef = useRef(false);
  const connectionAttemptsRef = useRef(0);

  // Connect to the active tab with retry mechanism
  const connect = useCallback(() => {
    connectionAttemptsRef.current += 1;
    const currentAttempt = connectionAttemptsRef.current;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error('Error querying tabs:', chrome.runtime.lastError);
        setIsConnected(false);

        // Retry after delay if not too many attempts
        if (currentAttempt < 3) {
          setTimeout(() => connect(), 1000);
        }
        return;
      }

      if (tabs && tabs[0] && tabs[0].id) {
        try {
          // Connect to the content script in the active tab
          portRef.current = chrome.tabs.connect(tabs[0].id, { name: 'duke-popup' });

          if (!portRef.current) {
            console.error('Failed to create port connection');
            setIsConnected(false);

            // Retry after delay if not too many attempts
            if (currentAttempt < 3) {
              setTimeout(() => connect(), 1000);
            }
            return;
          }

          // Set up message listener
          portRef.current.onMessage.addListener((message) => {
            // Handle content script ready signal
            if (message._type === 'DUKE_CONTENT_READY') {
              contentScriptReadyRef.current = true;
              setIsConnected(true);
              return;
            }
            
            if (message._type === "DUKERESPONSE") {
              const query = message.query;
              if (queriesRef.current[query]) {
                queriesRef.current[query].resolve(message);
                delete queriesRef.current[query];
              }
            } else if (message._type === "DUKEMESSAGE") {
              const msgType = message.msgType;
              const msgArgs = message.msgArgs || [];
              
              // Notify listeners
              if (listenersRef.current[msgType]) {
                listenersRef.current[msgType].forEach(listener => {
                  listener(...msgArgs);
                });
              }
            }
          });

          // Set up disconnect listener
          portRef.current.onDisconnect.addListener(() => {
            const error = chrome.runtime.lastError;
            setIsConnected(false);
            contentScriptReadyRef.current = false;
            portRef.current = null;

            // If there's an error, log it for debugging
            if (error) {
              console.error('Port disconnect error:', error);
            }
          });

        } catch (error) {
          console.error('Error connecting to tab:', error);
          setIsConnected(false);
          portRef.current = null;

          // Retry after delay if not too many attempts
          if (currentAttempt < 3) {
            setTimeout(() => connect(), 1000);
          }
        }
      } else {
        console.error('No active tab found or tab has no ID');
        setIsConnected(false);

        // Retry after delay if not too many attempts
        if (currentAttempt < 3) {
          setTimeout(() => connect(), 1000);
        }
      }
    });
  }, []);

  // Reset connection state
  const resetConnection = useCallback(() => {
    connectionAttemptsRef.current = 0;
    contentScriptReadyRef.current = false;
    setIsConnected(false);
    if (portRef.current) {
      try {
        portRef.current.disconnect();
      } catch (e) {
        console.log('Error disconnecting port during reset:', e);
      }
      portRef.current = null;
    }
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    // Small delay to ensure content script has time to load
    const timer = setTimeout(() => {
      connect();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (portRef.current) {
        try {
          portRef.current.disconnect();
        } catch (e) {
          // Ignore disconnect errors during cleanup
        }
      }
    };
  }, [connect]);

  // Send async message with retry logic for content script readiness
  const sendAsyncMessage = useCallback((request) => {
    // Check if sendAsyncMessage is being called as a function
    if (typeof request !== 'object' || request === null) {
      console.error('sendAsyncMessage received invalid request:', request);
      return Promise.reject(new Error('Invalid request parameter'));
    }

    return new Promise((resolve, reject) => {
      const attemptSend = (retryCount = 0) => {
        // Check if port exists
        if (!portRef.current) {
          reject(new Error('Port not connected'));
          return;
        }

        // If content script is not ready, wait and retry
        if (!contentScriptReadyRef.current) {
          if (retryCount < 5) { // Retry up to 5 times
            setTimeout(() => attemptSend(retryCount + 1), 500 * (retryCount + 1));
            return;
          } else {
            reject(new Error('Content script not ready'));
            return;
          }
        }

        // Additional check - try to detect if port is still valid
        try {
          if (portRef.current.error) {
            reject(new Error('Port has error: ' + portRef.current.error.message));
            return;
          }
        } catch (error) {
          reject(new Error('Port validation failed'));
          return;
        }

        queryCounterRef.current += 1;
        const currentQuery = queryCounterRef.current;

        queriesRef.current[currentQuery] = { resolve, reject };

        const messageToSend = {
          query: currentQuery,
          request: request,
        };

        try {
          portRef.current.postMessage(messageToSend);

          // Add timeout to prevent hanging promises
          setTimeout(() => {
            if (queriesRef.current[currentQuery]) {
              delete queriesRef.current[currentQuery];
              reject(new Error('Message timeout'));
            }
          }, 10000); // 10 second timeout

        } catch (error) {
          delete queriesRef.current[currentQuery];
          reject(new Error('Failed to send message: ' + error.message));
        }
      };

      // Start the send attempt
      attemptSend();
    });
  }, []); // Remove isConnected dependency

  // Add message listener
  const onMessage = useCallback((msgType, listener) => {
    if (!listenersRef.current[msgType]) {
      listenersRef.current[msgType] = [];
    }
    listenersRef.current[msgType].push(listener);

    // Return cleanup function
    return () => {
      if (listenersRef.current[msgType]) {
        const index = listenersRef.current[msgType].indexOf(listener);
        if (index > -1) {
          listenersRef.current[msgType].splice(index, 1);
        }
      }
    };
  }, []);

  return {
    isConnected,
    sendAsyncMessage,
    onMessage,
    resetConnection,
  };
};
