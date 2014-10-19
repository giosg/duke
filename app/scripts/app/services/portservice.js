/* globals chrome, angular */
(function(angular) {
  'use strict';

  angular.module('popup.services')
  .factory('PortService', ['$rootScope', '$q', '$log', function($rootScope, $q, $log) {

    function PortService() {
      this.port = null;
      this.queryCounter = 0;
      this.queries = {};
      var deferred = $q.defer();
      this.afterConnected = deferred.promise;
      this.connectionDeferred = deferred;
    }

    PortService.prototype.connect = function() {
      var self = this;
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        self.port = chrome.tabs.connect(tabs[0].id);
        self.connectionDeferred.resolve();
        self.port.onMessage.addListener(function() {
          self.onPortMessage.apply(self, arguments);
        });
      });
    };

    PortService.prototype.onPortMessage = function(message) {
      var self = this;
      if (message._type == "DUKERESPONSE") {
        $rootScope.$evalAsync(function() {
          if(self.queries[message.query]) {
            $log.log("[Duke.PortService] Got response to query", message.query, "with message", message);
            self.queries[message.query].resolve(message);
            delete self.queries[message.query];
          }
        });
      }
      else if (message._type == "DUKEMESSAGE") {
        var msgType = message.msgType;
        var msgArgs = message.msgArgs || [];
        if (msgType) {
          $rootScope.$evalAsync(function() {
            $log.log("[Duke.PortService] Got port message", msgType, "with arguments", msgArgs);
            $rootScope.$emit('portMessage:' + msgType, msgArgs);
          });
        }
      }
    };

    /**
     * Attachs a message listener. Returns the unlistener funcition.
     */
    PortService.prototype.onMessage = function(msgType, listener) {
      return $rootScope.$on('portMessage:' + msgType, function(event, msgArgs) {
        listener.apply(this, msgArgs);
      });
    };

    PortService.prototype.sendAsyncMessage = function(request) {
      var self = this;
      this.queryCounter = this.queryCounter + 1;
      var currentQuery = this.queryCounter;

      var deferred = $q.defer();
      this.queries[currentQuery] = deferred;

      // TODO: handle disconnected port
      this.afterConnected.then(function(){
        self.port.postMessage({
          query: currentQuery,
          request: request
        });
      });

      return deferred.promise;
    };

    var service = new PortService();
    service.connect();
    return service;

  }]);
})(angular);