var billApi = {
    number:1,
    previewHtml:'',
    init:function(){ //页面初始化
        if (localStorage.getItem('sidebar')){
            menu.minSidebar();
        }
        var flag = this.number;
        $("#goods").append(billApi.content(flag));
        this.selectInit(flag);
        $('.help').tooltip();
        this.productSelect(flag);
        this.billPromotion();
        AppCommon.ajaxLoadingDelay = 2000;
        this.area_reload('province', true);
        this.number++;
    },
    add:function(){ //新增商品
        var flag = this.number;
        $("#goods").append(billApi.content(flag));
        this.selectInit(flag);
        this.productSelect(flag);
        this.number++;
    },
    goodDel:function(flag){ //删除商品
        if (flag == 1) {
            AppDialog.alert('禁止删除');
            return false;
        }else{
            $('#list'+flag).remove();
            this.number--;
            this.billFeetotal(1);
        }
    },
    empty:function(){
        location.reload()
    },
    content:function(flag){ //商品内容
        if (this.number > 1) {
            var del = '<div class="col-sm-5">'+
            '<label class="btn btn-default btn-sm btn-rounded fr" onclick="billApi.goodDel('+flag+');">'+
            '<i class="fa fa-trash-o mg-r-xs"></i>删除</label>'+
            '</div>';
        }else{
            var del = '';
        }
        var html = '<div class="goods-list" id="list'+flag+'">'+
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
            '<select class="form-control" id="goodsProduct" ></select>'+
            '<input type="hidden" id="product_id" name="product_id[]">'+
            '</div>'+
            '<label class="col-sm-1 control-label">SKU</label>'+
            '<div class="col-sm-2">'+
            '<input type="text" class="form-control" value="" id="skucode" name="skucode[]" readonly>'+
            '</div>'+
            '<label class="col-sm-1 control-label">价格</label>'+
            '<div class="col-sm-2">'+
            '<input type="text" class="form-control" value="" id="price" name="price[]" readonly>'+
            '</div>'+
            '<label class="col-sm-1 control-label">数量</label>'+
            '<div class="col-sm-1">'+
            '<input type="number" class="form-control" id="buycount" value="1" name="buycount[]" style="padding-right:0">'+
            '</div>'+
            '</div>'+
            '</div>';
        return html;
    },
    selectInit:function(flag){ //商品选择初始化
         $('#list'+flag+' #goodsInput').bsSuggest({

            url: "/index.php/Webadmin/Goods2/combobox_data_goods?q=",
            getDataMethod: 'url',
            delayUntilKeyup: true,
            allowNoKeyword: true,
            ignorecase: true,
            showHeader: true,
            showBtn: false,
            idField: "id",
            keyField: "name",

        }).on('onSetSelectValue', function (e, keyword, data) {
            if ($('#billsource option:selected').val() == '0') {
                AppDialog.alert('请选择订单来源');
                $('#list'+flag+' #goodsInput').val('');
                return false;
            }
            billApi.productCheck(keyword.id,flag);
        }).on('onUnsetSelectValue', function () {
            billApi.productShow(0,flag);
        });
    },
    productCheck:function(id,flag){  // 生成商品规格
         AjaxLoader.get('/index.php/Webadmin/Goods2/combobox_data_product?goodsid=' + id, function(data) {
            console.log(data);
            if (data) {
                var k;
                var content = '<option data-id="0">请选择规格</option>';
                for (k in data) {
                    var row = data[k];
                    content += '<option data-id="' + row.id + '">' + row.name + '</option>';
                }
                $('#list'+flag+' #goodsProduct').empty().append(content);
            }
        });
    },
    productSelect:function(flag){ //规格发生变化
        $('#list'+flag+' #goodsProduct').change(function(){
            var prodcutId = $(this).children('option:selected').attr('data-id');
            $('#list'+flag+' #product_id').val(prodcutId);
            billApi.productShow(prodcutId,flag);
        });
    },
    productShow:function(prodcutId,flag){ //规格选择后显示相应sku和价格
        if (prodcutId != 0) {
             AjaxLoader.get('/index.php/Webadmin/ClientBill/product_get?id=' + prodcutId, function(data) {
                console.log(data);
                if (data) {
                    $('#list'+flag+' #price').val(data.baseprice);
                    if (data.skucode == '') {
                        $('#list'+flag+' #skucode').val('无SUK编码');
                    }else{
                        $('#list'+flag+' #skucode').val(data.skucode);
                    }
                }
            });
        }else{
            var content = '<option data-id="0">请选择规格</option>';
            $('#list'+flag+' #goodsProduct').empty().append(content);
            $('#list'+flag+' #skucode').val('');
            $('#list'+flag+' #price').val('');

        }
    },
    billinfoCheck:function(){   //计算商品总价时，检测必选项
        for(var i=1;i<this.number;i++){
            if ($('#list'+i+' #goodsInput').val() == '') {
                AppDialog.alert('请选择商品');
                return false;
            }
            if ($('#list'+i+' #goodsProduct').find("option:selected").attr('data-id') == 0) {
                AppDialog.alert('请选择商品对应的规格');
                return false;
            }
        }
    },
    billFeetotal:function(delFlag){ //计算总的商品价格
        this.billinfoCheck();
        if (delFlag) {
            $("#feetotal_sum").val('');
        }else{
            var feetotal = 0;
            for(var i=1;i<this.number;i++){
                feetotal += $('#list'+i+' #price').val() * $('#list'+i+' #buycount').val();
            }
            feetotal = Math.max(0,feetotal).toFixed(2);
            $("#feetotal").val(feetotal);
        }

    },
    billPromotion:function(){ //自动计算优惠价格
        var promotion = 0;
        $('#feepostage').change(function(){
             $('#feepayment').val('');
        });
        $('#feepayment').change(function(){
            var feetotal = $("#feetotal").val();
            var feepostage = $("#feepostage").val();
            var feepayment = $("#feepayment").val();
            if (feepayment > 0) {
                promotion = Math.round(feetotal*100)/100 + Math.round(feepostage*100)/100 -  Math.round(feepayment*100)/100;
                promotion =  Math.max(0, promotion).toFixed(2);
                $("#promotion").val(promotion);
            }
        });
    },
    preview:function(form){ //预览
        var phone = form.recv_phone.value,
            username = form.recv_name.value,
            grade = form.grade.value,
            recv_province = $('#province option:selected').text(),
            recv_city = $('#city option:selected').text(),
            recv_district = $('#district option:selected').text(),
            billsource = $('#billsource option:selected').text(),
            admin_name =form.admin_name.value,
            recv_address = form.recv_address.value,
            feepayment = form.feepayment.value,
            feepostage = form.feepostage.value,
            promotion = form.promotion.value,
            feetotal = form.feetotal.value,
            content = form.content.value,
            goods = '';
        for(var i=1;i<this.number;i++){
             var goodsname = $('#list'+i+' #goodsInput').val(),
                 goodsProduct = $('#list'+i+' #goodsProduct').val(),
                 skucode = $('#list'+i+' #skucode').val(),
                 price = $('#list'+i+' #price').val(),
                 buycount = $('#list'+i+' #buycount').val();
             goods += '<p>'+
            '<span class="preview-title">货品：</span><span class="preview-content" style="display:inline-block;min-width:260px">'+goodsname+'</span>'+
            '<span class="preview-title">规格：</span><span class="preview-content" style="display:inline-block;min-width:160px">'+goodsProduct+'</span>'+
            '<span class="preview-title">SKU：</span><span class="preview-content">'+skucode+'</span>'+
            '<span class="preview-title">价格：</span><span class="preview-content">'+price+'</span>'+
            '<span class="preview-title">数量：</span><span class="preview-content">'+buycount+'</span>'+
            '</p>';
        }
        this.previewHtml = '<div class="preview-list"><h4>用户信息</h4>'+
        '<p>'+
        '<span class="preview-title">电话号码：</span><span class="preview-content">'+phone+'</span>'+
        '<span class="preview-title">姓名：</span><span class="preview-content">'+username+'</span>'+
        '<span class="preview-title">会员等级：</span><span class="preview-content">'+grade+'</span>'+
        '</p>'+
        '<p>'+
        '<span class="preview-title">收货地址：</span><span class="preview-content">'+recv_province+recv_city+recv_district+recv_address+'</span>'+
        '<p>'+
        '</div>'+
        '<div class="preview-list"><h4>货品信息</h4>'+
        goods +
        '</div>'+
        '<div class="preview-list"><h4>订单信息</h4>'+
        '<p>'+
        '<span class="preview-title">操作人：</span><span class="preview-content">'+admin_name+'</span>'+
        '<span class="preview-title">订单来源：</span><span class="preview-content">'+billsource+'</span>'+
        '</p>'+
        '<p>'+
        '<span class="preview-title">商品总价：</span><span class="preview-content">'+feetotal+'</span>'+
        '<span class="preview-title">订单邮费：</span><span class="preview-content">'+feepostage+'</span>'+
        '<span class="preview-title">订单优惠：</span><span class="preview-content">'+promotion+'</span>'+
        '<span class="preview-title">实付金额：</span><span class="preview-content">'+feepayment+'</span>'+
        '</p>'+
        '<p>'+
        '<span class="preview-title">买家备注：</span><span class="preview-content">'+content+'</span>'+
        '</p>'+
        '</div>';
    },
    area_reload:function(area_item, default_value) { //选择地址
        if (typeof(default_value) == undefined) {
            default_value = false;
        }
        var pid = "";
        switch (area_item) {
            case 'province':
                pid = 0;
                child_item = 'city';
                break;
            case 'city':
                if ($("#province").val() != ''){
                    pid = $("#province").val();
                    child_item = 'district';
                }
                break;
            case 'district':
                if ($("#city").val() != ''){
                    pid = $("#city").val();
                    child_item = '';
                }
                break;
            default:
                return false;
        }

        if (pid.length != 0) {
            AjaxLoader.post('/index.php/websmall/client/recvarea_area',{pid:pid},function(data){
                if(data){
                    var option_html = '<option value="">请选择</option>';
                    $.each(data,function(i,item){
                        option_html +="<option value="+item.id+">"+item.name+"</option>";
                    });
                    $("#"+area_item).html(option_html);
                    // 是否加载默认值
                    if (default_value == true){
                        // 循环option，选出默认值
                        $("#"+area_item+" option").each(function(){
                            if($(this).html() == $("#recv_"+area_item+"_default").val()){
                                $("#"+area_item).val($(this).attr('value'));
                                return false;
                            }
                        });
                    }
                    if (child_item.length != 0) {
                        billApi.area_reload(child_item, default_value);
                    }
                }
            });
        }else {
        var option_html = '<option value="">请选择</option>';
        $("#"+area_item).html(option_html);
    }
    },
    submit:function(){ //提交订单
        this.billinfoCheck();
        if ($('#billsource option:selected').val() == '0') {
            AppDialog.alert('请选择订单来源'); return false;
        }
        if ($('#feepayment').val() == '') {
            AppDialog.alert('请检查实付金额是否为空');
            return false;
        }
        if (!AppLock.get('submit')) {
            return false;
        }
        AppForm.submit($('#billsDetail'),function(data){
            AppDialog.alertDisappear('订单保存成功，页面将关闭！',function(){

                var userAgent = navigator.userAgent;
                if (userAgent.indexOf("Firefox") != -1 || userAgent.indexOf("Chrome") !=-1) {
                   window.location.href="about:blank";
                } else {
                   window.opener = null;
                   window.open("", "_self");
                   window.close();
                };

            });
        });
    }

}
var menu = {
    sidebar:function(){
        $('.sidebar').removeClass('min-sidebar');
        $('.logo').removeClass('logo-min');
        $('#logo').attr('src','/Public/Webadmin/images/logo.png');
        $('.toggle-sidebar i').removeClass('fa-angle-right');
        localStorage.removeItem("sidebar");
    },
    minSidebar:function(){
        $('.sidebar').addClass('min-sidebar');
        $('.logo').addClass('logo-min');
        $('#logo').attr('src','/Public/Webadmin/images/logo-min.png');
        $('.toggle-sidebar i').addClass('fa-angle-right');
        localStorage.setItem("sidebar", 1);
    }
}

