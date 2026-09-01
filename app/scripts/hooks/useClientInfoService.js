import { useState, useCallback } from 'react';
import _ from 'lodash';

const COMMANDS = {
  GIOSG_ENABLED: "giosgEnabled",
  BASIC_INFO: "basicInfo",
  RULE_STATES: "ruleStates",
  EDIT_RULE_CONDITION: "editRuleCondition",
  MATCHRULE: "matchRule",
  RUNCART: "runCart",
  SHOWCLIENT: "showClient",
  SHOWBUTTON: "showButton",
  ENABLE_COBROWSE: "enableCobrowse",
  SHOW_COBROWSE: "showCobrowse",
};

export const useClientInfoService = (sendAsyncMessage) => {
  // Check if sendAsyncMessage is actually a function
  if (typeof sendAsyncMessage !== 'function') {
    console.error('useClientInfoService: sendAsyncMessage is not a function!', sendAsyncMessage);
    throw new Error('sendAsyncMessage must be a function');
  }

  const [clientInfo, setClientInfo] = useState({});

  const handleCartSettings = useCallback((apiConfig) => {
    const enabledCartSelectors = [];
    if (apiConfig && apiConfig.cartSelectors) {
      Object.entries(apiConfig.cartSelectors).forEach(([selectorName, selectorObj]) => {
        if (selectorObj.type !== "0") {
          // selector enabled
          selectorObj.selectorName = selectorName;
          enabledCartSelectors.push(selectorObj);
        }
      });
    }
    return enabledCartSelectors;
  }, []);

  const isGiosgEnabled = useCallback(() => {
    if (typeof sendAsyncMessage !== 'function') {
      console.error('isGiosgEnabled: sendAsyncMessage is not a function');
      return Promise.reject(new Error('sendAsyncMessage is not available'));
    }
    return sendAsyncMessage({ command: COMMANDS.GIOSG_ENABLED });
  }, [sendAsyncMessage]);

  const getBasicInfo = useCallback(async () => {
    // Check if sendAsyncMessage is available
    if (typeof sendAsyncMessage !== 'function') {
      const error = new Error('sendAsyncMessage is not a function');
      console.error('getBasicInfo failed - sendAsyncMessage not available:', error);
      throw error;
    }

    try {
      const message = await sendAsyncMessage({ command: COMMANDS.BASIC_INFO });

      if (!message || !message.response) {
        throw new Error('Invalid response from sendAsyncMessage');
      }

      const newClientInfo = { ...message.response };

      if (message.response.hasGiosg) {
        newClientInfo.enabledCartSelectors = handleCartSettings(message.response.apiConfig);
      }

      setClientInfo(newClientInfo);
      return newClientInfo;
    } catch (error) {
      console.error('getBasicInfo failed:', error);
      throw error;
    }
  }, [sendAsyncMessage, handleCartSettings]);

  const getRuleStates = useCallback(async () => {
    if (typeof sendAsyncMessage !== 'function') {
      console.error('getRuleStates: sendAsyncMessage is not a function');
      throw new Error('sendAsyncMessage is not available');
    }
    try {
      const message = await sendAsyncMessage({ command: COMMANDS.RULE_STATES });
      return message.response.ruleStates;
    } catch (error) {
      console.error('Failed to get rule states:', error);
      throw error;
    }
  }, [sendAsyncMessage]);

  const editRuleCondition = useCallback(async (ruleId, conditionIndex, newValue, newType) => {
    if (typeof sendAsyncMessage !== 'function') {
      console.error('editRuleCondition: sendAsyncMessage is not a function');
      throw new Error('sendAsyncMessage is not available');
    }
    try {
      const message = await sendAsyncMessage({
        command: COMMANDS.EDIT_RULE_CONDITION,
        ruleId,
        conditionIndex,
        value: newValue,
        type: newType,
      });
      return message.response.ruleStates;
    } catch (error) {
      console.error('Failed to edit rule condition:', error);
      throw error;
    }
  }, [sendAsyncMessage]);

  const matchRule = useCallback(async (rule) => {
    if (typeof sendAsyncMessage !== 'function') {
      console.error('matchRule: sendAsyncMessage is not a function');
      throw new Error('sendAsyncMessage is not available');
    }
    try {
      const message = await sendAsyncMessage({
        command: COMMANDS.MATCHRULE,
        rule,
      });
      rule.match = message.response.match;
      return rule;
    } catch (error) {
      console.error('Failed to match rule:', error);
      throw error;
    }
  }, [sendAsyncMessage]);

  const runCart = useCallback(async () => {
    if (typeof sendAsyncMessage !== 'function') {
      console.error('runCart: sendAsyncMessage is not a function');
      throw new Error('sendAsyncMessage is not available');
    }
    try {
      const message = await sendAsyncMessage({ command: COMMANDS.RUNCART });
      return message.response.cart;
    } catch (error) {
      console.error('Failed to run cart:', error);
      throw error;
    }
  }, [sendAsyncMessage]);

  const enableCobrowse = useCallback(() => {
    if (typeof sendAsyncMessage !== 'function') {
      console.error('enableCobrowse: sendAsyncMessage is not a function');
      return Promise.reject(new Error('sendAsyncMessage is not available'));
    }
    return sendAsyncMessage({ command: COMMANDS.ENABLE_COBROWSE });
  }, [sendAsyncMessage]);

  const showCobrowse = useCallback(() => {
    if (typeof sendAsyncMessage !== 'function') {
      console.error('showCobrowse: sendAsyncMessage is not a function');
      return Promise.reject(new Error('sendAsyncMessage is not available'));
    }
    return sendAsyncMessage({ command: COMMANDS.SHOW_COBROWSE });
  }, [sendAsyncMessage]);

  const showClient = useCallback(() => {
    if (typeof sendAsyncMessage !== 'function') {
      console.error('showClient: sendAsyncMessage is not a function');
      return Promise.reject(new Error('sendAsyncMessage is not available'));
    }
    return sendAsyncMessage({ command: COMMANDS.SHOWCLIENT });
  }, [sendAsyncMessage]);

  const showButton = useCallback(() => {
    if (typeof sendAsyncMessage !== 'function') {
      console.error('showButton: sendAsyncMessage is not a function');
      return Promise.reject(new Error('sendAsyncMessage is not available'));
    }
    return sendAsyncMessage({ command: COMMANDS.SHOWBUTTON });
  }, [sendAsyncMessage]);

  return {
    clientInfo,
    isGiosgEnabled,
    getBasicInfo,
    getRuleStates,
    editRuleCondition,
    matchRule,
    runCart,
    enableCobrowse,
    showCobrowse,
    showClient,
    showButton,
  };
};
