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
billApp.factory('productGet', ['$http', '$q', function ($http, $q) {  
  return {  
    query : function(goodsid) {  
      var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
      $http({
		method: 'post',
		url: '/index.php/Webadmin/Goods2/combobox_data_product?goodsid=',
		params: {
			goodsid: goodsid,
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
billApp.factory('productShow', ['$http', '$q', function ($http, $q) {  
  return {  
    query : function(prodcutId) {  
      var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
      $http({
		method: 'post',
		url: '/index.php/Webadmin/ClientBill/product_get',
		params: {
			id: prodcutId,
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
billApp.directive("goods", ['$compile', function ($compile) {
    return {
        restrict: "EA",
        replace: true,
        template: "<div>{{item}}</div>",
        scope: {
            item: "="
        },
        link: function (scope, element, attrs) {
            var item = null;
            if (scope.item !== undefined) {
                item = '<' + scope.item;
                item += "></" + scope.item + '>';
            }
            element.html(item);
            $compile(element.contents())(scope);
        }
    };
}]);
billApp.controller('addCtrl',['$scope','$http','$q','$location','areaGet','$compile','productGet','productShow',function($scope, $http, $q, $location,areaGet,$compile,productGet,productShow) {	

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
			$scope.addGoods();	

		};
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
		$scope.areaReload = function(){

			$scope.province = '';
			$scope.city = '';
			$scope.district = '';		
			var promise = areaGet.query(0); 
			promise.then(function(data) {  
		        $scope.provinceModel = data.infor;  
		    });  			
		};

		$scope.citySelect = function(){
			console.log($scope.areaReload.province);
			var provinceId = $scope.areaReload.province.id;
			var promise = areaGet.query(provinceId); 
			promise.then(function(data) { 
		        $scope.cityModel = data.infor;  
		    });  

		};

		$scope.districtSelect = function(){

			var cityId = $scope.areaReload.city.id;
			var promise = areaGet.query(cityId); 
			promise.then(function(data) {  
		        $scope.districtModel = data.infor;  
		    });  			
		};

		$scope.addGoods = function(){
			
			if($scope.number > 1) {
				var del = '<div class="col-sm-5">'+
		            '<label class="btn btn-default btn-sm btn-rounded fr" ng-click="goodsDel('+$scope.number+')">'+
		            '<i class="fa fa-trash-o mg-r-xs"></i>删除</label>'+
		            '</div>';
	        }
	        else{
	        	var del = '';
	        }

			var html = '<div class="goods-list" id="list'+$scope.number+'">'+
	            '<div class="form-group">'+
	            '<label class="col-sm-1 control-label">选择商品</label>'+
	            '<div class="col-sm-6">'+
	            '<div class="input-group">'+
	            '<input type="text" class="form-control" id="goodsInput" name="goodsname[]">'+
	            '<div class="input-group-btn">'+
	            '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">'+
	            '<span class="caret"></span>'+
	            '</button>'+
	            '<ul class="dropdown-menu dropdown-menu-right" role="menu"></ul>'+
	            '</div></div></div>'+ 
	             del +           
	            '</div>'+
	            '<div class="form-group">'+
	            '<label class="col-sm-1 control-label">选择规格</label>'+
	            '<div class="col-sm-2">'+
	            '<select class="form-control" id="goodsProduct" ng-model="productCheck.productList" ng-options="m.name for m in productModel" ng-change="productSelect(productModel.id)" >'+
	            '<option value="">请选择</option>'+
	            '</select>'+
	            '<input type="hidden" id="product_id" name="product_id[]">'+
	            '</div>'+
	            '<label class="col-sm-1 control-label">SKU</label>'+
	            '<div class="col-sm-2">'+
	            '<input type="text" class="form-control" value="{{ skucode }}" id="skucode" name="skucode[]" readonly>'+
	            '</div>'+
	            '<label class="col-sm-1 control-label">价格</label>'+
	            '<div class="col-sm-2">'+
	            '<input type="text" class="form-control" value="{{ price }}" id="price" name="price[]" readonly>'+
	            '</div>'+ 
	            '<label class="col-sm-1 control-label">数量</label>'+
	            '<div class="col-sm-1">'+
	            '<input type="number" class="form-control" id="buycount" value="1" name="buycount[]">'+
	            '</div>'+
	            '</div>'+
	            '</div>';
	        
	        $("#goods").append($compile(html)($scope));
	        $scope.selectInit($scope.number);
	        $scope.number++;
	        

		};

		$scope.goodsDel = function(flag){
			console.log('tt');
			$('#list'+flag).remove();
            $scope.number--;
		};

		$scope.selectInit = function(flag){ //商品选择初始化
	        $('#list'+flag+' #goodsInput').bsSuggest({

	            url: "/index.php/Webadmin/Goods2/combobox_data_goods?q=",
	            ignorecase: true,
	            showHeader: true,
	            showBtn: false,    
	            delayUntilKeyup: true,
	            idField: "id",
	            keyField: "name"

	        }).on('onSetSelectValue', function (e, keyword, data) {
	            $scope.productCheck(keyword.id,flag);

	        }).on('onUnsetSelectValue', function () {
	            // billApi.productShow(0,flag);
	        });
	    };

	    $scope.productCheck = function(id,flag,type){  // 生成商品规格	    	
	    	var promise = productGet.query(id); 
			promise.then(function(data) {  
				$scope.productModel = data.infor;						        
		    });  		

	    };

	    $scope.productSelect = function(){
	    	var id = $scope.productCheck.productList.id;
	    	var promise = productShow.query(id); 
			promise.then(function(data) { 
				$scope.skucode = data.infor.skucode;		        
				$scope.price = data.infor.baseprice;		        
		    });  		

	    };

	    $scope.billFeetotal = function(){ //计算总的商品价格

            var feetotal = 0;
            feetotal += $('#price').val() * $('#buycount').val();
            feetotal = Math.max(0,feetotal).toFixed(2);
            $("#feetotal").val(feetotal);

	    };

	    $scope.billPromotion = function(){ //自动计算优惠价格

	    	$scope.feepayment = 0;
        	var promotion = 0;
	        var feetotal = $("#feetotal").val();
	        var feepostage = $("#feepostage").val();
	        var feepayment = $("#feepayment").val();
	        if (feepayment > 0) {
	            promotion = Math.round(feetotal*100)/100 + Math.round(feepostage*100)/100 -  Math.round(feepayment*100)/100;
	            promotion =  Math.max(0, promotion).toFixed(2);
	            console.log(feepayment);
	            $("#promotion").val(promotion);
	        }
    	};

		
	}]
);