/* globals angular */

(function(angular, chrome) {
angular.module('popup')
  .controller('MainController', ['$scope', 'PortService', function($scope, PortService) {
      $scope.welcomeMsg = "This is your first chrome extension";
      $scope.contribute = function() {
        PortService.isGiosgEnabled().then(function(res) {
            $scope.result = res;
        });
      };
  }]);
})(angular, chrome);