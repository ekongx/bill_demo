/*
| --------------------------------------------------------
|   文件功能：系统全局JS函数底部文件
|   程序作者：赵赫 & 王海滨
|   时间版本：2015-08-15
| --------------------------------------------------------
*/
window.AppCommon = {
    ajaxLoadingDelay:0 ,
    ajaxTimeout:30000,
    isDebug:0,
    ajaxErrorMessage:'服务器繁忙，请稍后重试!',
    staticPath:'/Public/Common/',
    baseurl:'/index.php/',
    appflag:0,
    /** 打印元素所有属性，实现IE的console问题 **/
    dump:function(elem){
        var str = '';
        if( typeof(elem)=='object' )
            for( t in elem ) str+='['+t+'] => '+elem[t]+';\n';
        else
            str = elem ;

        alert(str);
    } ,
    refreshCurrentPage:function(){
        var urls = window.location.href.split('#');
        //AppCommon.goUrl(urls[0]);
        AppDialog.close();
        $('.modal').remove();$('.modal-backdrop').remove();
        AjaxLoader.get(urls[0],function(data){
            //console.log(data);
            $('#content').replaceWith(data);
        })
    } ,
    getLenth:function( obj ){
        var size = 0 ;
        for( k in obj ) {
            size ++ ;
        }
        return size ;
    },
    log:function(ob){
        if(this.isDebug) {
            //console.log(ob);
        }
    },
    run:function(string,encode) {
        if( !string ) return false;
        if( encode ) string = this.decode(string);
        try {
            if( typeof(string)=="string" ) {
                eval(string);
            }
            else {
                this._func = string ;
                this._func() ;
            }
        }
        catch(e){
            this.log(e);
        }
    },
    encode:function(string){
        return encodeURI(string);
    },
    decode:function(string){
        return decodeURI(string);
    },
    isset:function(element) {
        return typeof(element)!='undefined';
    },
    empty:function(element) {
        return typeof(element)=='undefined'||element==false||element==null;
    },
    blockAHref:function(){/*
        $('a').click( function(){
            $(this).blur();
            var url = $(this).attr('href') ;
            if( !AppCommon.empty(url)&&url.indexOf('#')!=0 ) {
                window.location.href = url;
                return false ;
            }
        } ).focus(function(){$(this).blur();});*/
    }, 
    stripscript:function(s){    //过滤特殊字符
        var pattern = new RegExp("[`~!@#$^&()=|{}':;',\\[\\].<>/?~！@#￥……&（）——|{}【】‘；：”“'。，、？]");
        var rs = "";   
        for (var i = 0; i < s.length; i++) {   
            rs = rs+s.substr(i, 1).replace(pattern, '');   
        }   
        return rs;   
    },  
    getUrl:function(path){
        return this.baseurl+path;
    },
    goUrl:function(url) {
        var t = Math.ceil(Math.random()*50)+10;
        setTimeout('window.location.href="'+url+'"',t);
    } ,
    getUrlParam:function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r !== null) return unescape(r[2]); return null;
    },
    //whb:根据不同环境，调用不同返回上页的方法
    goBack:function(page){
        var self = this ;
        if(  self.appflag&&typeof(iosJS)!='undefined'&&!self.empty(iosJS)&&!self.empty(iosJS.gotoPrevView) ){
            iosJS.gotoPrevView();

        }
        else if( self.appflag&&typeof(androidJS)!='undefined'&&!self.empty(androidJS)&&!self.empty(androidJS.gotoPrevView) ){
            androidJS.gotoPrevView();
        }
        else if( !self.empty(page) ) {
            self.goUrl(page);
        }
        else {
            history.go(-1);

        }
    },
    doClick:function( val ){
        this.run(val);
    }
}

window.ajaxLoading = function(){
    var self = this ;
    self.timer = null ;
    self.show = function(){
        var delay = AppCommon.ajaxLoadingDelay || 0 ;
        if( delay>0 ) {
            self.timer = setTimeout( self.start,delay );
        }
        else {
            self.start();
        }
    }
    self.start = function(){
        if( !$('#loading_bg').attr('id') ) {
            $('body').append('<div id="loading_bg" style="position:fixed; left:0;top:40%;right:0;bottom:0;overflow:hidden;text-align:center;display:none;"><div  class="loading" style="display:inline-block;  z-index:3333; background: rgba(0, 0, 0, 0.7);padding: 10px;border-radius: 4px;font-size:12px;color: #fff;"><img src="/Public/Common/images/app-loading.gif" style="width: 20px;vertical-align: bottom;"><span>加载中…</span></div></div>');
            //showLoadingImage();
        }
        $('#loading_bg').fadeIn(200);
    }
    self.stop = function(){
        if( self.timer ) {
            clearTimeout(self.timer);
        }
        $('#loading_bg').fadeOut(200);
    }
}

