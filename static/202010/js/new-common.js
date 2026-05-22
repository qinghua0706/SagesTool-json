/*
* @func
* @desc 登录后记录cookie
* @param {data} Object：登录后返回的数据
* @returns {void}
*/
function loginCookie(avatar, username,userid,access_token="",nickname="") {
    var avatar = avatar ? avatar : '/static/202010/img/avatar.png';
    var username = username ? username : '新用户:'+userid;
    var nickname = nickname ? nickname : '新用户'+userid;
    $('#login_no').hide();
    $('#login_yes').show().find('.img-box').find('img').attr('src', avatar);
    // $('#login_yes').show().find('.user-name').text(username);
    $('#login_yes').show().find('.user-name').text(nickname);
    $.cookie('json-login-status', '1', { expires: 1,path: '/'});
    $.cookie('json-login-avatar', avatar, { expires: 1,path: '/'}); //exprires 过期时间 path ;域名路径下都可获取
    $.cookie('json-login-username', username, {expires: 1, path: '/'});
    $.cookie('json-login-access-token', access_token, { expires: 1,path: '/'});
    $.cookie('json-login-userid', userid, { expires: 1,path: '/'});
    $.cookie('json-login-nickname', nickname, { expires: 1,path: '/'});
}

/*
* @func
* @desc 退出登录函数
* @returns {void}
*/
function dr_loginout(msg) {
    access_token=$.cookie('json-login-access-token')
    $.ajax({
        type: "post", dataType: "json", data: {access_token:access_token}, timeout: 30000, url: "/api/oauth/base/logout",
        success: function (json) {

            if (json.code == 200) {
                $('#login_no').show();
                $('#login_yes').hide();

                $.cookie('json-login-status',null, {path: '/'});

                $.cookie('json-login-avatar',null, {path: '/'});

                $.cookie('json-login-username',null, {path: '/'});
                $.cookie('json-login-access-token', null, { path: '/'});
                $.cookie('json-login-userid', null, { path: '/'});
                $.cookie('json-login-nickname', null, { path: '/'});
                setTimeout(function () {
                    window.location.reload()
                },1000)
            } else {
                layer.msg('登入发生一点小意外。。。')
            }

        },
        error: function (HttpRequest, ajaxOptions, thrownError) {
            dr_ajax_alert_error(HttpRequest, ajaxOptions, thrownError)
        }
    });
}

/*弹窗 登录*/

