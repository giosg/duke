/* globals angular */

(function(angular, chrome) {
   angular.module('popup')
  .controller('MainController', ['$scope', function($scope) {
  }])
  .controller('OverViewController', ['$scope', 'ClientInfoService', function($scope, ClientInfoService) {
      $scope.clientInfo = ClientInfoService.output;
      $scope.getBasicInfo = function() {
        ClientInfoService.getBasicInfo();
      };
  }])
  .controller('RuleController', ['$scope', 'ClientInfoService', function($scope, ClientInfoService) {
      $scope.clientInfo = ClientInfoService.output;
      $scope.getBasicInfo = function() {
        ClientInfoService.getBasicInfo().then(function() {
          angular.forEach($scope.clientInfo.rules, function(rule) {
            $scope.runRule(rule);
          });
        });
      };

      $scope.runRule = function(rule) {
        ClientInfoService.matchRule(rule);
      };
  }]);
})(angular, chrome);