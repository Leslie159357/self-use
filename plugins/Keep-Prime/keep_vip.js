// Keep 会员解锁脚本 v1.1
// 拦截 kprime 系列 API，修改会员状态
// 支持 api.gotokeep.com

const FUTURE_TS = 4197830400000;

var url = $request.url;
var body = $response.body;

if (!$response.body) {
    $done({});
    return;
}

try {
    var obj = JSON.parse(body);
    if (!obj) {
        $done({});
        return;
    }
} catch (e) {
    $done({});
    return;
}

// ===== 1. kprime/v1/auth — 会员认证核心 =====
if (url.indexOf('/kprime/v1/auth') !== -1 && url.indexOf('/kprime/v1/auth?') === -1) {
    if (obj.data) {
        var now = Date.now();
        var futureExpire = now + 365 * 24 * 3600 * 1000; // 1年后过期
        obj.data.status = 1;
        obj.data.statusTrack = "active";
        obj.data.gmtExpire = futureExpire;
        obj.data.gmtCurrentTypeExpire = futureExpire;
        obj.data.gmtPaidTypeExpire = futureExpire;
        obj.data.memberType = "NORMAL";
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== 2. kprime/v2/infoForClient — 会员状态汇总 =====
if (url.indexOf('/kprime/v2/infoForClient') !== -1) {
    if (obj.data) {
        var st = JSON.parse(obj.data.status);
        for (var key in st) {
            if (st[key] === "expired") st[key] = "active";
        }
        obj.data.status = JSON.stringify(st);
        obj.data.primeStatus = "active";
        
        if (obj.data.memberDTOList && Array.isArray(obj.data.memberDTOList)) {
            for (var i = 0; i < obj.data.memberDTOList.length; i++) {
                var m = obj.data.memberDTOList[i];
                if (m) {
                    m.status = 1;
                    m.statusTrack = "active";
                    var now = Date.now();
                    m.gmtExpire = now + 365 * 24 * 3600 * 1000;
                    m.gmtCurrentTypeExpire = now + 365 * 24 * 3600 * 1000;
                    m.gmtPaidTypeExpire = now + 365 * 24 * 3600 * 1000;
                }
            }
        }
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== 3. kprime/v2/home/complete/tab — 会员首页 =====
if (url.indexOf('/kprime/v2/home/complete/tab') !== -1) {
    if (obj.data) {
        obj.data.headCopy = "会员畅享中";
        if (obj.data.memberInfo) {
            obj.data.memberInfo.status = 1;
        }
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== 4. kprime/v4/suit/sales/entrance — 付费弹窗 =====
if (url.indexOf('/kprime/v4/suit/sales/entrance') !== -1) {
    if (obj.data && obj.data.memberEntrance) {
        obj.data.memberEntrance.prime = true;
        obj.data.memberEntrance.memberStatus = 1;
        obj.data.memberEntrance.buttonText = "开始训练";
        obj.data.memberEntrance.limitFree = true;
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== 5. kprime/v1/member/privilege — 特权校验 =====
if (url.indexOf('/kprime/v1/member/privilege') !== -1) {
    if (obj.data === false || obj.data === "false") {
        obj.data = true;
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== 6. arke-webapp/v2/suit/smart/customize/preview — 定制预览 =====
if (url.indexOf('/arke-webapp/v2/suit/smart/customize/preview') !== -1) {
    if (obj.data) {
        if (obj.data.eventTrackInfo) {
            obj.data.eventTrackInfo.primeStatus = "active";
        }
        if (obj.data.config) {
            obj.data.config.memberStatus = 1;
        }
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== 7. suit/v1/recommend/structuration/all — 课程推荐去会员标记 =====
if (url.indexOf('/suit/v1/recommend/structuration/all') !== -1) {
    if (obj.data && obj.data.categorySuits && Array.isArray(obj.data.categorySuits)) {
        for (var i = 0; i < obj.data.categorySuits.length; i++) {
            var cat = obj.data.categorySuits[i];
            if (cat && cat.suits && Array.isArray(cat.suits)) {
                for (var j = 0; j < cat.suits.length; j++) {
                    var s = cat.suits[j];
                    if (s) {
                        if (s.hasPlus === true) s.hasPlus = false;
                        if (s.paidType === 1) s.paidType = 0;
                    }
                }
            }
        }
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== 8. twins/v6/feed/course — 课程推荐列表 =====
if (url.indexOf('/twins/v6/feed/course') !== -1) {
    if (obj.data) {
        fixPaidFields(obj.data);
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== 9. suit/v1/recommend/top/module/info — 个性定制卡片 =====
if (url.indexOf('/suit/v1/recommend/top/module/info') !== -1) {
    // 这个接口目前没有明显的会员字段，但保留透传
    $done({body: body});
    return;
}

// ===== 10. pencil-webapp/play/v1/games — 活动配置 =====
if (url.indexOf('/pencil-webapp/play/v1/games') !== -1) {
    if (obj.data && obj.data.games && Array.isArray(obj.data.games)) {
        for (var i = 0; i < obj.data.games.length; i++) {
            var g = obj.data.games[i];
            if (g && g.microGames && Array.isArray(g.microGames)) {
                for (var j = 0; j < g.microGames.length; j++) {
                    var mg = g.microGames[j];
                    if (mg && mg.leftIcon && mg.leftIcon.info && mg.leftIcon.info.aimodes) {
                        for (var k = 0; k < mg.leftIcon.info.aimodes.length; k++) {
                            var mode = mg.leftIcon.info.aimodes[k];
                            if (mode) {
                                // 解除限免限制
                                if (mode.limitCount !== undefined) {
                                    mode.limitCount = 9999;
                                }
                                if (mode.labelInfo && mode.labelInfo.text === "限免体验") {
                                    mode.labelInfo.text = "会员免费";
                                }
                                mode.support = true;
                            }
                        }
                    }
                }
            }
        }
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== 通用：递归修复付费字段 =====
function fixPaidFields(o) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) {
        for (var i = 0; i < o.length; i++) {
            fixPaidFields(o[i]);
        }
        return;
    }
    for (var k in o) {
        if (k === 'vipStatus' && o[k] === 3) {
            o[k] = 1;
        } else if (k === 'hasPlus' && o[k] === true) {
            o[k] = false;
        } else if (k === 'paidType' && o[k] === 1) {
            o[k] = 0;
        } else if (typeof o[k] === 'object') {
            fixPaidFields(o[k]);
        }
    }
}

// 未匹配，透传
$done({body: body});
