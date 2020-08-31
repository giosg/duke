(function (window, document, chrome) {
  "use strict";
  function DukeMessageProxy() {}

  DukeMessageProxy.prototype.injectPostMessageListener = function () {
    var s = document.createElement("script");
    // TODO: add "scripts/postmessagelistener.js" to web_accessible_resources in manifest.json
    s.src = chrome.extension.getURL("scripts/postmessagelistener.js");
    s.onload = function () {
      this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(s);
  };

  DukeMessageProxy.prototype.onPostMessage = function (event) {
    // We only accept messages from ourselves
    if (event.source != window) return;
    var type = event.data && event.data._type;
    if (type == "DUKERESPONSE" || type == "DUKEMESSAGE") {
      this.port.postMessage(event.data);
    }
  };

  DukeMessageProxy.prototype.onPortMessage = function (message) {
    message._type = "DUKEREQUEST";
    window.postMessage(message, "*");
  };

  DukeMessageProxy.prototype.attachProxyListeners = function () {
    var self = this;

    chrome.runtime.onConnect.addListener(function (port) {
      self.port = port;

      function onPortMessage() {
        self.onPortMessage.apply(self, arguments);
      }

      function onPostMessage() {
        self.onPostMessage.apply(self, arguments);
      }

      port.onMessage.addListener(onPortMessage);
      window.addEventListener("message", onPostMessage, false);

      port.onDisconnect.addListener(function () {
        port.onMessage.removeListener(onPortMessage);
        window.removeEventListener("message", onPostMessage);
      });
    });
  };

  var proxy = new DukeMessageProxy();
  proxy.attachProxyListeners();
  proxy.injectPostMessageListener();
})(window, document, chrome);
