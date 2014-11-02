/* globals angular */
(function(angular) {
  'use strict';

  angular.module('popup.routes', [])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/overview');

    $stateProvider
      .state('overview', {
        url: '/overview',
        templateUrl: 'templates/overview.html',
        controller: 'OverViewController'
      })
      .state('rules', {
        url: '/rules',
        templateUrl: 'templates/rules.html',
        controller: 'RuleController as ruleController'
      })
      .state('cart', {
        url: '/cart',
        templateUrl: 'templates/cart.html',
        controller: 'CartController'
      })
    ;
  }]);

})(angular);
