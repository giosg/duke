
  var COMMANDS = {
    GIOSG_ENABLED: 'giosgEnabled',
    BASIC_INFO: 'basicInfo'
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
      angular.forEach(apiConfig.cartSelectors, function(selectorObj, selectorName) {
        if(selectorObj.type != "0") {
          // selector enabled
          selectorObj.selectorName = selectorName;
          enabledCartSelectors.push(selectorObj);
        }
      });
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
      });
    };

    var service = new ClientInfoService();
    return service;
  }]);
