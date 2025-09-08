// Import CSS dependencies
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/fonts.css';
import '../css/font-awesome.min.css';
import '../css/popup.css';

// Import JavaScript dependencies
import $ from 'jquery';
import _ from 'underscore';
import 'bootstrap/dist/js/bootstrap.min.js';
import angular from 'angular';
import 'angular-ui-router';
import 'angular-ui-bootstrap';

// Make jQuery and underscore globally available for AngularJS
window.$ = window.jQuery = $;
window._ = _;

// Import application modules
import './app/modules/angular-underscore.min.js';
import './app/app.js';
import './app/routes.js';
import './app/controllers/controllers.js';
import './app/services/services.js';
import './app/services/portservice.js';
import './app/services/clientinfoservice.js';
