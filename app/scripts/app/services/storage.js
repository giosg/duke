angular.module('popup', [])
  .factory('PortService', ['$rootScope', '$q', function($rootScope, $q) {
    function PortService() {
      this.port = null;
      this.queryCounter = 0;
      this.queries = {};
    }

    PortService.prototype.connect = function() {
      var self = this;
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        self.port = chrome.tabs.connect(tabs[0].id);
        self.port.onMessage.addListener(function() {
          self.onPortMessage.apply(self, arguments);
        });
      });
    };

    PortService.prototype.onPortMessage = function(message) {
      var self = this;
      $rootScope.$evalAsync(function() {
        if(self.queries[message.query]) {
          self.queries[message.query].resolve(message);
          delete self.queries[message.query].resolve(message);
        }
      });
    };

    PortService.prototype.sendAsyncMessage = function(request) {
      var self = this;
      this.queryCounter++;

      var deferred = $q.defer();
      this.queries[this.queryCounter] = deferred;

      // TODO: handle disconnected port
      this.port.postMessage({
        query: self.queryCounter,
        request: request
      });

      return deferred.promise;
    };

    var service = new PortService();
    service.connect();
    return service;

  }]);