/**
 * deal the ajax request and ajax callback
 *
 */
window.AjaxLoader = {
    dataType:'json' ,
    callBackFunc:[] ,
    errorFunc:[] ,
    dataelemId: [] ,
    request:[] ,
    count:0 ,
    get:function(url,callback,error){
        var self = this ;
        if( !AppCommon.empty(callback) ) {
            self.callBackFunc = callback;
        }
        else {
            self.callBackFunc = '';
        }
        if( !AppCommon.empty(error) ) {
            self.errorFunc = error;
        }
        else {
            self.errorFunc = '';
        }
        self.request[self.count++] = new ajaxRequest(url,callback,'GET',null,self.dataType,self.errorFunc);

    },
    post:function(url,data,callback,error){
        var self = this ;
        if( !AppCommon.empty(callback) ) {
            self.callBackFunc = callback;
        }
        else {
            self.callBackFunc = '';
        }
        if( !AppCommon.empty(error) ) {
            self.errorFunc = error;
        }
        else {
            self.errorFunc = '';
        }

        self.request[self.count++] = new ajaxRequest(url,callback,'POST',data,self.dataType,self.errorFunc);

    },
    formSubmit:function(form,callback,error){
        var self = this ;
        if( !AppCommon.empty(callback) ) {
            self.callBackFunc = callback;
        }
        else {
            self.callBackFunc = '';
        }
        if( !AppCommon.empty(error) ) {
            self.errorFunc = error;
        }
        else {
            self.errorFunc = '';
        }
        self.request[self.count++] = new ajaxRequest(form,callback,'FORM',null,self.dataType,self.errorFunc);
    },
    show:function(url,elemId){
        if( elemId ) {
            this.dataelemId = elemId;
        }
        else {
            this.dataelemId = '';
        }
        this.get(url);
    },

    /** data show function **/
    commonDeal:function(data) {
        var self = this ;
        if( self.dataelemId!='' ) {
            $('#'+self.dataelemId).html(data);
            self.dataelemId='';
        }
        else {
            AppCommon.dump(data);
        }
    }
}

window.ajaxRequest = function(url,callback,requestType,data,dataType,errorFunc){
    var self = this ;
    var randKey = Math.floor(Math.random()*10000000);
    if( typeof(url)=='string'){
        url += (url.indexOf('?')!=-1?'&':'?')+'isAjax=1&t='+randKey;
    }
    self.callBackFunc = callback ;

    self.loading = new ajaxLoading();
    self.loading.show();

    /** Ajax callback function. **/
    self.commonCallBack = function(ret){
        self.loading.stop();
        if( ret.success ) {
            if( self.callBackFunc ) {
                try {
                    if( typeof(self.callBackFunc)=='string' ) {
                        eval(self.callBackFunc+'(ret.infor);');
                    }
                    else {
                        self.callBackFunc(ret.infor);
                    }

                }
                catch(e) {
                    console.log(self.callBackFunc,e);
                    AppDialog.alert('数据异常，请联系管理员！');
                }
            }
            else {
                //console.log('default callback');
                AjaxLoader.commonDeal( ret.infor );
            }
        }
        else if( ret.error_code == 99 ) {
            AppDialog.alertDisappear(ret.msg,function(){
                window.location.href = ret.infor.url ;
            });
        }
        else if( ret.error_code >= 200 ) {
            switch ( parseInt(ret.error_code) )
            {
                case 200 :
                    AppDialog.alertDisappear(ret.msg);
                    break;
                default :
                    AppDialog.alert(ret.msg);
            }
        }
        else {
            AppDialog.alert(ret.msg);
        }
    }

    self.commonError = function(){
        self.loading.stop();
        if( AppCommon.empty(errorFunc) ){
            AppDialog.alert( AppCommon.ajaxErrorMessage );
        }
        else {
            AppCommon.run(errorFunc);
        }

    }

    if( requestType=='FORM' ){
        var form = url ;
        $(form).ajaxSubmit({
            dataType:dataType ,
            success:self.commonCallBack ,
            error:self.commonError
        });
    }
    else {
        $.ajax({
            type:requestType ,
            url:url ,
            data:data,
            dataType:dataType ,
            success:self.commonCallBack ,
            error:self.commonError ,
            timeout:AppCommon.ajaxTimeout
        });

    }


}


