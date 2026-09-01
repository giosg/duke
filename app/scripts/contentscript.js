(function (window, document, chrome) {
  "use strict";
  
  function DukeMessageProxy() {}

  DukeMessageProxy.prototype.injectPostMessageListener = function () {
    var s = document.createElement("script");
    // TODO: add "scripts/postmessagelistener.js" to web_accessible_resources in manifest.json
    s.src = chrome.runtime.getURL("scripts/postmessagelistener.js");
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
      if (this.port) {
        this.port.postMessage(event.data);
      }
    }
  };

  DukeMessageProxy.prototype.onPortMessage = function (message) {
    message._type = "DUKEREQUEST";
    window.postMessage(message, "*");
  };

  DukeMessageProxy.prototype.attachProxyListeners = function () {
    var self = this;
    self.isReady = true; // Mark as ready when listeners are attached

    // Listen for port connections from popup
    chrome.runtime.onConnect.addListener(function (port) {
      self.port = port;

      // Send ready signal immediately upon connection
      setTimeout(function() {
        if (self.port) {
          self.port.postMessage({ _type: 'DUKE_CONTENT_READY' });
        }
      }, 10);

      function onPortMessage(message) {
        self.onPortMessage(message);
      }

      function onPostMessage(event) {
        self.onPostMessage(event);
      }

      port.onMessage.addListener(onPortMessage);
      window.addEventListener("message", onPostMessage, false);

      port.onDisconnect.addListener(function () {
        port.onMessage.removeListener(onPortMessage);
        window.removeEventListener("message", onPostMessage);
        self.port = null;
      });
    });
  };

  var proxy = new DukeMessageProxy();
  proxy.attachProxyListeners();
  proxy.injectPostMessageListener();
})(window, document, chrome);
