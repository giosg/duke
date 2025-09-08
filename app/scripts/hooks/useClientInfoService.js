import { useState, useCallback } from 'react';
import { usePortService } from './usePortService';
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

export const useClientInfoService = () => {
  const { sendAsyncMessage } = usePortService();
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
    return sendAsyncMessage({ command: COMMANDS.GIOSG_ENABLED });
  }, [sendAsyncMessage]);

  const getBasicInfo = useCallback(async () => {
    try {
      const message = await sendAsyncMessage({ command: COMMANDS.BASIC_INFO });
      const newClientInfo = { ...message.response };
      
      if (message.response.hasGiosg) {
        newClientInfo.enabledCartSelectors = handleCartSettings(message.response.apiConfig);
      }
      
      setClientInfo(newClientInfo);
      return newClientInfo;
    } catch (error) {
      console.error('Failed to get basic info:', error);
      throw error;
    }
  }, [sendAsyncMessage, handleCartSettings]);

  const getRuleStates = useCallback(async () => {
    try {
      const message = await sendAsyncMessage({ command: COMMANDS.RULE_STATES });
      return message.response.ruleStates;
    } catch (error) {
      console.error('Failed to get rule states:', error);
      throw error;
    }
  }, [sendAsyncMessage]);

  const editRuleCondition = useCallback(async (ruleId, conditionIndex, newValue, newType) => {
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
    try {
      const message = await sendAsyncMessage({ command: COMMANDS.RUNCART });
      return message.response.cart;
    } catch (error) {
      console.error('Failed to run cart:', error);
      throw error;
    }
  }, [sendAsyncMessage]);

  const enableCobrowse = useCallback(() => {
    return sendAsyncMessage({ command: COMMANDS.ENABLE_COBROWSE });
  }, [sendAsyncMessage]);

  const showCobrowse = useCallback(() => {
    return sendAsyncMessage({ command: COMMANDS.SHOW_COBROWSE });
  }, [sendAsyncMessage]);

  const showClient = useCallback(() => {
    return sendAsyncMessage({ command: COMMANDS.SHOWCLIENT });
  }, [sendAsyncMessage]);

  const showButton = useCallback(() => {
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
