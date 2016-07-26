'use strict'


billApp.factory('areaGet', ['$http', '$q', function ($http, $q) {  
  return {  
    query : function(pid) {  
      var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
     $http({
		method: 'post',
		url: '/index.php/websmall/client/recvarea_area',
		params: {
			pid: pid,
		}
	  }).  
      success(function(data, status, headers, config) {  
        deferred.resolve(data);  // 声明执行成功，即http请求数据成功，可以返回数据了  
      }).  
      error(function(data, status, headers, config) {  
        deferred.reject(data);   // 声明执行失败，即服务器返回错误  
      });  
      return deferred.promise;   // 返回承诺，这里并不是最终数据，而是访问最终数据的API  
    } // end query  
  };  
}]);

billApp.controller('addCtrl',['$scope','$http','$q','$location','areaGet',function($scope, $http, $q, $location,areaGet) {	

		$scope.number = 1;
		$scope.previewHtml = '';
		$scope.clientInfo = {
	      'recv_name' : $location.search().recv_name,
	      'recv_phone' : $location.search().recv_phone,
	      'province' : $location.search().province,
	      'city' : $location.search().city,
	      'district' : $location.search().district,
	      'address' : $location.search().address,
	    };	

		$scope.init = function() {			
			
			$scope.areaReload('province', true);

		};

		$scope.areaReload = function(area_item, default_value){

			$scope.province = '';
			$scope.city = '';
			$scope.district = '';		
			var promise = areaGet.query(0); 
			promise.then(function(data) {  // 调用承诺API获取数据 .resolve  
		        $scope.provinceModel = data.infor;  
		        console.log($scope.provinceModel);
		    }, function(data) {  // 处理错误 .reject   
		    });  
			
			
			
		};

		
	}]
);