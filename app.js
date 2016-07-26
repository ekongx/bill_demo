'use strict'


var billApp = angular.module('billApp', ['ngRoute']).run(function($rootScope) {
    $rootScope.today = new Date();
});


//设置路由器
billApp.config(function($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'modules/add/add.html',
            controller: 'addCtrl'       
        }).when('/goods', {
            templateUrl: 'modules/goods/index.html',
            // controller: 'indexCtrl'       
        }).otherwise({
            redirectTo: '/'
        });
});

//url获取
billApp.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode(true);
}]);