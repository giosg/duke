/* globals GiosgClient, giosg */
(function(window) {
  'use strict';

  function DukePostMessageClient() {

  }

  DukePostMessageClient.prototype.on_giosgEnabled = function() {
    return {"FOO": "BAR"};
  };

  DukePostMessageClient.prototype.onPostMessage = function(event) {
    if (event.source != window)
      return;
    if(event.data._type == 'DUKEREQUEST') {
      var methodName = 'on_'+ event.data.request.command;
      var response;
      if (this[methodName]) {
        response = this[methodName](event.data);
      }
      window.postMessage({ _type: 'DUKERESPONSE', query: event.data.query, response: response }, '*');
    }
  };

  DukePostMessageClient.prototype.attachPostMessageListener = function() {
    var self = this;
    window.addEventListener('message', function(evt) { self.onPostMessage(evt); }, false);
  };

  var client = new DukePostMessageClient();
  client.attachPostMessageListener();
})(window);