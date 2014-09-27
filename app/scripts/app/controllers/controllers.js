/* globals angular */

(function(angular, chrome) {
angular.module('popup')
  .controller('MainController', ['$scope', 'ClientInfoService', function($scope, ClientInfoService) {
      $scope.welcomeMsg = "This is your first chrome extension";
      $scope.contribute = function() {
        ClientInfoService.getBasicInfo().then(function(res) {
            $scope.result = res;
        });
      };
  }]);
})(angular, chrome);