window.AppDialog = {
    elements:[],
    defaultElement :'AppDialogMain',
    zIndex: 10000 ,
    confirmValue:'',
    cancelValue:'',
    defaultConfirmValue:' 确定 ',
    defaultCancelValue:' 取消 ',
    actions:[] ,
    lastElementId:'' ,
    jumpOutEffect:true,
    alert:function( message,action,confirmValue,elemId,isClose ){
        if( !AppCommon.empty(confirmValue) ) {
            this.confirmValue = confirmValue ;
        }
        else {
            this.confirmValue = this.defaultConfirmValue ;
        }
        if( AppCommon.empty(elemId) ) {
            elemId = this.defaultElement + this.zIndex ;
        }
        this.actions[elemId] = action ;

        this.create(elemId);
        //console.log(elemId);
        var title='<span>系统提示</span>';
        var confirmAction = 'AppDialog.runAction(\''+elemId+'\');'+(isClose?'':'AppDialog.close(\''+elemId+'\')');
        var content ='<div class="modal-backdrop fade in"></div><div class="modal-dialog AppDialog"><div class="modal-content">'+
            '<div class="modal-header">'+title+'<button type="button" class="close" style="margin-top:-18px;margin-right:-10px;" data-dismiss="modal" aria-hidden="true" onclick="AppDialog.close(\''+elemId+'\');">×</button></div>'+
            '<div class="modal-body"><p>'+message+'</p></div>'+
            '<div class="modal-footer"><button type="button" class="btn btn-sm btn-primary" onclick="'+confirmAction+'">'+this.confirmValue+'</button></div>'+
            '</div></div>';
            $('#'+elemId).hide().delay(300).html(content).addClass('in').show();
    },

    alertDisappear:function( message,action ){
        var self = this ;
        var elemId = self.defaultElement+'Dsiappear'+self.zIndex;
        var html = '<div class="modal-dialog AppDialog appdisappear" style="opacity: 0.8; font-size: 16px; color:darkgreen; text-align: center;font-weight: bold; margin-top: 240px; width: 80%; max-width: 450px;"><div class="modal-content" onclick="AppDialog.close(\''+elemId+'\')">'+
            '<div class="modal-body"><p>'+message+'</p></div>'+
            '</div></div>';
        self.create( elemId,html );
        $('#'+elemId).addClass('in').show();
        setTimeout( function(){
            self.close(elemId);
            AppCommon.run(action);
        },1500);
    },

    smallAlertDisappear:function( message,action ){
        var self = this ;
        var elemId = self.defaultElement+'Dsiappear'+self.zIndex;
        var html = '<div class="small-content">'+
            '<div class="small-body"><span>'+message+'</span></div>'+
            '</div>';
        var client = 'small-dialog';
        self.create( elemId,html,client );
        $('#'+elemId).addClass('in').show();
        setTimeout( function(){
            self.close(elemId);
            AppCommon.run(action);
        },2000);
    },

    smallAlert:function(message,action,confirmValue,elemId,isClose,title ){

        var title = title || '系统提示';
        if( !AppCommon.empty(confirmValue) ) {
            this.confirmValue = confirmValue ;
        }
        else {
            this.confirmValue = this.defaultConfirmValue ;
        }
        if( AppCommon.empty(elemId) ) {
            elemId = this.defaultElement + this.zIndex ;
        }
        this.actions[elemId] = action ;

        this.create(elemId);
        //console.log(elemId);
        var title='<span>'+title+'</span>';
        var confirmAction = 'AppDialog.runAction(\''+elemId+'\');'+(isClose?'':'AppDialog.close(\''+elemId+'\')');
        var content ='<div class="modal-backdrop fade in"></div><div class="modal-dialog AppDialog small-alert"><div class="modal-content">'+
            '<div class="modal-header">'+title+'<button type="button" class="close" onclick="AppDialog.close(\''+elemId+'\');">×</button></div>'+
            '<div class="modal-body">'+message+'</div>'+
            '<div class="modal-footer"><button type="button" class="btn btn-xs btn-primary" onclick="'+confirmAction+'">'+this.confirmValue+'</button></div>'+
            '</div></div>';
        $('#'+elemId).hide().delay(300).html(content).addClass('in').show();
    },

    confirm:function( message,action,confirmValue,cancelValue,cancelAction,elemId ){
        this.confirmValue = confirmValue || " 确定 " ;
        this.cancelValue = cancelValue || " 取消 " ;

        if( AppCommon.empty(elemId) ) {
            elemId = this.defaultElement + this.zIndex ;
        }
        this.actions[elemId] = action ;

        this.create(elemId);
        var title = '<strong>确认操作</strong>';
        var content ='<div class="modal-backdrop fade in"></div><div class="modal-dialog"><div class="modal-content">'+
            '<div class="modal-header" style="border-bottom: none;">'+title+'<button type="button" style="margin-top:-18px;margin-right:-10px;" class="close" data-dismiss="modal" aria-hidden="true"  onclick="AppDialog.close(\''+elemId+'\');">×</button><h4 class="modal-title"></h4></div>'+
            '<div class="modal-body" style="text-align: center; font-size: 14px;"><p>'+message+'</p></div>'+
            '<div class="modal-footer" style="text-align:center"><button type="button" class="btn btn-sm btn-primary" onclick="AppDialog.runAction(\''+elemId+'\');AppDialog.close(\''+elemId+'\')">'+this.confirmValue+'</button> <button type="button" class=" btn btn-sm btn-danger"  data-dismiss="modal" onclick="AppDialog.close(\''+elemId+'\');">'+this.cancelValue+'</button></div>'+
            '</div></div>';

            $('#'+elemId).hide().delay(300).html(content).show().addClass('in');
            $('.modal-dialog').each(function(){
                var self = $(this);
                var mtop = ($(window).height() - self.height()-100)/2;
                self.css('margin-top',0);
            });
    },

    close:function(elemId){
        if( AppCommon.isset(elemId) ){
            this.remove(elemId);
        }
        else {
            for( k in this.elements ) {
                if( !this.elements[k] ) continue ;
                this.remove(this.elements[k]);
            }
        }
    },
    setContent:function(content,elemId){
        var buttonId = 'DialogConfirmButton'+elemId;
        var actionData = 'AppDialog.runAction(\''+elemId+'\');AppDialog.close(\''+elemId+'\');';
        content = '<div class="main"><span class="zflag">Dialog:'+this.zIndex+'</span><div class="close" onclick="'+actionData+'">X</div>'+content+'<div class="ac mt10 dialog_buttons"><input class="ac w100 h20" id="'+buttonId+'" type="button" value="'+this.confirmValue+' " onclick="'+actionData+'"></div></div>';
        $('#'+elemId).hide().fadeIn(200);
        $('#'+elemId).html(content);
        $('#'+buttonId).focus();
    },
    create:function(elemId,content,client) {
        if( $('#'+elemId).attr('id')==elemId ) {
            $('#'+elemId).css('z-index',this.zIndex++);
        }
        else {
            var element = document.createElement("div");
            $(element).addClass('modal fade '+client+'').attr('id',elemId).attr('aria-hidden','true').attr('role','dialog').css('z-index',this.zIndex++) ;
            $('body').append(element);
        }

        if( !AppCommon.empty(content) ) {
            $('#'+elemId).html(content);
            //this.setContent( content,elemId );
        }
        this.elements[elemId] = elemId ;
        this.lastElementId = elemId ;
    },
    remove:function(elemId){
        if( !$('#'+elemId) ) return true ;
        if( $('#'+elemId).attr('noremove')=='1' ){
            $('#'+elemId).hide().empty();
        }
        else if( $('#'+elemId).attr('remove')=='1' ){
            $('#'+elemId).hide().remove();
        }
        else {
            $('#'+elemId).fadeOut(200,function(){
                $(this).remove();
            }) ;;
        }
        this.elements[elemId] = null
        delete this.elements[elemId] ;

    },
    runAction:function(elemId){
        if( !AppCommon.empty(this.actions[elemId]) ) {
            if( typeof(this.actions[elemId])=='string' )
                AppCommon.run(AppCommon.encode(this.actions[elemId]),true);
            else
                AppCommon.run(this.actions[elemId]);
        }
    }

}

