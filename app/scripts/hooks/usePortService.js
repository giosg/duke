import { useState, useEffect, useRef, useCallback } from 'react';

export const usePortService = () => {
  const [isConnected, setIsConnected] = useState(false);
  const portRef = useRef(null);
  const queryCounterRef = useRef(0);
  const queriesRef = useRef({});
  const listenersRef = useRef({});

  // Connect to the active tab
  const connect = useCallback(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        portRef.current = chrome.tabs.connect(tabs[0].id);
        setIsConnected(true);
        
        portRef.current.onMessage.addListener((message) => {
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
      }
    });
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    connect();
    
    return () => {
      if (portRef.current) {
        portRef.current.disconnect();
      }
    };
  }, [connect]);

  // Send async message
  const sendAsyncMessage = useCallback((request) => {
    return new Promise((resolve, reject) => {
      if (!isConnected || !portRef.current) {
        reject(new Error('Port not connected'));
        return;
      }

      queryCounterRef.current += 1;
      const currentQuery = queryCounterRef.current;
      
      queriesRef.current[currentQuery] = { resolve, reject };
      
      portRef.current.postMessage({
        query: currentQuery,
        request: request,
      });
    });
  }, [isConnected]);

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
  };
};
