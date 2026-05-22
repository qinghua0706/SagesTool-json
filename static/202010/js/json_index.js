
    if (window.localStorage.getItem('show-version-tip') && window.localStorage.getItem('show-version-tip') === '1') {
    } else {
        // $('.old-version').addClass('old-version-tip');
        // $('.old-version').attr('data-href', $('.old-version').attr('href'));
        // $('.old-version').attr('href', '');
        // $('.tip-mask').show()
    }
    $('.tip-mask').click(function () {
        $(this).remove();
        $('.old-version-tip').removeClass('old-version-tip');
        $('.old-version').attr('href', $('.old-version').attr('data-href'));
    });
    $('.old-version-tip').click(function () {
        $(this).remove();
        $('.old-version').attr('href', $('.old-version').attr('data-href'));
        $('.tip-mask').removeClass('old-version-tip');
        window.localStorage.setItem('show-version-tip', '1')
    });

    $('textarea').numberedtextarea();
    var current_json = '';
    var current_content = '';
    var current_json_str = '';
    var xml_flag = false;
    var zip_flag = false;
    var shown_flag = false;
    var compress_flag = false;
    $('.tip').tooltip();

    var JSON_SESSIONS_STORAGE = 'json_multi_sessions_v1';
    var JSON_SIDEBAR_WIDTH_KEY = 'json_multi_sidebar_width_v1';
    var JSON_LEGACY_INPUT_CACHE = 'json_index_input_cache';
    var JSON_SESSION_MAX_W = 320;
    var jsonSessionsState = { list: [], selectedId: null };
    var jsonSessionLoading = false;

    function formatSessionTime(ts) {
        var d = new Date(ts);
        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
        return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }

    function formatSessionSlash(ts) {
        var d = new Date(ts);
        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
        return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }

    function genSessionId() {
        return 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    }

    function loadSessionsFromStorage() {
        try {
            var raw = window.localStorage.getItem(JSON_SESSIONS_STORAGE);
            if (raw) {
                var data = JSON.parse(raw);
                if (data && Array.isArray(data.list)) {
                    jsonSessionsState.list = data.list;
                    jsonSessionsState.selectedId = data.selectedId || null;
                    return;
                }
            }
        } catch (e) {}
        jsonSessionsState.list = [];
        jsonSessionsState.selectedId = null;
    }

    function saveSessionsToStorage() {
        try {
            window.localStorage.setItem(JSON_SESSIONS_STORAGE, JSON.stringify({
                list: jsonSessionsState.list,
                selectedId: jsonSessionsState.selectedId
            }));
        } catch (e) {}
    }

    function getSidebarWidthStored() {
        var def = JSON_SESSION_MAX_W * 0.85;
        try {
            var w = parseFloat(window.localStorage.getItem(JSON_SIDEBAR_WIDTH_KEY), 10);
            if (!isNaN(w)) {
                return Math.min(JSON_SESSION_MAX_W, Math.max(JSON_SESSION_MAX_W / 2, w));
            }
        } catch (e) {}
        return def;
    }

    function applySidebarWidth(w) {
        w = Math.min(JSON_SESSION_MAX_W, Math.max(JSON_SESSION_MAX_W / 2, w));
        var outer = $('#session-sidebar-outer');
        var side = $('#json-session-sidebar');
        var dragS = $('#dragEleSidebar');
        outer.css('width', (w + 10) + 'px');
        side.css('width', w + 'px');
        dragS.css('left', w + 'px');
    }

    function sortSessionsNewestFirst() {
        jsonSessionsState.list.sort(function (a, b) {
            return (b.savedAt || 0) - (a.savedAt || 0);
        });
    }

    function migrateLegacyCacheIfNeeded() {
        if (jsonSessionsState.list.length > 0) return;
        try {
            var legacy = window.localStorage.getItem(JSON_LEGACY_INPUT_CACHE);
            if (legacy !== null && legacy !== '') {
                var id = genSessionId();
                var now = Date.now();
                jsonSessionsState.list.push({
                    id: id,
                    name: formatSessionTime(now),
                    content: legacy,
                    savedAt: now
                });
                jsonSessionsState.selectedId = id;
                saveSessionsToStorage();
            }
        } catch (e) {}
    }

    function ensureDefaultSession() {
        if (jsonSessionsState.list.length > 0) return;
        var id = genSessionId();
        var now = Date.now();
        jsonSessionsState.list.push({
            id: id,
            name: formatSessionTime(now),
            content: '',
            savedAt: now
        });
        jsonSessionsState.selectedId = id;
        saveSessionsToStorage();
    }

    function findSessionIndex(id) {
        for (var i = 0; i < jsonSessionsState.list.length; i++) {
            if (jsonSessionsState.list[i].id === id) return i;
        }
        return -1;
    }

    function renderSessionList() {
        var box = $('#json-session-sidebar');
        box.empty();
        sortSessionsNewestFirst();
        var sel = jsonSessionsState.selectedId;
        jsonSessionsState.list.forEach(function (s) {
            var title = (s.name && String(s.name).trim()) ? s.name : formatSessionTime(s.savedAt || Date.now());
            var created = formatSessionSlash(s.savedAt || Date.now());
            var row = $('<div class="json-session-item">' +
                '<button type="button" class="btn-session-edit" title="编辑名称"><i class="fa fa-pencil"></i></button>' +
                '<button type="button" class="btn-session-delete" title="删除"><i class="fa fa-trash"></i></button>' +
                '<div class="json-session-meta">' +
                '<span class="json-session-title"></span>' +
                '<span class="json-session-created"></span></div></div>');
            row.attr('data-id', s.id);
            row.find('.json-session-title').text(title);
            row.find('.json-session-created').text(created);
            if (s.id === sel) row.addClass('active');
            box.append(row);
        });
    }

    function persistSelectedSessionContent() {
        if (jsonSessionLoading) return;
        var id = jsonSessionsState.selectedId;
        if (!id) return;
        var idx = findSessionIndex(id);
        if (idx < 0) return;
        jsonSessionsState.list[idx].content = $('#json-src').val();
        saveSessionsToStorage();
    }

    function scrollSelectedSessionIntoView() {
        var id = jsonSessionsState.selectedId;
        if (!id) return;
        var $item = $('#json-session-sidebar .json-session-item').filter(function () {
            return $(this).data('id') === id;
        });
        if (!$item.length) return;
        var el = $item[0];
        var box = document.getElementById('json-session-sidebar');
        window.requestAnimationFrame(function () {
            if (!box) return;
            var pad = 8;
            var boxH = box.clientHeight || box.getBoundingClientRect().height;
            var extraBottomGap = Math.max(pad, Math.floor(boxH / 2));
            var hasNext = $item.next('.json-session-item').length > 0;
            var boxRect = box.getBoundingClientRect();
            var itemRect = el.getBoundingClientRect();
            var bottomLimit = hasNext ? boxRect.bottom - extraBottomGap : boxRect.bottom - pad;

            if (itemRect.bottom > bottomLimit) {
                box.scrollTop += itemRect.bottom - bottomLimit;
            }
            boxRect = box.getBoundingClientRect();
            itemRect = el.getBoundingClientRect();
            if (itemRect.top < boxRect.top + pad) {
                box.scrollTop += itemRect.top - boxRect.top - pad;
            }
        });
    }

    function resetJsonEditorScrollPositions() {
        var $ta = $('#json-src');
        $ta.scrollTop(0).trigger('scroll');
        $('#right-box').scrollTop(0);
    }

    function selectSessionById(id) {
        var idx = findSessionIndex(id);
        if (idx < 0) return;
        jsonSessionLoading = true;
        jsonSessionsState.selectedId = id;
        var s = jsonSessionsState.list[idx];
        $('#json-src').val(s.content != null ? s.content : '');
        saveSessionsToStorage();
        renderSessionList();
        scrollSelectedSessionIntoView();
        $('#json-src').keyup();
        resetJsonEditorScrollPositions();
        jsonSessionLoading = false;
    }

    function addSessionAndSelect(content, nameOpt) {
        var now = Date.now();
        var item = {
            id: genSessionId(),
            name: nameOpt || formatSessionTime(now),
            content: content != null ? content : '',
            savedAt: now
        };
        jsonSessionsState.list.push(item);
        sortSessionsNewestFirst();
        jsonSessionsState.selectedId = item.id;
        saveSessionsToStorage();
        renderSessionList();
        selectSessionById(item.id);
    }

    function finalizeAnyTitleInput() {
        var $inp = $('#json-session-sidebar .json-session-title-input');
        if (!$inp.length) return;
        var $row = $inp.closest('.json-session-item');
        var oid = $row.data('id');
        var os = jsonSessionsState.list[findSessionIndex(oid)];
        if (os) {
            var v = $.trim($inp.val());
            if (v) os.name = v;
            saveSessionsToStorage();
        }
        renderSessionList();
    }

    function removeSessionDeletePop() {
        $('.json-session-delete-pop').remove();
        $(document).off('click.jsonSessionDelPop');
        $('#json-session-sidebar').off('scroll.removeDelPop');
        $(window).off('resize.removeDelPop');
    }

    function layoutSessionDeletePop($pop, rowDom, sidebarDom) {
        var sb = sidebarDom ? sidebarDom.getBoundingClientRect() : { top: 0, bottom: window.innerHeight, left: 0, right: window.innerWidth };
        var r = rowDom.getBoundingClientRect();
        var tailOverlap = 8;
        var pad = 6;
        var vwPad = 4;

        function clampTop(t, clipTop, clipBot, popH) {
            return Math.max(clipTop, Math.min(t, clipBot - popH));
        }

        function fitsVertical(t, clipTop, clipBot, popH) {
            return t >= clipTop && t + popH <= clipBot;
        }

        var clipTop = Math.max(0, sb.top) + pad;
        var clipBot = Math.min(window.innerHeight, sb.bottom) - pad;

        $pop.removeClass('tail-up tail-down').addClass('tail-down');
        var popH = $pop.outerHeight();
        var popW = $pop.outerWidth();

        var cx = r.left + r.width / 2;
        var half = popW / 2;
        var minCx = Math.max(sb.left + half + pad, half + vwPad);
        var maxCx = Math.min(sb.right - half - pad, window.innerWidth - half - vwPad);
        if (maxCx < minCx) {
            minCx = half + vwPad;
            maxCx = window.innerWidth - half - vwPad;
        }
        var clampedCx = Math.min(Math.max(minCx, cx), maxCx);
        $pop.find('.json-session-delete-pop-tail').css('transform', 'translateX(' + Math.round(cx - clampedCx) + 'px)');

        var desiredAbove = r.top + tailOverlap - popH;
        var desiredBelow = r.bottom - tailOverlap;

        var placeAbove;
        if (fitsVertical(desiredAbove, clipTop, clipBot, popH)) {
            placeAbove = true;
        } else if (fitsVertical(desiredBelow, clipTop, clipBot, popH)) {
            placeAbove = false;
        } else {
            placeAbove = (r.top - clipTop) >= (clipBot - r.bottom);
        }

        $pop.toggleClass('tail-down', placeAbove);
        $pop.toggleClass('tail-up', !placeAbove);

        popH = $pop.outerHeight();
        desiredAbove = r.top + tailOverlap - popH;
        desiredBelow = r.bottom - tailOverlap;

        if (clipBot - clipTop < popH) {
            clipTop = Math.max(0, sb.top);
            clipBot = Math.min(window.innerHeight, sb.bottom);
        }

        var top = placeAbove ? clampTop(desiredAbove, clipTop, clipBot, popH) : clampTop(desiredBelow, clipTop, clipBot, popH);

        $pop.css({
            left: Math.round(clampedCx) + 'px',
            top: Math.round(top) + 'px',
            transform: 'translateX(-50%)'
        });
    }

    function deleteSessionById(id) {
        var wasSelected = jsonSessionsState.selectedId === id;
        sortSessionsNewestFirst();
        var idx = findSessionIndex(id);
        if (idx < 0) return;
        jsonSessionsState.list.splice(idx, 1);
        if (jsonSessionsState.list.length === 0) {
            jsonSessionsState.selectedId = null;
            saveSessionsToStorage();
            ensureDefaultSession();
            renderSessionList();
            selectSessionById(jsonSessionsState.selectedId);
            return;
        }
        if (wasSelected) {
            var nextIdx = idx < jsonSessionsState.list.length ? idx : idx - 1;
            if (nextIdx < 0) nextIdx = 0;
            jsonSessionsState.selectedId = jsonSessionsState.list[nextIdx].id;
        }
        saveSessionsToStorage();
        renderSessionList();
        selectSessionById(jsonSessionsState.selectedId);
    }

    function initJsonSessionsPanel() {
        loadSessionsFromStorage();
        migrateLegacyCacheIfNeeded();
        ensureDefaultSession();
        sortSessionsNewestFirst();
        if (!jsonSessionsState.selectedId || findSessionIndex(jsonSessionsState.selectedId) < 0) {
            jsonSessionsState.selectedId = jsonSessionsState.list.length ? jsonSessionsState.list[0].id : null;
        }
        applySidebarWidth(getSidebarWidthStored());
        if (jsonSessionsState.selectedId) {
            selectSessionById(jsonSessionsState.selectedId);
        } else {
            renderSessionList();
        }

        var sidebarDragActive = false;
        var sidebarDragStartX = 0;
        var sidebarDragStartW = 0;
        $('#dragEleSidebar').on('mousedown', function (e) {
            sidebarDragActive = true;
            sidebarDragStartX = e.pageX;
            sidebarDragStartW = $('#json-session-sidebar').outerWidth();
            e.preventDefault();
        });
        $(document).on('mousemove.jsonSidebarDrag', function (e) {
            if (!sidebarDragActive) return;
            var dx = e.pageX - sidebarDragStartX;
            applySidebarWidth(sidebarDragStartW + dx);
        });
        $(document).on('mouseup.jsonSidebarDrag', function () {
            if (!sidebarDragActive) return;
            sidebarDragActive = false;
            var w = $('#json-session-sidebar').outerWidth();
            try {
                window.localStorage.setItem(JSON_SIDEBAR_WIDTH_KEY, String(w));
            } catch (err) {}
        });

        $('body').on('click', '#json-session-sidebar .json-session-item', function (e) {
            if ($(e.target).closest('.btn-session-edit, .btn-session-delete, .json-session-delete-pop, .json-session-title-input').length) return;
            finalizeAnyTitleInput();
            removeSessionDeletePop();
            var id = $(this).data('id');
            if (id) selectSessionById(id);
        });

        $('body').on('click', '#json-session-sidebar .btn-session-edit', function (e) {
            e.stopPropagation();
            removeSessionDeletePop();
            var id = $(this).closest('.json-session-item').data('id');
            finalizeAnyTitleInput();
            var row = $('#json-session-sidebar .json-session-item').filter(function () {
                return $(this).data('id') === id;
            });
            var s = jsonSessionsState.list[findSessionIndex(id)];
            if (!s || !row.length) return;
            if (row.find('.json-session-title-input').length) {
                row.find('.json-session-title-input').focus().select();
                return;
            }
            var displayTitle = (s.name && String(s.name).trim()) ? s.name : formatSessionTime(s.savedAt || Date.now());
            var $span = row.find('.json-session-title');
            var $inp = $('<input type="text" class="json-session-title-input" />');
            $inp.val(displayTitle);
            $span.replaceWith($inp);
            $inp.focus().select();

            var closed = false;
            var done = function (save) {
                if (closed) return;
                closed = true;
                $inp.off('.titleEdit');
                if (!save) {
                    renderSessionList();
                    return;
                }
                var v = $.trim($inp.val());
                if (v) s.name = v;
                saveSessionsToStorage();
                renderSessionList();
            };

            $inp.on('keydown.titleEdit', function (ev) {
                if (ev.keyCode === 13) {
                    ev.preventDefault();
                    done(true);
                }
                if (ev.keyCode === 27) {
                    ev.preventDefault();
                    done(false);
                }
            });
            $inp.on('blur.titleEdit', function () {
                done(true);
            });
        });

        $('body').on('click', '#json-session-sidebar .btn-session-delete', function (e) {
            e.stopPropagation();
            var id = $(this).closest('.json-session-item').data('id');
            finalizeAnyTitleInput();
            removeSessionDeletePop();
            var row = $('#json-session-sidebar .json-session-item').filter(function () {
                return $(this).data('id') === id;
            });
            if (!row.length) return;

            var pop = $('<div class="json-session-delete-pop">' +
                '<div class="json-session-delete-pop-panel">' +
                '<span>确定删除？</span>' +
                '<button type="button" class="btn-del-confirm">删除</button>' +
                '<button type="button" class="btn-del-cancel">取消</button>' +
                '</div>' +
                '<span class="json-session-delete-pop-tail" aria-hidden="true"></span>' +
                '</div>');
            $('body').append(pop);
            layoutSessionDeletePop(pop, row[0], document.getElementById('json-session-sidebar'));

            $('#json-session-sidebar').on('scroll.removeDelPop', removeSessionDeletePop);
            $(window).on('resize.removeDelPop', removeSessionDeletePop);

            $(document).off('click.jsonSessionDelPop');
            setTimeout(function () {
                $(document).on('click.jsonSessionDelPop', function (ev) {
                    if ($(ev.target).closest('.json-session-delete-pop').length) return;
                    if ($(ev.target).closest('.btn-session-delete').length) return;
                    removeSessionDeletePop();
                });
            }, 0);

            pop.find('.btn-del-confirm').on('click', function (ev) {
                ev.stopPropagation();
                removeSessionDeletePop();
                deleteSessionById(id);
            });
            pop.find('.btn-del-cancel').on('click', function (ev) {
                ev.stopPropagation();
                removeSessionDeletePop();
            });
        });

        $('#json-src').on('paste', function (e) {
            var ta = this;
            var len = ta.value.length;
            var fullRange = ta.selectionStart === 0 && ta.selectionEnd === len;
            if (!fullRange) return;
            if ($.trim(ta.value).length === 0) return;
            if (!jsonSessionsState.selectedId) return;
            setTimeout(function () {
                var text = $(ta).val();
                addSessionAndSelect(text, formatSessionTime(Date.now()));
            }, 0);
        });
    }

    function init() {
        xml_flag = false;
        zip_flag = false;
        shown_flag = false;
        compress_flag = false;
        isXml = false;
        renderLine();
        $('.xml').attr('style', 'color:#999;');
        $('.zip').attr('style', 'color:#999;');

    }

    $('#cancelZY').click(function () {
        init();
        var content = $.trim($('#json-src').val());
        var result = '';
        if (content != '') {
            //如果是xml,那么转换为json
            if (content.substr(0, 1) === '<' && content.substr(-1, 1) === '>') {
                try {
                    var json_obj = $.xml2json(content);
                    content = JSON.stringify(json_obj);
                } catch (e) {
                    result = '解析错误：<span style="color: #f1592a;font-weight:bold;">' + e.message + '</span>';
                    current_json_str = result;
                    $('#json-target').html(result);
                    return false;
                }

            }
            try {
                var hasZY = $('#cancelZY').prop('checked');
                if (hasZY) {
                    content = content.replace(/\\/g, '\\\\');
                    content = content.replace(/\\"/g, '\\\\"');
                }

                current_json = jsonlint.parse(content);
                current_json_str = JSON.stringify(current_json);
                //current_json = JSON.parse(content);
                current_content = content;
                result = new JSONFormat(content, 4).toString();
            } catch (e) {
                result = '<span style="color: #f1592a;font-weight:bold;">' + e + '</span>';
                current_json_str = result;
            }

            $('#json-target').html(result);
        } else {
            $('#json-target').html('');
        }
        persistSelectedSessionContent();
    });

    var isXml = false;
    $('#json-src').keyup(function () {
        init();
        var content = $.trim($(this).val());
        var result = '';
        if (content != '') {
            //如果是xml,那么转换为json
            if (content.substr(0, 1) === '<' && content.substr(-1, 1) === '>') {
                isXml = true;
                try {
                    var json_obj = $.xml2json(content);
                    content = JSON.stringify(json_obj);
                } catch (e) {
                    result = '解析错误：<span style="color: #f1592a;font-weight:bold;">' + e.message + '</span>';
                    current_json_str = result;
                    $('#json-target').html(result);
                    return false;
                }

            }

            try {
                var hasZY = $('#cancelZY').prop('checked');
                if (hasZY) {
                    content = content.replace(/\\/g, '\\\\');
                    content = content.replace(/\\"/g, '\\\\"');
                }

                current_json = jsonlint.parse(content);
                current_json_str = JSON.stringify(current_json);

                //current_json = JSON.parse(content);
                current_content = content;
                result = new JSONFormat(content, 4).toString();
            } catch (e) {
                result = '<span style="color: #f1592a;font-weight:bold;">' + e + '</span>';
                current_json_str = result;
            }

            $('#json-target').html(result);
        } else {
            $('#json-target').html('');
        }
        persistSelectedSessionContent();

    });

    //主入口
    function getRealJsonData(baseStr) {
        if (!baseStr || typeof baseStr != 'string') return;
        var jsonData = null;
        try {
            jsonData = JSON.parse(baseStr);
        } catch (err){
            return null;
        }
        var needReplaceStrs = [];
        loopFindArrOrObj(jsonData,needReplaceStrs);
        needReplaceStrs.forEach(function (replaceInfo) {
            var matchArr = baseStr.match(eval('/"'+ replaceInfo.key + '":[0-9]{15,}/'));
            if (matchArr) {
                var str = matchArr[0];
                var replaceStr = str.replace('"' + replaceInfo.key + '":','"' + replaceInfo.key + '":"');
                replaceStr += '"';
                baseStr = baseStr.replace(str,replaceStr);
            }
        });
        var returnJson = null;
        returnJson = JSON.parse(baseStr);
        return returnJson;
    }
    //遍历对象类型的
    function getNeedRpStrByObj(obj,needReplaceStrs) {
        for (var key in obj) {
            var value = obj[key];
            if (typeof value == 'number' && value > 9007199254740992){
                needReplaceStrs.push({key:key});
            }
            loopFindArrOrObj(value,needReplaceStrs);
        }
    }
    //遍历数组类型的
    function getNeedRpStrByArr(arr,needReplaceStrs) {
        for(var i=0; i<arr.length; i++){
            var value = arr[i];
            loopFindArrOrObj(value,needReplaceStrs);
        }
    }
    //递归遍历
    function loopFindArrOrObj(value,needRpStrArr) {
        var valueTypeof = Object.prototype.toString.call(value);
        if (valueTypeof == '[object Object]') {
            needRpStrArr.concat(getNeedRpStrByObj(value,needRpStrArr));
        }
        if (valueTypeof == '[object Array]') {
            needRpStrArr.concat(getNeedRpStrByArr(value,needRpStrArr));
        }
    }


    $('#right-box').keyup(function () {

        var text = $('#json-target').html().replace(/<br\/>/g, "\n").replace(/<br>/g, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/ig, " ").replace(/Object{...}/ig, "").replace(/Array\[[0-9]+\]/ig, "");
        if (!xml_flag) {
            $('#json-src').val(text);
            current_content = text;
        }

    });
    $('.xml').click(function () {
        if (xml_flag) {
            $('#json-src').keyup();
        } else {
            var result = $.json2xml(current_content);
            $('#json-target').html('<textarea style="width:100%;position:absolute;height: 80vh;min-height:480px;border:0;resize:none;">' + result + '</textarea>');
            xml_flag = true;
            $(this).attr('style', 'color:#15b374;');
        }

    });
    $('.shown').click(function () {
        if (!shown_flag) {
            renderLine();
            $('#line-num').show();
            console.log($('#line-num'))
            $('.numberedtextarea-line-numbers').show();
            shown_flag = true;
            $(this).attr('style', 'color:#15b374;');
        } else {
            $('#line-num').hide();
            $('.numberedtextarea-line-numbers').hide();
            shown_flag = false;
            $(this).attr('style', 'color:#999;');
        }
    });

    function renderLine() {
        var line_num = $('#json-target').height() / 20;
        $('#line-num').html("");
        var line_num_html = "";
        for (var i = 1; i < line_num + 1; i++) {
            line_num_html += "<div>" + i + "<div>";
        }
        $('#line-num').html(line_num_html);
    }

    $('.zip').click(function () {
        if (zip_flag) {
            $('#json-src').keyup();
        } else {
            //$('#json-target').html(current_json_str.replace(/</g,"&lt;").replace(/>/g,"&gt;"));
            $('#json-target').html("<xmp>" + current_json_str + "</xmp>");
            zip_flag = true;
            $(this).attr('style', 'color:#15b374;');
        }

    });
    $('.compress').click(function () {
        if (!compress_flag) {
            $(this).attr('style', 'color:#15b374;');
            //$(this).attr('title','取消折叠').tooltip('fixTitle').tooltip('show');
            $($(".fa-minus-square-o").toArray().reverse()).click();
            compress_flag = true;
        } else {
            while ($(".fa-plus-square-o").length > 0) {
                $(".fa-plus-square-o").click();
            }
            compress_flag = false;
            $(this).attr('style', 'color:#555;');
            $(this).attr('title', '折叠').tooltip('fixTitle').tooltip('show');
        }
    });
    $('.clear').click(function () {
        $('#json-src').val('');
        $('#json-target').html('');
        persistSelectedSessionContent();
    });
    //读取share
    console.log(getPar('share'));
    if(getPar('share'))
    {
        // 如果index.php没有配置不缓存，使用get请求会被缓存，百度云暂时不缓存post请求
        $.post("/index.php?is_ajax=1&s=api&app=blog&c=tran&m=read_share&sign="+getPar('share'),function (data) {
            if(data.code==1)
            {
                $("#json-src").val(data.data.content);
                $('#cancelZY').click();
            }

        }, 'jsonp')
    }
    function getPar(par){
        //获取当前URL
        var local_url = document.location.hash.replace('#','');
        //获取要取得的get参数位置
        var get = local_url.indexOf(par +"=");
        if(get == -1){
            return false;
        }
        //截取字符串
        var get_par = local_url.slice(par.length + get + 1);
        //判断截取后的字符串是否还有其他get参数
        var nextPar = get_par.indexOf("&");
        if(nextPar != -1){
            get_par = get_par.slice(0, nextPar);
        }
        return get_par;
    }






    (function ($) {
        $.fn.innerText = function (msg) {
            if (msg) {
                if (document.body.innerText) {
                    for (var i in this) {
                        this[i].innerText = msg;
                    }
                } else {
                    for (var i in this) {
                        this[i].innerHTML.replace(/&amp;lt;br&amp;gt;/gi, "n").replace(/(&amp;lt;([^&amp;gt;]+)&amp;gt;)/gi, "");
                    }
                }
                return this;
            } else {
                if (document.body.innerText) {
                    return this[0].innerText;
                } else {
                    return this[0].innerHTML.replace(/&amp;lt;br&amp;gt;/gi, "n").replace(/(&amp;lt;([^&amp;gt;]+)&amp;gt;)/gi, "");
                }
            }
        };
    })(jQuery);
    $('.save').click(function () {
        // var content = JSON.stringify(current_json);
        // $('#txt-content').val(content);
        //var text = "hell world";
        var html = $('#json-target').html().replace(/\n/g, '<br/>').replace(/\n/g, '<br>');
        var text = $('#json-target').innerText().replace('　　', '    ');
        var blob = new Blob([text], {type: "application/json;charset=utf-8"});
        var timestamp = new Date().getTime();
        saveAs(blob, "format." + timestamp + ".json");
    });
    function showJsonPageToast(msg, duration, isError) {
        var toastEl = document.getElementById('json-page-toast');
        if (!toastEl) return;
        if (msg === undefined || msg === '') msg = '已复制到剪贴板';
        if (duration === undefined) duration = 1500;
        isError = !!isError;
        toastEl.textContent = msg;
        if (isError) toastEl.style.background = 'rgba(220,38,38,0.9)';
        else toastEl.style.background = 'rgba(15,23,42,0.9)';
        toastEl.classList.add('show');
        clearTimeout(window._jsonPageToastTimer);
        window._jsonPageToastTimer = setTimeout(function () {
            toastEl.classList.remove('show');
        }, duration);
    }

    var clipboard = new Clipboard('.copy');
    clipboard.on('success', function (e) {
        showJsonPageToast('复制成功');
        e.clearSelection();
    });
    clipboard.on('error', function () {
        showJsonPageToast('复制失败', 1800, true);
    });

    initJsonSessionsPanel();

    //拖拽
    var totalWidth = $('#editor-split-main').outerWidth() || $(window).outerWidth();
    var gapWidth = 0;
    var forbidenWidth = totalWidth - 400;
    $('#dragEle').myDrag({
        parent: '#editor-split-main', //定义拖动不能超出的外框,拖动范围
        randomPosition: false, //初始化随机位置
        direction: 'x', //方向
        handler: false, //把手
        dragStart: function (x, y) {
            totalWidth = $('#editor-split-main').outerWidth() || $(window).outerWidth();
            gapWidth = 0;
            forbidenWidth = totalWidth - 400;
        }, //拖动开始 x,y为当前坐标
        dragEnd: function (x, y) {
            totalWidth = $('#editor-split-main').outerWidth() || $(window).outerWidth();
            gapWidth = 0;
            forbidenWidth = totalWidth - 400;

            if (x > forbidenWidth) {
                $('#dragEle').css('left', forbidenWidth - 5 + 'px');
                $('#editor-split-main .col-md-5').width(forbidenWidth);
                $('#editor-split-main .col-md-7').width(totalWidth - forbidenWidth);
            } else if (x < 200) {
                $('#dragEle').css('left', '195px');
                $('#editor-split-main .col-md-5').width(200);
                $('#editor-split-main .col-md-7').width(totalWidth - 200);
            } else {
                $('#editor-split-main .col-md-5').width(x);
                $('#editor-split-main .col-md-7').width(totalWidth - x - 1);
            }
        }, //拖动停止 x,y为当前坐标
        dragMove: function (x, y) {
            if (x > forbidenWidth || x < 200) {

            } else {
                $('#editor-split-main .col-md-5').width(x);
                $('#editor-split-main .col-md-7').width(totalWidth - x - 1);
            }
        } //拖动进行中 x,y为当前坐标
    });
    $(window).resize(function () {
        $('#dragEle').css('left', '');
        $('#editor-split-main .col-md-7').css('width', '');
        $('#editor-split-main .col-md-5').css('width', '');
    });

    //搜索
    $('select.chosen-select').on('change', function () {

        window.location.href = $(this).val()
    });
    // if ($(window).scrollTop() > 100) {
    //     $('#goTop').show();
    // } else {
    //     $('#goTop').hide();
    // }
    //
    // $(window).scroll(function () {
    //     if ($(window).scrollTop() > 100) {
    //         $('#goTop').fadeIn(200);
    //     } else {
    //         $('#goTop').fadeOut(200);
    //     }
    // });
    $('body').on('click', '#goTop', function () {
        $('body,html').animate({
                scrollTop: 0
            },
            500);
        return false;
    });

    /*收藏*/
    $('body').on('click', '.xf-collection', function () {
        alert('您的浏览器不支持,请按 Ctrl+D 手动收藏!')
    });

    $('body').on('mouseenter','.ind-footer-nav-item',function () {
        $('.ind-footer-nav-item').removeClass('active')
        $(this).addClass('active');
        var index = $(this).attr('data-index');
        $('.ind-footer-nav-show').each(function (i, v) {
            if ($(this).attr('data-index') == index){
                $(this).addClass('active')
            }else {
                $(this).removeClass('active');
            }
        });
    });


    $('body').on('mouseenter','.nav-show-one',function () {
        $('.nav-show-one').removeClass('active');
        $(this).addClass('active');
        var itext = $(this).text();
        var ione = $(this).attr('data-chose');
        $(this).closest('.ind-footer-nav-show').find('.nav-show-one-sm-s-show').each(function (i, v) {
            $(v).hide();
            var index =  $(v).attr('data-target');
            if (ione == index){
                $(v).find('.nav-show-one-sm-show-t').text(itext)
                $(v).show();
            }
        });
    });
