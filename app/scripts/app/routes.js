/* globals angular */
(function (angular) {
  "use strict";

  angular.module("popup.routes", []).config([
    "$stateProvider",
    "$urlRouterProvider",
    function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise("/overview");

      $stateProvider
        .state("overview", {
          url: "/overview",
          templateUrl: "templates/overview.html",
          controller: "OverViewController",
          resolve: {
            clientInfo: [
              "ClientInfoService",
              function (ClientInfoService) {
                return ClientInfoService.getBasicInfo();
              },
            ],
          },
        })
        .state("rules", {
          url: "/rules",
          templateUrl: "templates/rules.html",
          controller: "RuleController as ruleController",
          resolve: {
            ruleStates: [
              "ClientInfoService",
              function (ClientInfoService) {
                return ClientInfoService.getRuleStates();
              },
            ],
          },
        })
        .state("cart", {
          url: "/cart",
          templateUrl: "templates/cart.html",
          controller: "CartController as cartController",
          resolve: {
            cart: [
              "ClientInfoService",
              function (ClientInfoService) {
                return ClientInfoService.runCart();
              },
            ],
          },
        });
    },
  ]);
})(angular);