/*是否登录*/
$(function () {
    if ($.cookie('json-login-status') && $.cookie('json-login-status') == 1){
        var avatar = $.cookie('json-login-avatar');
        var username = $.cookie('json-login-username');
        var nickname = $.cookie('json-login-nickname');
        $('#login_no').hide();
        $('#login_yes').show();
        $('#login_yes').show().find('.img-box').find('img').attr('src', avatar);
        $('#login_yes').show().find('.user-name').text(nickname);
    }

    /*用以 登陆后，未退出,隔天，后端状态过期，前端状态未过期*/
    // $.post('/index.php?s=api&app=blog&c=tran&m=get_user_status', {}, function (data) {
    //     if (data.code == 0) {
    //         $.cookie('json-login-status', null, {path: '/'});
    //         $.cookie('json-login-avatar', null, {expires: 1, path: '/'}); //exprires 过期时间 path ;域名路径下都可获取
    //         $.cookie('json-login-username', null, {expires: 1, path: '/'});
    //         $('#login_no').show();
    //         $('#login_yes').hide();
    //         return false;
    //     }
    // }, 'json');
})
function dr_ajax_url_login(url) {
    // alert('1')
    var index = layer.load(2, {
        shade: [0.3, '#fff'], //0.1透明度的白色背景
        time: 100000000
    });

    var pass = checkPwRule('#dr_password');
    if (!pass) {
        layer.msg('数字+字母不少于8位');
        layer.close(index);
        return;
    }
    var pass2 = $('#dr_password').val() == $('#dr_password2').val();
    if (!pass2) {
        layer.msg('再次输入密码不一致')
        layer.close(index);
        return;
    }
    // alert('2')
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
                    sendActiveCode('#activeCode')
                    $('#dr_sms').focus();
                }
                dr_cmf_tips(json.code, json.msg);
                if (json.data.url) {
                    setTimeout("window.location.href = '" + json.data.url + "'", 2000);
                }
            },
            error: function (HttpRequest, ajaxOptions, thrownError) {
                dr_ajax_alert_error(HttpRequest, ajaxOptions, thrownError);
                layer.close(index);
            }
        });

    }
}
function dr_ajax_alert_error(HttpRequest, ajaxOptions, thrownError) {
    layer.closeAll('loading');
    if (typeof is_admin != "undefined" && is_admin == 1) {
        var msg = HttpRequest.responseText;
        //console.log(HttpRequest, ajaxOptions, thrownError);
        if (!msg) {
            dr_cmf_tips(0, lang['error_admin']);
        } else {
            layer.open({
                type: 1,
                title: lang['error_admin'],
                fix: true,
                shadeClose: true,
                shade: 0,
                area: ['50%', '50%'],
                content: "<div style=\"padding:10px;\">" + msg + "</div>"
            });
        }
    } else {
        dr_cmf_tips(0, lang['error']);
    }

}
function dr_ajax_submit(url, form, time, go) {

    var flen = $('[id='+form+']').length;
    // 验证id是否存在
    if (flen == 0) {
        dr_cmf_tips(0, lang['unformid'] + ' ('+form+')');
        return;
    }
    // 验证重复
    if (flen > 1) {
        dr_cmf_tips(0, lang['repeatformid'] + ' ('+form+')');
        return;
    }

    // 验证必填项管理员
    var tips_obj = $('#'+form).find('[name=is_tips]');
    if (tips_obj.val() == 'required') {
        tips_obj.val('');
    }
    if ($('#'+form).find('[name=is_admin]').val() == 1) {
        $('#'+form).find('.dr_required').each(function () {
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
            }, function(index){
                dr_post_submit(url, form, time, go);
            });
    } else {
        dr_post_submit(url, form, time, go);
    }
}
function dr_tips(code, msg, time) {

    if (!time || time == "undefined") {
        time = 3000;
    } else {
        time = time * 1000;
    }

    var is_tip = 0;
    if (time < 0) {
        is_tip = 1;
    } else if (code == 0 && msg.length > 15) {
        is_tip = 1;
    }

    if (is_tip) {
        if (code == 0) {
            layer.alert(msg, {
                shade: 0,
                title: "",
                icon: 2
            })
        } else {
            layer.alert(msg, {
                shade: 0,
                title: "",
                icon: 1
            })
        }
    } else {
        var tip = '<i class="fa fa-info-circle"></i>';
        //var theme = 'teal';
        if (code >= 1) {
            tip = '<i class="fa fa-check-circle"></i>';
            //theme = 'lime';
        } else if (code == 0) {
            tip = '<i class="fa fa-times-circle"></i>';
            //theme = 'ruby';
        }
        layer.msg(tip + '&nbsp;&nbsp;' + msg, {time: time});
    }

}
function dr_cmf_tips(code, msg, time) {
    dr_tips(code, msg, time);
}

/*判断用户是否登录*/
// $.post('/index.php?s=api&app=blog&c=tran&m=get_user_status', {}, function (data) {
//     // console.log(data)
//     if (data.code == 1) {
//         var avatar = data.avatar ? data.avatar : '/static/img/head portrait-01.png';
//         var username = data.username ? data.username : '用户名';
//         $.cookie('json-login-status', '1', { path: '/'});
//         $.cookie('json-login-avatar', avatar, { path: '/'}); //exprires 过期时间 path ;域名路径下都可获取
//         $.cookie('json-login-username', username, { path: '/'});
//         $('#login_no').hide();
//         $('#login_yes').show().find('.img-box').find('img').attr('src', avatar);
//         $('#login_yes').show().find('.user-name').text(username);
//     } else {
//         $.cookie('json-login-status',null, {path: '/'});
//         $.cookie('json-login-avatar',null, {path: '/'});
//         $.cookie('json-login-username',null, {path: '/'});
//     }
// }, 'json');


/*搜索*/
function get_search(perUre, value, option) {
    var len = getByteLen(value)
    if (len == '' || null || undefined) {
        layer.msg('请先输入内容', option)
        return
    }
    if (len >= 4) {
        window.location.href = perUre + value+'/'
    } else {
        layer.msg('搜索词不得少于两个字', option)
    }
}

