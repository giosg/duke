
  var COMMANDS = {
    GIOSG_ENABLED: 'giosgEnabled',
    BASIC_INFO:    'basicInfo',
    RULE_STATES:   'ruleStates',
    EDIT_RULE_CONDITION: 'editRuleCondition',
    MATCHRULE:     'matchRule',
    RUNCART:       'runCart',
    SHOWCLIENT:    'showClient',
    SHOWBUTTON:    'showButton'
  };

  angular.module('popup.services')
  .factory('ClientInfoService', ['PortService', function(PortService) {
    function ClientInfoService() {
      this.output = {};
    }

    ClientInfoService.prototype.isGiosgEnabled = function() {
      return PortService.sendAsyncMessage({ command : COMMANDS.GIOSG_ENABLED });
    };

    ClientInfoService.prototype.handleCartSettings = function(apiConfig) {
      var enabledCartSelectors = [];
      if(apiConfig && apiConfig.cartSelectors) {
        angular.forEach(apiConfig.cartSelectors, function(selectorObj, selectorName) {
          if(selectorObj.type != "0") {
            // selector enabled
            selectorObj.selectorName = selectorName;
            enabledCartSelectors.push(selectorObj);
          }
        });
      }
      this.output.enabledCartSelectors = enabledCartSelectors;
    };

    ClientInfoService.prototype.getBasicInfo = function() {
      var self = this;
      return PortService.sendAsyncMessage({ command : COMMANDS.BASIC_INFO }).
      then(function(message) {
        angular.extend(self.output, message.response);
        if(message.response.hasGiosg) {
          self.handleCartSettings(message.response.apiConfig);
        }
        return self.output;
      });
    };

    ClientInfoService.prototype.getRuleStates = function() {
      var self = this;
      return PortService.sendAsyncMessage({ command : COMMANDS.RULE_STATES }).
      then(function(message) {
        return message.response.ruleStates;
      });
    };

    ClientInfoService.prototype.editRuleCondition = function(ruleId, conditionIndex, newValue, newType) {
      var self = this;
      return PortService.sendAsyncMessage({
        command: COMMANDS.EDIT_RULE_CONDITION,
        ruleId: ruleId,
        conditionIndex: conditionIndex,
        value: newValue,
        type: newType
      }).then(function(message) {
        return message.response.ruleStates;
      });
    };

    ClientInfoService.prototype.matchRule = function(rule) {
      var self = this;
      return PortService.sendAsyncMessage({ command : COMMANDS.MATCHRULE, rule: rule }).
      then(function(message) {
        rule.match = message.response.match;
      });
    };

    ClientInfoService.prototype.runCart = function() {
      var self = this;
      return PortService.sendAsyncMessage({ command : COMMANDS.RUNCART }).
      then(function(message) {
        return message.response.cart;
      });
    };

    ClientInfoService.prototype.showClient  = function() {
      return PortService.sendAsyncMessage({ command : COMMANDS.SHOWCLIENT });
    };

    ClientInfoService.prototype.showButton  = function() {
      return PortService.sendAsyncMessage({ command : COMMANDS.SHOWBUTTON });
    };

    var service = new ClientInfoService();
    return service;
  }]);
