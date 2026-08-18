import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for persistent state that syncs with Chrome storage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if nothing is stored
 * @returns {[value, setValue]} - State value and setter function
 */
export const usePersistentState = (key, defaultValue) => {
  const [value, setValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load value from storage on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        const result = await chrome.storage.local.get([key]);
        if (result[key] !== undefined) {
          setValue(result[key]);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load persistent state:', error);
        setIsLoaded(true);
      }
    };

    loadValue();
  }, [key]);

  // Save value to storage when it changes
  const setPersistentValue = useCallback(async (newValue) => {
    try {
      // Handle function updates like regular useState
      const valueToStore = typeof newValue === 'function' ? newValue(value) : newValue;
      
      setValue(valueToStore);
      await chrome.storage.local.set({ [key]: valueToStore });
    } catch (error) {
      console.error('Failed to save persistent state:', error);
    }
  }, [key, value]);

  return [value, setPersistentValue, isLoaded];
};

/**
 * Hook for managing multiple persistent state values
 * @param {Object} initialState - Object with key-value pairs for initial state
 * @returns {[state, updateState, isLoaded]} - State object, updater function, and loaded status
 */
export const usePersistentStateObject = (initialState) => {
  const [state, setState] = useState(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load all values from storage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const keys = Object.keys(initialState);
        const result = await chrome.storage.local.get(keys);
        
        const loadedState = { ...initialState };
        keys.forEach(key => {
          if (result[key] !== undefined) {
            loadedState[key] = result[key];
          }
        });
        
        setState(loadedState);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load persistent state:', error);
        setIsLoaded(true);
      }
    };

    loadState();
  }, []); // Only run once on mount

  // Update specific key in state and storage
  const updateState = useCallback(async (key, newValue) => {
    try {
      const valueToStore = typeof newValue === 'function' ? newValue(state[key]) : newValue;
      
      setState(prevState => ({
        ...prevState,
        [key]: valueToStore
      }));
      
      await chrome.storage.local.set({ [key]: valueToStore });
    } catch (error) {
      console.error('Failed to update persistent state:', error);
    }
  }, [state]);

  return [state, updateState, isLoaded];
};