/*判断字符串长度*/
function getByteLen(val) {
    var len = 0;
    for (var i = 0; i < val.length; i++) {
        var a = val.charAt(i);
        if (a.match(/[^\x00-\xff]/ig) != null) {
            len += 2;
        } else {
            len += 1;
        }
    }
    return len;
}


/*微信公共号显示*/
$('body').on('click', '#showQrcode', function (e) {
    e.stopPropagation();
    if ($('#wxQrcode').is(':hidden')) {
        $('#qqWindow').hide();
    }
    $('#wxQrcode').toggle();
});
$('body').on('click', '#showQqlist', function (e) {
    e.stopPropagation();
    if ($('#qqWindow').is(':hidden')) {
        $('#wxQrcode').hide();
    }
    $('#qqWindow').toggle();
});

$(window).scroll(function () {
    if ($(window).scrollTop() > 100) {
        $('#feedBack').hide();
        $('#goTop').show();
    } else {
        $('#feedBack').show();
        $('#goTop').hide();
    }
    if ($(window).scrollTop() > 100) {
        $('#feedBack').fadeOut(200);
        $('#goTop').fadeIn(200);
    } else {
        $('#feedBack').fadeIn(200);
        $('#goTop').fadeOut(200);
    }
});
$('body').on('click','#goTop',function () {
    $('body,html').animate({
            scrollTop: 0
        },
        500);
    return false;
})

$('body').on('click','.xf-collection',function () {
    alert('您的浏览器不支持,请按 Ctrl+D 手动收藏!')
})



var currentHref = window.location.href;
$('.header-nav-list a').each(function (index, item) {
    if (currentHref.indexOf($(item).attr('href')) > -1 && $(item).attr('href') !== '/') {
        $(item).parents('.dropdown').addClass('active');
        return false
    }
});
$(window).on('click', function () {
    if ($('#wxQrcode').is(':visible')) {
        $('#wxQrcode').hide();
    }
    if ($('#qqWindow').is(':visible')) {
        $('#qqWindow').hide()
    }

})

/*是否是外链*/
function isOutlink(url) {
    url = url;
    var isLinkOut = url.indexOf('http');
    if (isLinkOut > -1) {
        var self_origin = window.location.origin;
        if (url.indexOf(self_origin) == -1) {
            return true;
        }
    }
    return false;
}

/*动态加载layer.js layer.css*/
function loadJsCss(filename, filetype) {
    if (filetype == "js") {
        var fileref = document.createElement('script')//创建标签
        fileref.setAttribute("type", "text/javascript")//定义属性type的值为text/javascript
        fileref.setAttribute("src", filename)//文件的地址
    } else if (filetype == "css") {
        var fileref = document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileref)
    }
}

loadJsCss("/static/202010/js/layer.js", "js") //打开页面时浏览器动态的加载js文件
loadJsCss("/static/202010/js/theme/default/layer.css", "css") //打开页面时浏览器动态的加载css 文件
loadJsCss("/static/202010/js/lang.js", "js")

/*判断密码大于8位*/
function checkPwRule(el) {
    const reg = /^(?=.*?[0-9])(?=.*?[a-z])[0-9a-z]{8,}$/
    if (!reg.test($(el).val())) {
        return false;
    }
    return true;
}

/*60验证码*/
var djs;

function sendActiveCode(id) {
    clearInterval(djs);
    var count = 60;
    $(id).attr('disabled', true);
    $(id).css('pointer-events', 'none');
    $(id).addClass('text-black-ll-color');
    djs = setInterval(function () {
        count--;
        $(id).html(count + 's');
        if (count === 0) {
            $(id).attr('disabled', false);
            $(id).css('pointer-events', 'auto');
            $(id).removeClass('text-black-ll-color');
            $(id).html('重新发送');
            clearInterval(djs)
        }
    }, 1000)
}

//页内导航
function to(toEl) {    // toEl 为指定跳转到该位置的DOM节点   
    let bridge = toEl;
    let body = document.body;
    let height = 0;// 计算该 DOM 节点到 body 顶部距离 
    do {
        height += bridge.offsetTop;
        bridge = bridge.offsetParent;
    } while (bridge !== body)        // 滚动到指定位置   
    window.scrollTo({top: height, behavior: 'smooth'})
}

