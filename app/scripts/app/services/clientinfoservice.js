
  var COMMANDS = {
    GIOSG_ENABLED: 'giosgEnabled',
    BASIC_INFO: 'basicInfo'
  };

  angular.module('popup.clientinfo', ['popup'])
  .factory('ClientInfoService', ['PortService', function(PortService) {
    function ClientInfoService() {
    }

    ClientInfoService.prototype.isGiosgEnabled = function() {
      return PortService.sendAsyncMessage({ command : COMMANDS.GIOSG_ENABLED });
    };

    ClientInfoService.prototype.getBasicInfo = function() {
      return PortService.sendAsyncMessage({ command : COMMANDS.BASIC_INFO });
    };

    var service = new ClientInfoService();
    return service;
  }]);
