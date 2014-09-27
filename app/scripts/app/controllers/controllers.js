/* globals angular */

(function(angular, chrome) {
angular.module('popup')
  .controller('MainController', ['$scope', 'ClientInfoService', function($scope, ClientInfoService) {
      $scope.clientInfo = ClientInfoService.output;
      $scope.contribute = function() {
        ClientInfoService.getBasicInfo();
      };
  }]);
})(angular, chrome);