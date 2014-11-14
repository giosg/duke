/* globals GiosgClient, giosg, MooTools */
/* jshint eqnull: true */
(function(window, _giosg) {
  'use strict';
  var BASICFIELDS = ['apiConfig', 'companyId', 'domainId', 'locationCity', 'locationCountry', 'previousPurchases', 'rooms', 'sessionUuid', 'useCanonicalUrl', 'visitCount', 'visitorCid', 'visitorGid', 'visitorId'];


  function DukePostMessageClient() {
  }


  DukePostMessageClient.prototype.on_runCart = function(data) {
    var lastCartData = giosg.api.shoppingCart._previous_data_string;
    var cart = lastCartData ? JSON.parse(lastCartData) : {};
    this.sendResponse(data.query, { cart: cart });
  };

  DukePostMessageClient.prototype.on_ruleStates = function(data) {
    var self = this;
    var giosg = window.giosg, ruleEngine = giosg && giosg.ruleEngine, jGiosg = window.jGiosg;
    if (ruleEngine) {
      // Use the new Rule Engine
      var ruleStates = ruleEngine._getRuleStates(null, true);
      self.sendResponse(data.query, { ruleStates: ruleStates });
    } else if (giosg && giosg.rulesConfig && jGiosg && GiosgClient.ruleMatches) {
      // Convert the legacy rules to the correct format
      var rules = giosg.rulesConfig.getRules();
      var rulePromises = [];
      for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        rulePromises.push(GiosgClient.ruleMatches(rule));
      }
      jGiosg.when.apply(jGiosg, rulePromises).then(function(/* matchingRules... */) {
        var ruleStates = [];
        var matchingRules = arguments;
        for (var i = 0; i < matchingRules.length; i++) {
          var ruleMatches = !!matchingRules[i];
          var rule = rules[i];
          var ruleConditions = [];
          for (var j = 0; j < rule.conditions.length; j++) {
            var condition = rule.conditions[j];
            ruleConditions.push({
              condition: condition
            });
          }
          ruleStates.push({
            rule: rule,
            state: ruleMatches ? 'active' : 'passive',
            ruleConditions: ruleConditions,
            commonConditions: [],  // Does not exists in the old system
            actionConditions: []  // Does not exists in the old system
          });
        }
        self.sendResponse(data.query, { ruleStates: ruleStates });
      });
    } else {
      self.sendResponse(data.query, { ruleStates: [] });
    }
  };

  DukePostMessageClient.prototype.on_editRuleCondition = function(data) {
    var self = this, giosg = window.giosg, ruleEngine = giosg && giosg.ruleEngine;
    var ruleId = data.request.ruleId;
    var conditionIndex = data.request.conditionIndex;
    var newValue = data.request.value;
    var newType = data.request.type;
    console.log("Change " + (conditionIndex + 1) + "nth on rule #" + ruleId + " to type " + newType + " and value " + newValue);
    if (ruleEngine && ruleId != null && conditionIndex != null) {
      var rules = ruleEngine.getRules();
      for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (rule.id === ruleId) {
          var condition = rule.conditions[conditionIndex];
          if (condition) {
            if (newValue !== undefined && condition.value != newValue) {
              condition.value = newValue;
              console.log("Changed the condition value to ", newValue);
            }
            if (newType !== undefined && condition.type != newType) {
              condition.type = newType;
              console.log("Changed the condition type to ", newType);
            }
          }
        }
      }
      ruleEngine.refreshAllRules().always(function() {
        var ruleStates = ruleEngine._getRuleStates(null, true);
        self.sendResponse(data.query, { ruleStates: ruleStates });
      });
    }
  };

  DukePostMessageClient.prototype.on_matchRule = function(data) {
    var self = this;
    GiosgClient.ruleMatches(data.request.rule).then(function(match) {
      self.sendResponse(data.query, { match: !! match });
    });
  };

  DukePostMessageClient.prototype.checkCompatibility = function () {
    var isCompatible = true;
    if (typeof(MooTools) == 'object') {
      var ver = MooTools.version.split('.');
      if (parseInt(ver[0], 10) < 2 && parseInt(ver[1], 10) < 5) {
        isCompatible = false;
      }
    }
    return isCompatible;
  };

  DukePostMessageClient.prototype.inverseObject = function(obj) {
    var inversed = {};
    Object.keys(obj).forEach(function(key) {
      inversed[obj[key]] = key;
    });
    return inversed;
  };

  DukePostMessageClient.prototype.on_basicInfo = function(data) {
    var response = {};
    response.hasGiosg = window.giosg && typeof window.giosg == 'object';
    if(response.hasGiosg) {
      BASICFIELDS.forEach(function(f) {
        response[f] = giosg[f];
      });
      response.ruleactionTypes = this.inverseObject(giosg.rulesConfig.actionTypes);
      response.ruleconditionTypes = this.inverseObject(giosg.rulesConfig.conditionTypes);
      response.rules = giosg.rulesConfig.getRules();
      response.ruleEngine = !!giosg.ruleEngine;
    }
    response.isCompatible = this.checkCompatibility();
    this.sendResponse(data.query, response);
  };

  DukePostMessageClient.prototype.on_showClient = function(data) {
    GiosgClient.createChatDialog();
    GiosgClient.showClient();
    this.sendResponse(data.query, {});
  };

  DukePostMessageClient.prototype.on_showButton = function(data) {
    GiosgClient._createChatButton();
    GiosgClient.showChatButton();
    this.sendResponse(data.query, {});
  };

  DukePostMessageClient.prototype.onPostMessage = function(event) {
    if (event.source != window)
      return;
    if(event.data._type == 'DUKEREQUEST') {
      var methodName = 'on_'+ event.data.request.command;
      if (this[methodName]) {
        this[methodName](event.data);
      }
    }
  };

  DukePostMessageClient.prototype.sendResponse = function(query, response) {
    window.postMessage({ _type: 'DUKERESPONSE', query: query, response: response }, '*');
  };

  DukePostMessageClient.prototype.sendMessage = function(msgType /* , msgParams */) {
    var msgArgs = Array.prototype.slice.call(arguments, 1);
    window.postMessage({ _type: 'DUKEMESSAGE', msgType: msgType, msgArgs: msgArgs }, '*');
  };

  DukePostMessageClient.prototype.attachPostMessageListener = function() {
    var self = this;
    window.addEventListener('message', function(evt) { self.onPostMessage(evt); }, false);
  };

  var client = new DukePostMessageClient();
  client.attachPostMessageListener();

  function onGiosgApiReady() {
    // Giosg API is now ready!
    var giosg = window.giosg, ruleEngine = giosg && giosg.ruleEngine;
    if (ruleEngine) {
      ruleEngine.onRefreshStart(function() {
        client.sendMessage('ruleStateChange', ruleEngine._getRuleStates(null, true));
      });
      ruleEngine.onRefreshEnd(function() {
        client.sendMessage('ruleStateChange', ruleEngine._getRuleStates(null, true));
      });
    }
  }

  // If the _giosg function is available then use it to attach listeners to the public giosg API
  if (typeof _giosg === 'function') {
    _giosg(onGiosgApiReady);
  }

})(window, window._giosg);