$(document).ready(function() {
    $('.toggle-sidebar').click(function(){ //菜单栏
        if (localStorage.getItem('sidebar')) {
            menu.sidebar();
        }else{
            menu.minSidebar();
        }
    });
    //表单验证
    $('#billsDetail').bootstrapValidator({
        message: 'This value is not valid',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            recv_name: {
                validators: {
                    notEmpty: {
                        message: '姓名不能为空'
                    },
                    stringLength: {
                        min: 1,
                        max: 10,
                        message: '姓名必须大于1个字'
                    }
                }
            },
            recv_phone: {
                validators: {
                    notEmpty: {
                        message: '电话号码不能为空'
                    },
                    regexp: {
                        regexp: /^[0-9\-]+$/,
                        message: '电话号码只能由数字组成'
                    },
                    stringLength: {
                        min: 11,
                        max: 14,
                        message: '电话号码必须大于11位'
                    }
                }
            },
            feepostage: {
                validators: {
                    regexp: {
                        regexp: /^[0-9]+(.[0-9]{1,3})?$/,
                        message: '请输入正确的邮费'
                    }
                }
            },
            feepayment: {
                validators: {
                    regexp: {
                        regexp: /^[0-9]+(.[0-9]{1,3})?$/,
                        message: '请输入正确的金额'
                    }
                }
            }
        }
    });
    $('#resetBtn').click(function() { //清空表单
        billApi.empty();
    });
    $('#preview').on('show.bs.modal', function () { //订单预览
       var previewHtml = billApi.previewHtml;
       $('#previewContent').html(previewHtml);
    });
    var thedate = new Date();
    thedate = thedate.getFullYear() + '-' + (thedate.getMonth()+1) + '-' + thedate.getDate() + ' ' + thedate.getHours()+ ':' + thedate.getMinutes()+ ':' + thedate.getSeconds();
    $(".date-picker").val(thedate);
    $('.date-picker').datetimepicker({ //日期控件初始化
        format: 'yyyy-mm-dd hh:ii:ss',
        lang:'ch'
    });
});


billApi.init(); //初始化>>>>>>> .r11286
