/* globals angular */

(function(angular, chrome) {
   angular.module('popup')
  .controller('OverViewController', ['$scope', 'clientInfo', 'ClientInfoService', 'PortService',
    function($scope, clientInfo, ClientInfoService, PortService) {
      $scope.currentVersion = "0.3.0";
      $scope.clientInfo = clientInfo;
      $scope.enableCobrowse = function() {
        ClientInfoService.enableCobrowse();
      };
      $scope.showCobrowse = function() {
        ClientInfoService.showCobrowse();
      };
      $scope.showClient = function() {
        ClientInfoService.showClient();
      };
      $scope.showButton = function() {
        ClientInfoService.showButton();
      };
      var unlistenCobrowse = PortService.onMessage('cobrowseLoaded', function(data) {
        $scope.cobrowse = data;
      });
      $scope.$on('$destroy', unlistenCobrowse);
  }])
  .controller('RuleController', [
              'ruleStates', '$scope', 'ClientInfoService', 'PortService', '$state',
              function(ruleStates, $scope, ClientInfoService, PortService, $state) {
    var self = this;
    self.ruleStates = ruleStates;
    self.clientInfo = ClientInfoService.output;

    self.getActionTypeLabel = function(actionType) {
      var label = ClientInfoService.output.ruleactionTypes[actionType];
      return label && label.replace(/_/g, ' ');
    };

    self.getConditionTypeLabel = function(conditionType) {
      var label = ClientInfoService.output.ruleconditionTypes[conditionType];
      return label && label.replace(/_/g, ' ');
    };

    self.getRulePanelClass = function(ruleItem) {
      return 'panel-' + self.getRuleClassSuffix(ruleItem);
    };

    self.getRuleLabelClass = function(ruleItem) {
      return 'label-' + self.getRuleClassSuffix(ruleItem);
    };

    self.getRuleClassSuffix = function(ruleItem) {
      if (ruleItem.state == 'pending') {
        return 'default';
      }
      else if (ruleItem.evented) {
        // Use 'danger' class if there is at least one non-matching condition that is not event condition
        var cannotMatch = _.some(ruleItem.ruleConditions.concat(ruleItem.commonConditions).concat(ruleItem.actionConditions), function(condition) {
          return !condition.evented && condition.state == 'passive';
        });
        return cannotMatch ? 'danger' : 'info';
      }
      else if (ruleItem.state == 'active') {
        return 'success';
      }
      return 'danger';
    };

    self.reload = function() {
      return $state.go('rules', null, {reload: true});
    };

    self.getConditionTitle = function(condition) {
      /*
       * Find the first block comment inside the condition string and use its contents as a title.
       * This also ignores any leading '!', used to avoid JS comment removal on obfuscation.
       */
      var match = /\/\*\!?\s*(.+?)\s*\*\//.exec(condition);
      return match ? match[1] : "[Custom condition]";
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
  .controller('CartController', ['$scope', '$state', 'cart',  function($scope, $state, cart) {
      var self = this;
      self.cart = cart;
      self.reload = function() {
        return $state.go('cart', null, {reload: true});
      };
  }])
  .controller('LoadMaskController', ['$scope', '$state', function($scope, $state) {
    var self = this;
    $scope.$watch(function() {
      return !!$state.transition;
    }, function(isVisible) {
      self.isVisible = isVisible;
    });
  }]);
})(angular, chrome);
