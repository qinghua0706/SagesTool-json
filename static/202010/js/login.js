 var timerLogin;

    var regTc, logTc, findTc;

    var notify_url;
    var scene_str;
    function getVerPic(id) {
        $.ajax({
            type: 'POST',
            url:'/api/oauth/base/get_captcha',
            data: {},
            dataType: 'json',
            timeout: 30000,
            success: function (data) {
                $(id).prop('src', data.data.image);
                $(id).attr('data-code', data.data.real_code);
                $(id).attr('data-key', data.data.key);
                $('.hiddenKey').val(data.data.key);

            },
            error: function () {

            }
        });
    }


    regTc = function () {
        layer.open({
            type: 1,
            closeBtn: false,
            title: false,
            shade: true,
            shadeClose: true,
            scrollbar: true,
            area: ['750px', '480px'],
            success:function(){
                getVerPic('.verPic');
                $('#activeCode').on('click',function(){

                    var phone=$('#dr_phone').val();
                    if (!phone) {
                        layer.msg('请输入手机号')
                        return;
                    }
                    var img_code=$('#dr_code').val();
                    if (!img_code) {
                        layer.msg('请输入图片验证码')
                        return;
                    }
                    var param={
                        'phone':phone,
                        'code':img_code,
                        'key':$('.hiddenKey').val(),
                    }
                    $.ajax({
                        type: 'POST',
                        url: '/api/oauth/app_sms/get_sms_code',
                        data: param,
                        dataType: 'json',
                        timeout: 30000,
                        success: function (data) {
                            if (data.code == 200) {
                                $("#activeCode").attr("disabled",true);
                                var time = 60;
                                var timer = setInterval(function() {
                                    if (time == 0) {
                                        // 清除定时器和复原按钮
                                        clearInterval(timer);
                                        $("#activeCode").attr("disabled",false);
                                        $("#activeCode").html('发送短信');
                                        time = 60;
                                    } else {
                                        $("#activeCode").html('剩余' + time + '秒');
                                        time--;
                                    }
                                }, 1000);
                                layer.msg(data.msg )

                            }else{
                                layer.msg(data.msg )
                            }
                        },
                        error: function () {

                        }
                    });
                })
                $('#regInBtn').on('click',function(){

                    var phone=$('#dr_phone').val();
                    if (!phone) {
                        layer.msg('请输入手机号')
                        return;
                    }
                    var img_code=$('#dr_code').val();
                    if (!img_code) {
                        layer.msg('请输入图片验证码')
                        return;
                    }

                    if (!img_code) {
                        layer.msg('请输入图片验证码')
                        return;
                    }
                    var password=$('#dr_password').val();
                    var password2=$('#dr_password2').val();
                    if(!password){
                        layer.msg('请输入密码')
                        return;
                    }
                    if(!password2){
                        layer.msg('请输入确认密码')
                        return;
                    }
                    if(password!=password2){
                        layer.msg('密码不对应')
                        return;
                    }
                    var code_info=$('#dr_sms').val();
                    if (!code_info) {
                        layer.msg('请输入短信验证码')
                        return;
                    }
                    var param={
                        'mobile':phone,
                        'password':password,
                        'password2':password2,
                        'code_info':code_info,
                        'code':img_code,
                        'key':$('.hiddenKey').val(),
                    }
                    $.ajax({
                        type: 'POST',
                        url: '/api/oauth/base/reg',
                        data: param,
                        dataType: 'json',
                        timeout: 30000,
                        success: function (json) {
                            if (json.code == 200) {
                                layer.closeAll();
                                layer.msg('注册成功');
                                loginCookie(json.data.userpic, json.data.username?json.data.username:json.data.phone,json.data.userid,json.data.access_token,json.data.nickname)

                            }else{
                                layer.msg(json.msg )
                            }
                        },
                        error: function () {

                        }
                    });
                })
            },
            // area: '750px',
            content: `

                 <div class="login-reg-box-wrapper tc-cover">

                <div class="fc-register portlet-title tabbable-line">
                     <a class="return-to-log left-icon-self" id="regToLog">
                    返回登录</a>
                     注册用户
                </div>
                <div class="portlet light">

            <div class="portlet-body">
            <form action="" class="form-horizontal form myRegForm" method="post" name="myregform" id="myform">
            <input name="is_form" type="hidden" value="1">
            <input name="is_admin" type="hidden" value="0">
            <input name="is_tips" type="hidden" value="">
            <input name="csrf_test_name" type="hidden" value="6c3cec23237c6cf063228b64a78a6760">
            <input name="back" id="dr_back" type="hidden" value="//www.json.cn/">
            <input name="key" type="hidden" class="hiddenKey">
            <div class="form-body" style="padding-bottom:0">

            <div class="form-group " id="dr_row_phone">
            <label class="col-md-2 control-label">手机号</label>
            <div class="col-md-9">
            <input type="text" class="form-control input-large" placeholder="请输入手机号" name="phone" id="dr_phone">
            </div>
            </div>
            <div class="form-group " id="dr_row_password">
            <label class="col-md-2 control-label">密码</label>
            <div class="col-md-9">
            <input type="password" class="form-control input-large" name="password" placeholder="数字+字母不少于8位" id="dr_password">
            </div>
            </div>
            <div class="form-group " id="dr_row_password2">
            <label class="col-md-2 control-label">确认密码</label>
            <div class="col-md-9">
            <input type="password" class="form-control input-large" name="password2" placeholder="再次输入密码" id="dr_password2">
            </div>
            </div>
            <div class="form-group" id="dr_row_code">
            <label class="col-md-2 control-label">验证码</label>
            <div class="col-md-9 input-ver-code" style="padding-left: 10px;padding-right: 0;">
            <input class="form-control placeholder-no-fix input-ver" type="text" autocomplete="off" id="dr_code" name="code" placeholder="验证码">
            <div class="input-group-btn fc-code">
            <img align="absmiddle" style="cursor:pointer;" class="verPic">
            </div>
            </div>
            </div>
            <div class="form-group" id="dr_row_sms">
            <label class="col-md-2 sms-ver-tit control-label">短信验证</label>
            <div class="sms-ver-show col-md-9" style="padding-left: 10px;padding-right: 0;">
            <input class="form-control placeholder-no-fix sms-veri"  type="text" autocomplete="off" id="dr_sms" name="sms" placeholder="手机验证码">
            <button id="activeCode" class="empty-btn reg-btn reg-active-code-box" 
            type="button">获取手机验证码
            </button>

            </div>
            </div>
            <div class="reg-agree ">
            <label class="mt-checkbox mt-checkbox-outline">
            <input type="checkbox" name="is_protocol" id="dr_protocol" value="1" checked=""> 我已阅读并同意
            <span></span>
            </label>
            <label class="mt-checkbox-more">
            <a href="javascript::void(0);">《用户注册协议》</a>
            </label>
            </div>
            <div class="form-actions">
            <label class="member-reg-btn-label">
            <button type="button" id="regInBtn" class="btn red" > 立即注册

            </button>
            </label>
            </div>
            </div>
            </form>

            </div>
            </div>
            </div>
            `
        });

    }
    logTc = function () {
        layer.open({
            type: 1,
            closeBtn: false,
            title: false,
            shade: true,
            shadeClose: true,
            scrollbar: true,
            // area: ['750px', '480px'],
            success:function(){
                getVerPic('.verPic');
            },
            end: function () {
                if (timerLogin) {
                    clearInterval(timerLogin)
                }
            },
            area: '750px',
            content: `
                        <div class="login-log-box-wrapper account-login-method portlet-wrapper">
    <div class="portlet light">
        <div class="portlet-body ">
            <div class="row">
                <div class="col-img-wrapper">
                    <img src="//www.json.cn/static/assets/oauth/login-main.png" alt="">
                </div>
                <div class="col-info-wrapper">
                    <div class="login-chose-tit">
                        <div class="login-title active">微信登录</div>
                        <div class="login-title">账号登录</div>
                    </div>

                    <div id="loginStepTwo" class="col-md-4 login-class" >
                        <div class="login-by-code">
                            <div class="login-by-code-img">
                               <div class="login-by-code-img">
                                <img id="wcQrCodeImg" src="" alt="">

                                    <div class="login-by-code-img-noshow">
                                        <p>二维码失效</p>
                                        <p>请点击刷新</p>
                                        <a id="reloadQrcode" onclick="refreshQrcode()" >刷新二维码</a>
                                    </div>
                                </div>
                            </div>
                             <a class="refresh-qrcode" onclick="refreshQrcode()">点击刷新</a>
                            <p class="">请使用微信扫描二维码登录注册</p>
                        </div>
                    </div>
                    <div id="loginStepOne" class="col-md-4 login-class display-none">
                        <form class="content" id="myform" name="mylogform" method="post" novalidate="novalidate">


                            <input name="is_form" type="hidden" value="1">
<input name="is_admin" type="hidden" value="0">
<input name="is_tips" type="hidden" value="">
<input name="key" type="hidden" value="" class="hiddenkey">
<input name="csrf_test_name" type="hidden" value="e61cf3d516c228e64a9afb533342635f">
<input name="back" id="dr_back" type="hidden" value="/index.php?s=member">
                            <div class="form-group" style="margin-top: 20px;">
                                <div class="input-icon">
                                     <input class="form-control placeholder-no-fix login-tel" type="text" autocomplete="off" id="logUsername" placeholder="请输入用户名\\手机号" name="data[username]">
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="input-icon">
                                     <input class="form-control placeholder-no-fix login-pw" type="password" autocomplete="off" id="logPassword" placeholder="请输入密码" name="data[password]">
                                </div>
                            </div>

                                                        <div class="form-group">
                                <div class="input-group " style="width: 100%">
                                    <div class="input-icon" style="width:calc(100% - 15px)">
                                         <input onkeydown="regLogFindSubmit(this)" class="form-control placeholder-no-fix veri-code" type="text" autocomplete="off" id="logCode" placeholder="请输入验证码" name="code">
                                    </div>
                                    <div class="input-group-btn fc-code" style="width: 120px;border: 1px solid #ddd">
                                        <img align="absmiddle" style="cursor:pointer;" class="verPic">                                    </div>
                                </div>
                            </div>
                                         <div class="create-account create-account-one" style="margin: 0;display: flex;justify-content: space-between">
                                <p>
                                    <a  class="reg-account"> 注册账号 </a>
                                    <a class="find-password-btn" id="findPw"> 找回密码 </a>
                                </p>
                            </div>
                            <div class="login-commit">
                                 <button type="button" name="logbtn"  onclick="dr_ajax_member_login('//www.json.cn/api/oauth/base/login', 'myform');" class="btn full-btn submit">
                                    登录
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
                       `
        })
    }
    findTc = function () {
        layer.open({
            type: 1,
            closeBtn: false,
            title: false,
            shade: true,
            shadeClose: true,
            scrollbar: true,
            // area:['750px','auto'],
            area: ['750px', '480px'],
            success:function(){
                getVerPic('.verPic');
                $('#activeCode').on('click',function(){

                    var phone=$('#dr_value').val();
                    if (!phone) {
                        layer.msg('请输入手机号')
                        return;
                    }
                    var img_code=$('#dr_code_find').val();
                    if (!img_code) {
                        layer.msg('请输入图片验证码')
                        return;
                    }

                    var param={
                        'phone':phone,
                        'code':img_code,
                        'key':$('.verPic').attr('data-key')
                    }
                    $.ajax({
                        type: 'POST',
                        url: '/api/oauth/app_sms/get_sms_code',
                        data: param,
                        dataType: 'json',
                        timeout: 30000,
                        success: function (data) {
                            if (data.code == 200) {
                                $("#activeCode").attr("disabled",true);
                                var time = 60;
                                var timer = setInterval(function() {
                                    if (time == 0) {
                                        // 清除定时器和复原按钮
                                        clearInterval(timer);
                                        $("#activeCode").attr("disabled",false);
                                        $("#activeCode").html('发送短信');
                                        time = 60;
                                    } else {
                                        $("#activeCode").html('剩余' + time + '秒');
                                        time--;
                                    }
                                }, 1000);
                                layer.msg(data.msg )

                            }else{
                                layer.msg(data.msg )
                            }
                        },
                        error: function () {

                        }
                    });
                })
                $('#findSubveri').on('click',function(){

                    var phone=$('#dr_value').val();
                    if (!phone) {
                        layer.msg('请输入手机号')
                        return;
                    }
                    var img_code=$('#dr_code_find').val();
                    if (!img_code) {
                        layer.msg('请输入图片验证码')
                        return;
                    }

                    if (!img_code) {
                        layer.msg('请输入图片验证码')
                        return;
                    }
                    var password=$('#dr_password_find').val();
                    var password2=$('#dr_password_find2').val();
                    if(!password){
                        layer.msg('请输入密码')
                        return;
                    }
                    if(!password2){
                        layer.msg('请输入确认密码')
                        return;
                    }
                    if(password!=password2){
                        layer.msg('密码不对应')
                        return;
                    }
                    var code_info=$('#findCode').val();
                    if (!code_info) {
                        layer.msg('请输入短信验证码')
                        return;
                    }
                    var param={
                        'mobile':phone,
                        'password':password,
                        'password2':password2,
                        'code_info':code_info,
                        'code':img_code,
                        'key':$('.hiddenKey').val(),
                    }
                    $.ajax({
                        type: 'POST',
                        url: '/api/oauth/base/find_password',
                        data: param,
                        dataType: 'json',
                        timeout: 30000,
                        success: function (json) {
                            if (json.code == 200) {
                                layer.closeAll();
                                layer.msg('密码找回成功');
                                loginCookie(json.data.userpic, json.data.username?json.data.username:json.data.phone,json.data.userid,json.data.access_token,json.data.nickname)

                            }else{
                                layer.msg(json.msg )
                            }
                        },
                        error: function () {

                        }
                    });
                })
            },
            content: `
                         <div class="portlet-wrapper">
    <div class="portlet light find-pw-cla">
        <div class="portlet-body ">
            <div class="row">
                <div class="find-pw-tit">
                     <a class="find-to-log left-icon-self" id="returnToLogin">返回登录</a>
                    找回密码
</div>
                <div class="portlet-body form" style="">
                    <form id="myform" name="myfindform" class="form-horizontal" role="form">
                        <input name="is_form" type="hidden" value="1">
<input name="is_admin" type="hidden" value="0">
<input name="is_tips" type="hidden" value="">
<input name="key" type="hidden" value="" class="hiddenkey">
<input name="csrf_test_name" type="hidden" value="623f272b236490d99c136438587e15a2">
                        <div class="form-body">
                            <div class="form-group" id="dr_row_value">
                                <label class="col-md-4 control-label">手机号</label>
                                <div class="col-md-5">
                                    <label><input type="text" class="form-control input-large" id="dr_value" name="phone" placeholder="输入手机号"></label>
                                </div>
                            </div>
                            <div class="form-group" id="dr_row_password">
                                <label class="col-md-4 control-label">新密码</label>
                                <div class="col-md-5">
                                    <label><input type="password" class="form-control input-large" id="dr_password_find" name="password" placeholder="输入新的密码"></label>
                                </div>
                            </div>
                            <div class="form-group" id="dr_row_password2">
                                <label class="col-md-4 control-label">确认密码</label>
                                <div class="col-md-5">
                                    <label><input type="password" class="form-control input-large" id="dr_password_find2" name="password2" placeholder="再次输入新的密码"></label>
                                </div>
                            </div>
                            <div class="form-group" id="dr_row_code">
                                <label class="col-md-4 control-label">图片验证码</label>
                                <div class="col-md-5">
                                    <div class="input-group input-large">
                                        <input class="form-control placeholder-no-fix  find-veri-code" type="text" autocomplete="off" id="dr_code_find" placeholder="图片验证码">
                                        <div class="input-group-btn fc-code">
                                            <img align="absmiddle" style="cursor:pointer;"  class="verPic">                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="col-md-4 control-label">获得验证码</label>
                                <div class="col-md-5">
                                    <div class="input-group input-large">
                                        <input type="text" id="findCode"   name="code" class="form-control find-code" placeholder="验证码">
                                        <span class="input-group-btn find-pw-code">
                                            <button id="activeCode" class="btn green " type="button" >发送验证码</button>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="form-actions ">
<!--                                <label class="col-md-4 control-label"></label>-->
                                <div class="col-md-5 find-Subveri-box">
                                    <button id="findSubveri" type="button"  class="btn blue subveri find-subveri"> 提交验证
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    </div>
</div>
                       `
        })
    }

    window.onload = function () {

        $('body').on('click', '.verPic', function() {
            getVerPic('.verPic');
        });
        /*reg*/
        $('body').on('click', '#lgrt', function () {
            regTc()
        })

        /*login*/
        $('body').on('click', '#lggt', function () {
            logTc();
            $('#reloadQrcode').click();
            timerLogin = setInterval('dr_wx_notify()', 1000);
        })

        /*find password*/
        $('body').on('click', '.find-password-btn', function () {
            layer.closeAll();
            findTc()
        })

        $('body').on('click', '.reg-account', function () {
            layer.closeAll();
            regTc()
        })

        $('body').on('click', '.login-title', function () {
            if (timerLogin) {
                clearInterval(timerLogin);
            }
            $('.login-title').removeClass('active');
            $(this).addClass('active');
            $('.login-class').hide();
            $('.login-class').eq($(this).index()).show()

            if ($('#loginStepTwo').is(':visible')) {
                timerLogin = setInterval('dr_wx_notify()', 1000);
            } else {
                clearInterval(timerLogin);
            }
        })


        $('body').on('click', '#returnToLogin', function () {
            layer.closeAll();
            logTc()
            $('#loginStepTwo').addClass('display-none')
            $('#loginStepOne ').removeClass('display-none')
            $('.login-title').removeClass('active')
            $('.login-title').eq(1).addClass('active')

        })

        $('body').on('click', '#regToLog', function () {
            layer.closeAll();
            logTc()
            $('#loginStepTwo').addClass('display-none')
            $('#loginStepOne ').removeClass('display-none')
            $('.login-title').removeClass('active')
            $('.login-title').eq(1).addClass('active')
        })
    }

    function regLogFindSubmit(iv) {
        if (event.keyCode == 13) {
            if ($(".veri-code") && true == $(".veri-code").is(":focus")) {
                document.mylogform.logbtn.click();
                return;
            }

            if ($('input[name="data[code]"]') && true == $('input[name="data[code]"]').is(":focus")) {
                $('#findSubveri').click();
                return;
            }

            if ($(".sms-veri") && $(".sms-veri").is(":focus") == true) {
                $('#regInBtn').click();
                return;
            }
        }
    }

    function dr_ajax_member_reg(url, form) {
        // var url = window.location.href || url;
        var reg = /^(?![^a-zA-Z]+$)(?!\\D+$)[a-zA-Z0-9]{8,}$/;
        if (!$('#myform #dr_phone').val()) {
            layer.msg('手机号不能为空');
            return;
        }
        if (!$('#myform #dr_password').val()) {
            layer.msg('密码不能为空');
            return;
        }
        if ($('#myform #dr_password').val().search(reg) === -1) {
            layer.msg('密码数字+字母不少于8位');
            return;
        }
        if (!$('#myform #dr_password2').val()) {
            layer.msg('确认密码不能为空');
            return;
        }
        if ($('#myform #dr_password2').val() !== $('#myform #dr_password').val()) {
            layer.msg('密码和确认密码不一致');
            return;
        }
        if (!$('#dr_code').val()) {
            layer.msg('验证码不能为空');
            return;
        }
        if (!$('#dr_sms').val()) {
            layer.msg('短信验证码不能为空');
            return;
        }
        var flen = $('[id=' + form + ']').length;
        // 验证id是否存在
        if (flen == 0) {
            dr_cmf_tips(0, lang['unformid'] + ' (' + form + ')');
            return;
        }
        // 验证重复
        if (flen > 1) {
            dr_cmf_tips(0, lang['repeatformid'] + ' (' + form + ')');
            return;
        }

        var loading = layer.load(1, {
            shade: [0.9, '#000000'], //0.1透明度的白色背景
            time: 100000000
        });

        $("#" + form + ' .form-group').removeClass('has-error');

        var regData = {
            'data[phone]': $('#dr_phone').val(),
            'data[password]': $('#dr_password').val(),
            'data[password2]': $('#dr_password2').val(),
            'code': $('#dr_code').val(),
            'sms': $('#dr_sms').val(),
            'is_protocol': $('#dr_protocol').val(),
            '{csrf_token()}': "{csrf_hash()}",
        };
        $.ajax({
            type: "POST",
            dataType: "json",
            url: url,
            data: regData,
            success: function (json) {
                layer.close(loading);
                if (json.code == 1) {
                    layer.closeAll();
                    layer.msg('注册成功');
                    loginCookie(json.data.member.avatar, json.data.member.name?json.data.member.name:json.data.member.phone);
                } else {
                    dr_cmf_tips(0, json.msg, json.data.time);
                    $('.fc-code img').click();
                    if (json.data.field) {
                        $('#dr_row_' + json.data.field).addClass('has-error');
                        $('#dr_' + json.data.field).focus();
                    }
                }
            },
            error: function (HttpRequest, ajaxOptions, thrownError) {
                dr_ajax_alert_error(HttpRequest, ajaxOptions, thrownError);
            }
        });
    }

    // 注册阅读网站协议
    function dr_show_protocol() {
        layer.open({
            type: 2,
            title: lang['protocol'],
            shadeClose: true,
            area: ['70%', '70%'],
            content: '/index.php?s=member&c=api&m=protocol'
        });
    }


    function dr_wx_notify() {
        if (scene_str){
            $.ajax({
                type: "post",
                url: "/api/oauth/app_wechat/check_status",
                data:{'scene_str':scene_str},
                dataType: "json",
                success: function (json) {
                    if (json.code == 200) {
                        if(json.data.status_code==1){
                            loginCookie(json.data.userpic, json.data.username?json.data.username:json.data.phone,json.data.userid,json.data.access_token,json.data.nickname)
                            clearInterval(timerLogin);
                            layer.closeAll();
                            layer.msg('扫码登陆成功');
                        }


                    }
                },
                error: function () {
                }
            });
        }

    }

    function dr_ajax_member_login(url, form) {

        if (!$('.login-tel').val()) {
            layer.msg('手机号/密码不能为空');
            return;
        }
        if (!$('.login-pw').val()) {
            layer.msg('密码不能为空');
            return;
        }
        if (!$('.veri-code').val()) {
            layer.msg('验证码不能为空');
            return;
        }

        var flen = $('[id=' + form + ']').length;
        // 验证id是否存在
        if (flen == 0) {
            dr_cmf_tips(0, lang['unformid'] + ' (' + form + ')');
            return;
        }
        // 验证重复
        if (flen > 1) {
            dr_cmf_tips(0, lang['repeatformid'] + ' (' + form + ')');
            return;
        }

        var loading = layer.load(1, {
            shade: [0.9, '#000000'], //0.1透明度的白色背景
            time: 100000000
        });


        $("#" + form + ' .form-group').removeClass('has-error');

        var logData = {
            'phone': $('#logUsername').val(),
            'password': $('#logPassword').val(),
            'code': $('#logCode').val(),
            'key': $('.verPic').attr("data-key"),
        };


        $.ajax({
            type: "POST",
            dataType: "json",
            url: url,
            // data: $("#"+form).serialize(),
            data: logData,
            success: function (json) {
                layer.close(loading);
                // console.log(json)
                if (json.code == 200) {

                    layer.closeAll();
                    layer.msg('登录成功');

                    loginCookie(json.data.userpic, json.data.username?json.data.username:json.data.phone,json.data.userid,json.data.access_token,json.data.nickname)
                } else {
                    dr_cmf_tips(0, json.msg, json.data.time);
                    $('.fc-code img').click();
                    if (json.data.field) {
                        $('#dr_row_' + json.data.field).addClass('has-error');
                        $('#dr_' + json.data.field).focus();
                    }
                }
            },
            error: function (HttpRequest, ajaxOptions, thrownError) {

                /*出现系统错误，可能是已登录，判断是否已登录 */
                // $.post('/index.php?s=api&app=blog&c=tran&m=get_user_status', {}, function (data) {
                //     if (data.code == 1) {
                //         var avatar = data.avatar ? data.avatar : '/static/img/avatar.png';
                //         var username = data.username ? data.username : '用户名';
                //         $.cookie('json-login-status', '1', {expires: 1, path: '/'});
                //         $.cookie('json-login-avatar', avatar, {expires: 1, path: '/'}); //exprires 过期时间 path ;域名路径下都可获取
                //         $.cookie('json-login-username', username, {expires: 1, path: '/'});
                //         $('#login_no').hide();
                //         $('#login_yes').show().find('.img-box').find('img').attr('src', avatar);
                //         $('#login_yes').show().find('.user-name').text(username);
                //         layer.closeAll();
                //         return false;
                //     } else {
                //         $.cookie('json-login-status', null, {path: '/'});
                //         $.cookie('json-login-avatar', null, {path: '/'});
                //         $.cookie('json-login-username', null, {path: '/'});
                //         layer.msg('错误');
                //     }
                // }, 'json');

                // dr_ajax_alert_error(HttpRequest, ajaxOptions, thrownError)
            }
        });
    }

    function dr_ajax_url_find(url) {
        var index = layer.load(2, {
            shade: [0.5, '#fff'], //0.1透明度的白色背景
            time: 100000000
        });

        var pass = checkPwRule('#dr_password_find');

        if (!pass) {
            layer.msg('数字+字母不少于8位');
            layer.close(index);
            return;
        }
        var pass2 = $('#dr_password_find').val() == $('#dr_password_find2').val();
        if (!pass2) {
            layer.msg('再次输入密码不一致')
            layer.close(index);
            return;
        }


        if (pass && pass2) {
            $.ajax({
                type: "GET",
                url: url,
                dataType: "json",
                success: function (json) {
                    layer.close(index);
                    if (json.code == 0) {
                        $('.fc-code img').click();
                        if (json.data.field) {
                            $('#dr_row_' + json.data.field).addClass('has-error');
                            $('#dr_' + json.data.field).focus();
                        }
                    } else {
                        sendActiveCode('#activeCode');
                        $('input[name="data[code]"]').focus();
                    }
                    dr_cmf_tips(json.code, json.msg);
                    if (json.data.url) {
                        setTimeout("window.location.href = '" + json.data.url + "'", 2000);
                    }
                },
                error: function (HttpRequest, ajaxOptions, thrownError) {
                    dr_ajax_alert_error(HttpRequest, ajaxOptions, thrownError)
                }
            });
        }

    }

    function dr_ajax_submit_find(url, form, time, go) {
        var reg = /^(?![^a-zA-Z]+$)(?!\\D+$)[a-zA-Z0-9]{8,}$/;
        if (!$('#dr_value').val()) {
            layer.msg('手机号不能为空');
            return;
        }
        if (!$('#dr_password_find').val()) {
            layer.msg('密码不能为空');
            return;
        }
        if ($('#dr_password_find').val().search(reg) === -1) {
            layer.msg('密码为数字+字母且不少于8位');
            return;
        }
        if (!$('#dr_password_find2').val()) {
            layer.msg('确认密码不能为空');
            return;
        }
        if ($('#dr_password_find').val() !== $('#dr_password_find2').val()) {
            layer.msg('密码不一致');
            return;
        }

        if (!$('#dr_code_find').val()) {
            layer.msg('图文验证码不能为空');
            return;
        }
        if (!$('input[name="data[code]"]').val()) {
            layer.msg('手机验证码不能为空');
            return;
        }

        var flen = $('[id=' + form + ']').length;
        // 验证id是否存在
        if (flen == 0) {
            dr_cmf_tips(0, lang['unformid'] + ' (' + form + ')');
            return;
        }
        // 验证重复
        if (flen > 1) {
            dr_cmf_tips(0, lang['repeatformid'] + ' (' + form + ')');
            return;
        }

        // 验证必填项管理员
        var tips_obj = $('#' + form).find('[name=is_tips]');
        if (tips_obj.val() == 'required') {
            tips_obj.val('');
        }
        if ($('#' + form).find('[name=is_admin]').val() == 1) {
            $('#' + form).find('.dr_required').each(function () {
                if (!$(this).val()) {
                    tips_obj.val('required');
                }
            });
        }

        var tips = tips_obj.val();
        if (tips) {
            if (tips == 'required') {
                tips = '有必填字段未填写，确认提交吗？';
            }
            layer.confirm(
                tips,
                {
                    icon: 3,
                    shade: 0,
                    title: lang['ts'],
                    btn: [lang['ok'], lang['esc']]
                }, function (index) {
                    dr_post_submit_log(url, form, time, go);
                });
        } else {
            dr_post_submit_log(url, form, time, go);
        }
    }

    function dr_post_submit_log(url, form, time, go) {

        url = url.replace(/&page=\d+&page/g, '&page');

        var loading = layer.load(1, {
            shade: [0.9, '#000000'], //0.1透明度的白色背景
            time: 100000000
        });

        $("#" + form + ' .form-group').removeClass('has-error');

        $('.dr_ueditor').each(function () {
            var uev = $(this).attr('id');
            if (UE.getEditor(uev).queryCommandState('source') != 0) {
                UE.getEditor(uev).execCommand('source');
            }
        });

        var findData = {
            'data[value]': $('#dr_value').val(),
            'data[password]': $('#dr_password_find').val(),
            'data[password2]': $('#dr_password_find2').val(),
            'data[code]': $('#findCode').val(),
            '{csrf_token()}': "{csrf_hash()}",
        };
        $.ajax({
            type: "POST",
            dataType: "json",
            url: url,
            data: findData,
            success: function (json) {
                layer.close(loading);
                if (json.code) {
                    dr_cmf_tips(1, json.msg, json.data.time);
                    if (json.data.htmlfile) {
                        // 执行生成htmljs
                        $.ajax({
                            type: "GET",
                            url: json.data.htmlfile,
                            dataType: "jsonp",
                            success: function (json) {
                            },
                            error: function () {
                            }
                        });
                    }
                    if (json.data.htmllist) {
                        // 执行生成htmljs
                        $.ajax({
                            type: "GET",
                            url: json.data.htmllist,
                            dataType: "jsonp",
                            success: function (json) {
                            },
                            error: function () {
                            }
                        });
                    }
                    if (time) {
                        // var gourl = url;
                        // if (go != '' && go != undefined && go != 'undefined') {
                        //     gourl = go;
                        // } else if (json.data.url) {
                        //     gourl = json.data.url;
                        // }
                        // setTimeout("window.location.href = '" + gourl + "'", time);

                        layer.closeAll();
                        logTc()
                        $('#loginStepTwo').addClass('display-none');
                        $('#loginStepOne ').removeClass('display-none');
                        $('.login-title').removeClass('active');
                        $('.login-title').eq(1).addClass('active');
                        layer.msg('密码修改成功，请重新登录');
                    }
                } else {
                    dr_cmf_tips(0, json.msg, json.data.time);
                    $('.fc-code img').click();
                    if (json.data.field) {
                        $('#dr_row_' + json.data.field).addClass('has-error');
                        $('#dr_' + json.data.field).focus();
                    }
                }
            },
            error: function (HttpRequest, ajaxOptions, thrownError) {
                dr_ajax_alert_error(HttpRequest, ajaxOptions, thrownError)
            }
        });
    }


    function refreshQrcode() {
        var loading = layer.load(1, {
            shade: [0.9, '#000000'], //0.1透明度的白色背景
            time: 100000000
        });
        $.ajax({
            type: "POST",
            url: '//www.json.cn/api/oauth/app_wechat/qrcode',
            dataType: "json",
            success: function (json) {
                layer.close(loading);
                if (json.code == 200) {

                        // if ($('.login-by-code-img-noshow').is(':visible')){
                        // }
                        $('.login-by-code-img-noshow').hide();
                        $('#wcQrCodeImg').attr('src',json.data.url);
                        // notify_url = json.data.notify_url;
                        scene_str=json.data.scene_str;
                        $('.refresh-qrcode').show();

                }else {
                    $('.login-by-code-img-noshow').show();
                    $('.refresh-qrcode').hide();
                }
            },
            error: function (HttpRequest, ajaxOptions, thrownError) {
                layer.close(loading);
                $('.refresh-qrcode').hide();
                dr_ajax_alert_error(HttpRequest, ajaxOptions, thrownError)
            }
        });
    }