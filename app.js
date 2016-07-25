'use strict'

var billApp = angular.module('billApp', ['ngRoute'], function() {});


//设置路由器
billApp.config(function($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'modules/index/index.html',
            // controller: 'indexCtrl'       
        }).when('/goods', {
            templateUrl: 'modules/goods/index.html',
            // controller: 'indexCtrl'       
        }).when('/error', {
            templateUrl: 'partials/error.html'
        })
        .otherwise({
            redirectTo: '/'
        });
});