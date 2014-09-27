/* globals GiosgClient, giosg */
(function(window) {
  'use strict';
  var BASICFIELDS = ['apiConfig', 'companyId', 'domainId', 'locationCity', 'locationCountry', 'previousPurchases', 'rooms', 'sessionUuid', 'useCanonicalUrl', 'visitCount', 'visitorCid', 'visitorGid', 'visitorId'];
  function DukePostMessageClient() {
  }

  DukePostMessageClient.prototype.on_giosgEnabled = function() {
    return { 'FOO': 'BAR'};
  };

  DukePostMessageClient.prototype.on_basicInfo = function() {
    var response = {};
    response.hasGiosg = window.giosg && typeof window.giosg == 'object';
    if(response.hasGiosg) {
      BASICFIELDS.forEach(function(f) {
        response[f] = giosg[f];
      });
      response.rules = giosg.rulesConfig.getRules();
    }
    return response;
  };


  DukePostMessageClient.prototype.onPostMessage = function(event) {
    if (event.source != window)
      return;
    if(event.data._type == 'DUKEREQUEST') {
      var methodName = 'on_'+ event.data.request.command;
      var response;
      console.log(methodName);
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