window.AppTimer = {
    times :[] ,
    timeId: [] ,
    clockId:[] ,
    actions:[] ,
    startTimes:[] ,
    basicTimes:[] ,
    currentTime:[],
    types:[],
    start:function(elemId,time,action,type) {
        this.types[elemId] = type;
        if(time<=0) return false;
        this.timeId[elemId] = elemId ;
        this.times[elemId] = time ;
        this.startTimes[elemId] = this.getMyTime() ;
        if( !AppCommon.empty(action) ) {
            this.actions[elemId] = action ;
        }

        this.play(elemId);
    } ,
    clock :function(elemId){
        var elem = $('#'+this.timeId[elemId]) ;
        var timeStr = this.getTime(elemId) ;
        if( elem.attr('value') ) {
            elem.attr('value',timeStr);
        }
        else {
            elem.html(timeStr);
        }
    } ,
    getTime:function(elemId){
        if( !this.times[elemId]){
            return this.types[elemId]==1||this.types[elemId]==2?'00:00':'00:00:00';
        }
        var currentTime = this.times[elemId]-(this.getMyTime()-this.startTimes[elemId]);
        this.currentTime[elemId] = currentTime;
        if( currentTime<=0 && (typeof this.actions[elemId] == "undefined" || this.actions[elemId] != false)) {
            this.stop(elemId);
            return this.types[elemId]==1||this.types[elemId]==2?'00:00':'00:00:00';
        }
        currentTime = currentTime < 0 ? 0:currentTime;
        switch(this.types[elemId]) {
            case 1:
                return this.getTimeStr1(currentTime);
            case 2:
                return this.getTimeStr2(currentTime);
            case 3:
                return this.getTimeStr3(currentTime);
            default:
                return this.getTimeStr(currentTime);
        }
    },
    getTimeStr:function(currentTime){
        var hour = Math.floor(currentTime/3600);
        var min  = Math.floor((currentTime%3600)/60);
        var sec  = Math.floor(currentTime%60%60);
        return (hour<10?'0':'')+hour+':'+(min<10?'0':'')+min+':'+(sec<10?'0':'')+sec ;
    },
    getTimeStr1:function(currentTime){
        var min  = Math.floor((currentTime%3600)/60);
        var sec  = Math.floor(currentTime%60%60);
        return (min<10?'0':'')+min+':'+(sec<10?'0':'')+sec ;
    },
    getTimeStr2:function(currentTime){
        var day = Math.floor(currentTime/86400);
        var hour = Math.floor((currentTime%86400)/3600);
        var min  = Math.floor((currentTime%3600)/60);
        var sec  = Math.floor(currentTime%60%60);
        return '剩余 '+day+'天 '+ (hour<10?'0':'')+hour+':'+(min<10?'0':'')+min+':'+(sec<10?'0':'')+sec ;
    },
    getTimeStr3:function(currentTime){
        var hour = Math.floor(currentTime/3600);
        var min  = Math.floor((currentTime%3600)/60);
        var sec  = Math.floor(currentTime%60%60);
        return '<em>'+(hour<10?'0':'')+hour+
                '</em>:<em>'+(min<10?'0':'')+min+
                '</em>:<em>'+(sec<10?'0':'')+sec+'</em>' ;
    },
    stop:function(elemId){
        if( elemId ) {
            this.clear(elemId);
        }
        else {
            for( k in this.timeId ) {
                this.clear(k);
            }
        }
    },
    clear:function(elemId){
        if( this.timeId[elemId]&&this.clockId[elemId] ) {
            clearInterval(this.clockId[elemId]);
            this.timeId[elemId] = false ;
            if( this.actions[elemId] ) {
                if( typeof(this.actions[elemId])=="string" ) {
                    AppCommon.run(this.actions[elemId]);
                }
                else {
                    this._func = this.actions[elemId] ;
                    this._func() ;
                }
                this.actions[elemId] = false ;
            }
        }
    },
    stop:function(elemId){
        if( this.timeId[elemId]&&this.clockId[elemId] ) {
            clearInterval(this.clockId[elemId]);
            this.timeId[elemId] = false ;
        }
    },
    play:function(elemId){
        this.clockId[elemId] = setInterval('AppTimer.clock(\''+elemId+'\')',1000);
    },
    getMyTime:function(){
        var date = new Date();
        return Math.floor( date.getTime()/1000 );
    },
    getMyDate:function(days){
        var d = new Date();
        if(days){
            d.setDate(d.getDate() + parseInt(days));
        }
        var vYear = d.getFullYear();
        var vMon = d.getMonth() + 1;
        var vDay = d.getDate();
        var h = d.getHours();
        var m = d.getMinutes();
        var se = d.getSeconds();
        s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay)+" "+(h<10 ? "0"+ h : h)+":"+(m<10 ? "0" + m : m)+":"+(se<10 ? "0" +se : se);
        return s;

    }
}

