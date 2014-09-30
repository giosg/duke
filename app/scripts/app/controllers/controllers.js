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
    var self = this;

    self.getActionTypeLabel = function(actionType) {
      return ClientInfoService.output.ruleactionTypes[actionType];
    };

    self.getConditionTypeLabel = function(conditionType) {
      return ClientInfoService.output.ruleconditionTypes[conditionType];
    };

    self.loadRuleStates = function() {
      ClientInfoService.getRuleStates().then(function(ruleStates) {
        self.ruleStates = ruleStates;
      });
    };

  }])
  .controller('RuleConditionController', ['$scope', 'ClientInfoService', function($scope, ClientInfoService) {
    var self = this;
    self.isEditing = false;

    self.startEditing = function(condition) {
      self.isEditing = true;
      self.editedCondition = {
        value: condition.value,
        type: condition.type
      };
    };

    self.stopEditing = function() {
      self.isEditing = false;
    };

    self.submitRuleCondition = function(ruleId, conditionIndex) {
      self.stopEditing();
      ClientInfoService.editRuleCondition(ruleId, conditionIndex, self.editedCondition.value, self.editedCondition.type).then(function(ruleStates) {
        // TODO: Not an elegant way to access the parent controller
        $scope.ruleController.ruleStates = ruleStates;
      });
    };
  }])
  .controller('CartController', ['$scope', 'ClientInfoService', function($scope, ClientInfoService) {
      $scope.clientInfo = ClientInfoService.output;

      $scope.runCart = function() {
        ClientInfoService.runCart();
      };
  }]);
})(angular, chrome);