/* globals GiosgClient, giosg, MooTools */
/* jshint eqnull: true */
(function (window, _giosg) {
  "use strict";
  var BASICFIELDS = [
    "apiConfig",
    "companyId",
    "domainId",
    "locationCity",
    "locationCountry",
    "previousPurchases",
    "rooms",
    "sessionUuid",
    "useCanonicalUrl",
    "visitCount",
    "visitorCid",
    "visitorGid",
    "visitorId",
  ];

  function DukePostMessageClient() {}

  DukePostMessageClient.prototype.on_enableCobrowse = function (data) {
    var self = this;
    var cobrowse_iframe = document.querySelector("iframe.__gcbsess_frame");
    if (!cobrowse_iframe) {
      (function () {
        window.__giosg_cbconfig = {
          logLevel: 3,
          ui: true,
          passwords: false,
          blacklist: [],
          protected: [],
          disabled: [],
          disabledUrls: [],
          hidden: [],
          widgets: { launchButton: false },
        };
        var script = document.createElement("script");

        script.src =
          "https://api.giosgcobrowse.com/static/visitor/cobrowse.loader2.js";
        document.body.appendChild(script);
        self.sendMessage("cobrowseLoaded", true);
      })();
    }
  };

  DukePostMessageClient.prototype.on_showCobrowse = function (data) {
    var customEvent = document.createEvent("Event");
    customEvent.initEvent("CoBrowse::VisitorShow", true, false);
    document.dispatchEvent(customEvent);
  };

  DukePostMessageClient.prototype.on_runCart = function (data) {
    var lastCartData = giosg.api.shoppingCart._previous_data_string;
    var cart = lastCartData ? JSON.parse(lastCartData) : {};
    this.sendResponse(data.query, { cart: cart });
  };

  DukePostMessageClient.prototype.on_ruleStates = function (data) {
    var self = this;
    var giosg = window.giosg,
      ruleEngine = giosg && giosg.ruleEngine,
      jGiosg = window.jGiosg;
    if (ruleEngine) {
      var ruleStates = ruleEngine._getRuleStates(null, true);
      self.sendResponse(data.query, { ruleStates: ruleStates });
    } else {
      self.sendResponse(data.query, { ruleStates: [] });
    }
  };

  DukePostMessageClient.prototype.on_editRuleCondition = function (data) {
    var self = this,
      giosg = window.giosg,
      ruleEngine = giosg && giosg.ruleEngine;
    var ruleId = data.request.ruleId;
    var conditionIndex = data.request.conditionIndex;
    var newValue = data.request.value;
    var newType = data.request.type;
    if (ruleEngine && ruleId != null && conditionIndex != null) {
      var rules = ruleEngine.getRules();
      for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (rule.id === ruleId) {
          var condition = rule.conditions[conditionIndex];
          if (condition) {
            if (newValue !== undefined && condition.value != newValue) {
              condition.value = newValue;
            }
            if (newType !== undefined && condition.type != newType) {
              condition.type = newType;
            }
          }
        }
      }
      ruleEngine.refreshAllRules().always(function () {
        var ruleStates = ruleEngine._getRuleStates(null, true);
        self.sendResponse(data.query, { ruleStates: ruleStates });
      });
    }
  };

  DukePostMessageClient.prototype.on_matchRule = function (data) {
    var self = this;
    GiosgClient.ruleMatches(data.request.rule).then(function (match) {
      self.sendResponse(data.query, { match: !!match });
    });
  };

  DukePostMessageClient.prototype.checkCompatibility = function () {
    var isCompatible = true;
    if (typeof MooTools == "object") {
      var ver = MooTools.version.split(".");
      if (parseInt(ver[0], 10) < 2 && parseInt(ver[1], 10) < 5) {
        isCompatible = false;
      }
    }
    return isCompatible;
  };

  DukePostMessageClient.prototype.inverseObject = function (obj) {
    var inversed = {};
    Object.keys(obj).forEach(function (key) {
      inversed[obj[key]] = key;
    });
    return inversed;
  };

  DukePostMessageClient.prototype.on_basicInfo = function (data) {
    var response = {};
    response.hasGiosg = window.giosg && typeof window.giosg == "object";
    if (response.hasGiosg) {
      BASICFIELDS.forEach(function (f) {
        response[f] = giosg[f];
      });
      response.ruleactionTypes = this.inverseObject(
        giosg.rulesConfig.actionTypes
      );
      response.ruleconditionTypes = this.inverseObject(
        giosg.rulesConfig.conditionTypes
      );
      response.rules = giosg.ruleEngine.getRules();
    }
    response.isCompatible = this.checkCompatibility();
    this.sendResponse(data.query, response);
  };

  DukePostMessageClient.prototype.on_showClient = function (data) {
    GiosgClient.createChatDialog();
    GiosgClient.showClient();
    this.sendResponse(data.query, {});
  };

  DukePostMessageClient.prototype.on_showButton = function (data) {
    GiosgClient._createChatButton();
    GiosgClient.showChatButton();
    this.sendResponse(data.query, {});
  };

  DukePostMessageClient.prototype.onPostMessage = function (event) {
    if (event.source != window) return;
    if (event.data._type == "DUKEREQUEST") {
      var methodName = "on_" + event.data.request.command;
      if (this[methodName]) {
        this[methodName](event.data);
      }
    }
  };

  DukePostMessageClient.prototype.sendResponse = function (query, response) {
    window.postMessage(
      { _type: "DUKERESPONSE", query: query, response: response },
      "*"
    );
  };

  DukePostMessageClient.prototype.sendMessage = function (
    msgType /*, msgParams*/
  ) {
    var msgArgs = Array.prototype.slice.call(arguments, 1);
    window.postMessage(
      { _type: "DUKEMESSAGE", msgType: msgType, msgArgs: msgArgs },
      "*"
    );
  };

  DukePostMessageClient.prototype.attachPostMessageListener = function () {
    var self = this;
    window.addEventListener(
      "message",
      function (evt) {
        self.onPostMessage(evt);
      },
      false
    );
  };

  var client = new DukePostMessageClient();
  client.attachPostMessageListener();

  function onGiosgApiReady() {
    // Giosg API is now ready!
    var giosg = window.giosg,
      ruleEngine = giosg && giosg.ruleEngine;
    if (ruleEngine) {
      const original = ruleEngine.refreshAllRules;
      ruleEngine.refreshAllRules = (...args) => {
        return original.apply(ruleEngine, args).then(() => {
          client.sendMessage(
            "ruleStateChange",
            ruleEngine._getRuleStates(null, true)
          );
        });
      };
    }
  }

  // If the _giosg function is available then use it to attach listeners to the public giosg API
  if (typeof _giosg === "function") {
    _giosg(onGiosgApiReady);
  }

  setInterval(function () {
    var loaded = false;
    if (document.querySelector("iframe.__gcbsess_frame")) {
      loaded = true;
    }
    client.sendMessage("cobrowseLoaded", loaded);
  }, 1000);
})(window, window._giosg);