window.AppLoad = {
    funcs:[] ,
    index:0 ,
    push:function( func ) {
        this.funcs[this.index++] = func ;
    } ,
    run:function() {
        for( i in this.funcs ) {
            if( !this.funcs[i] ) {
                continue ;
            }
            AppCommon.run( this.funcs[i] );
        }
    }
}



/**
 * loading图片动画
 * 生成loadingImage时执行一次
 */

var showLoadingImage=function(){
    var cSpeed=9;
    var cWidth=48;
    var cHeight=48;
    var cTotalFrames=12;
    var cFrameWidth=48;
    var cImageSrc=AppCommon.staticPath+'images/loading_sprites.png';//配置加载图片
    //var cImageSrc=AppCommon.staticPath+'images/loading.gif';//配置加载图片

    var cImageTimeout=false;
    var cIndex=0;
    var cXpos=0;
    var cPreloaderTimeout=false;
    var SECONDS_BETWEEN_FRAMES=0;

    function startAnimation(){

        document.getElementById('loaderImage').style.backgroundImage='url('+cImageSrc+')';
        document.getElementById('loaderImage').style.scale='25%';
        document.getElementById('loaderImage').style.width=cWidth+'px';
        document.getElementById('loaderImage').style.height=cHeight+'px';

        //FPS = Math.round(100/(maxSpeed+2-speed));
        FPS = Math.round(100/cSpeed);
        SECONDS_BETWEEN_FRAMES = 1 / FPS;

        cPreloaderTimeout=setInterval(function(){
            cXpos += cFrameWidth;
            //increase the index so we know which frame of our animation we are currently on
            cIndex += 1;

            //if our cIndex is higher than our total number of frames, we're at the end and should restart
            if (cIndex >= cTotalFrames) {
                cXpos =0;
                cIndex=0;
            }

            if(document.getElementById('loaderImage'))
                document.getElementById('loaderImage').style.backgroundPosition=(-cXpos)+'px 0';

        }, SECONDS_BETWEEN_FRAMES*1000);

    }

    function stopAnimation(){//stops animation
        clearTimeout(cPreloaderTimeout);
        cPreloaderTimeout=false;
    }
    function imageLoader(s, fun)//Pre-loads the sprites image
    {
        clearTimeout(cImageTimeout);
        cImageTimeout=0;
        genImage = new Image();
        genImage.onload=function (){cImageTimeout=setTimeout(fun, 0)};
        genImage.onerror=new Function('alert(\'未能找到加载图片\')');
        genImage.src=s;
    }
    //The following code starts the animation
    new imageLoader(cImageSrc, startAnimation);

}

window.AppForm = {
    submit:function(form,callback) {
        if( AppCommon.empty(callback) ){
            callback = function(){
                AppDialog.alertDisappear('操作成功!',AppCommon.refreshCurrentPage);
            }
        }
        if( typeof(form)=='string') {
            form = $(form);
        }
        var formData = form.serialize();
        //AjaxLoader.post(form.attr('action'),formData,callback);
        AjaxLoader.formSubmit(form,callback);
    }

}

window.AppLock = {
    locks:[],
    timers:[],
    seconds:5,
    get:function(key){
        var self = this;
        if( AppCommon.empty(this.locks[key]) ) {
            self.locks[key] = true;
            self.timers[key] = setTimeout(function(){
                self.remove(key);
            },self.seconds*1000);
            return true;
        }
        else {
            return false;
        }
    },
    remove:function(key){
        var self = this;
        if( !AppCommon.empty(self.locks[key]) ){
            self.locks[key] = false ;
            clearTimeout(self.timers[key]);
        }

    }

}


//兼容IE不认console的问题
if( AppCommon.empty(console) ) {
    console = {
        log:function(ob) {
            AppCommon.dump(ob);
        }

    }
}