/*
* @func
* @desc ajax初始化页码
* @param {number} total : 一共多少页
* @param {number} dom : 页码父节点
* @param {number} current : 当前页
* @return Object
*/
function initPage(total, current, dom) {
    var parentDom = dom ? dom : '.page-list';
    var pageHtml = '';
    if (total > 1) {
        if (current === 1) {
            var pageNum = total > 9 ? 9 : total;
            var pageHtml = '<button class="btn btn-light disabled" tabindex="-1" role="button" aria-disabled="true" data-page="1" disabled data-normal="true">首页</button>\n' +
                '<button class="btn btn-light disabled" tabindex="-1" role="button" aria-disabled="true" data-page="2" disabled data-normal="true">上一页</button>\n' +
                ' <button class="btn btn-primary" tabindex="-1" role="button" aria-disabled="true" data-page="1">1</button>\n';
            for (var i = 2; i <= pageNum; i++) {
                pageHtml = pageHtml + ' <button class="btn btn-light"  data-page="' + i + '">' + i + '</button>\n';
            }
            pageHtml = pageHtml + '<button class="btn btn-light" data-page="2" data-normal="true">下一页</button>\n' +
                '<button class="btn btn-light" data-page="' + total + '" data-normal="true">末页</button>\n';
        } else if (current === total) {
            var pageNum = total > 9 ? total - 8 : 1;
            var pageHtml = '<button class="btn btn-light" role="button" data-page="1" data-normal="true">首页</button>\n' +
                '<button class="btn btn-light" role="button" data-page="' + (total - 1) + '" data-normal="true">上一页</button>\n';
            for (var i = pageNum; i <= total - 1; i++) {
                pageHtml = pageHtml + ' <button class="btn btn-light"  data-page="' + i + '">' + i + '</button>\n';
            }
            pageHtml = pageHtml + ' <button class="btn btn-primary" tabindex="-1" role="button" aria-disabled="true">' + total + '</button>\n' +
                '<button class="btn btn-light disabled" tabindex="-1" role="button" aria-disabled="true" disabled data-normal="true">下一页</button>\n' +
                '<button class="btn btn-light disabled" tabindex="-1" role="button" aria-disabled="true" data-normal="true" disabled>末页</button>\n';
        } else {
            var pageNumLeft = 1;
            var pageNumRight = 1;
            var nextNumRight = current + 1;
            var lastNumRight = current - 1;
            if (current < 5) {
                pageNumLeft = 1;
                if (total > 8) {
                    pageNumRight = 9;
                } else {
                    pageNumRight = total;
                }
            } else if (current > 4) {
                pageNumLeft = current - 4;
                if (total - current > 3) {
                    pageNumRight = current + 4;
                } else {
                    pageNumRight = total;
                    pageNumLeft = current - (8 - (total - current)) > 0 ? current - (8 - (total - current)) : 1;
                }
            }
            var pageHtml = '<button class="btn btn-light" data-page="1" data-normal="true">首页</button>\n' +
                '<button class="btn btn-light" data-page="' + lastNumRight + '" data-normal="true">上一页</button>\n';
            for (var i = pageNumLeft; i <= pageNumRight; i++) {
                if (i === current) {
                    pageHtml = pageHtml + '<button class="btn btn-primary" tabindex="-1" role="button" aria-disabled="true" data-page="' + i + '">' + i + '</button>\n';
                } else {
                    pageHtml = pageHtml + '<button class="btn btn-light"  data-page="' + i + '">' + i + '</button>\n';
                }
            }
            pageHtml = pageHtml + '<button class="btn btn-light"  data-page="' + nextNumRight + '" data-normal="true">下一页</button>\n' +
                '<button class="btn btn-light" data-page="' + total + '" data-normal="true">末页</button>\n';
        }
    } else if (total === 1) {
        // pageHtml = ' <a class="btn btn-primary disabled" tabindex="-1" role="button" aria-disabled="true" data-page="1">1</a>';
    }
    $(parentDom).html(pageHtml);
    var mobileLinkTo = '';
    $(parentDom).append(mobileLinkTo);
    $(parentDom).attr('data-total', total);
}