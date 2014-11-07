/* globals angular */
(function(angular) {
  'use strict';

  // Declare app level module which depends on filters, and services
  angular.module('popup', [
    'ui.router',
    'ui.bootstrap',
    'popup.services',
    'popup.routes'
  ]);
})(angular);
