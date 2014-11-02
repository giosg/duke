/* globals angular */

(function(angular, chrome) {
   angular.module('popup')
  .controller('OverViewController', ['$scope', 'clientInfo', function($scope, clientInfo) {
      $scope.clientInfo = clientInfo;
  }])
  .controller('RuleController', [
              'ruleStates', '$scope', 'ClientInfoService', 'PortService',
              function(ruleStates, $scope, ClientInfoService, PortService) {

    var self = this;
    self.ruleStates = ruleStates;
    self.clientInfo = ClientInfoService.output;

    self.getActionTypeLabel = function(actionType) {
      return ClientInfoService.output.ruleactionTypes[actionType];
    };

    self.getConditionTypeLabel = function(conditionType) {
      return ClientInfoService.output.ruleconditionTypes[conditionType];
    };

    self.getRulePanelClass = function(ruleItem) {
      if (ruleItem.state == 'pending') {
        return 'panel-default';
      }
      else if (ruleItem.evented) {
        // Use 'danger' class if there is at least one non-matching condition that is not event condition
        var cannotMatch = _.some(ruleItem.ruleConditions.concat(ruleItem.commonConditions).concat(ruleItem.actionConditions), function(condition) {
          return !condition.evented && condition.state == 'passive';
        });
        return cannotMatch ? 'panel-danger' : 'panel-info';
      }
      else if (ruleItem.state == 'active') {
        return 'panel-success';
      }
      return 'panel-danger';
    };

    // Listen for rule state changes and unlisten when the $scope gets destroyed
    var unlistenRules = PortService.onMessage('ruleStateChange', function(ruleStates) {
      self.ruleStates = ruleStates;
    });
    $scope.$on('$destroy', unlistenRules);
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
  .controller('CartController', ['$scope', 'clientInfo', function($scope, clientInfo) {
      $scope.clientInfo = clientInfo;
  }]);
})(angular, chrome);