// 喜马拉雅 VIP解锁脚本 v1.0
// 拦截关键API，解锁VIP会员/付费单集/无限试听

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

// ===== 1. VIP会员状态 =====
if (url.indexOf('/mobile-user/my/vip') !== -1) {
    // vipStatus: 0→1 (正式会员)
    // 伪造一个已激活的VIP状态
    if (obj.data && Array.isArray(obj.data)) {
        for (var i = 0; i < obj.data.length; i++) {
            if (obj.data[i]) {
                obj.data[i].vipStatus = 1;
            }
        }
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== 2. 播放页Tabs V2 (核心) =====
if (url.indexOf('/mobile-playpage/playpage/tabs/v2/') !== -1) {
    if (obj.data && obj.data.playpage) {
        var pp = obj.data.playpage;

        // --- TrackInfo ---
        if (pp.trackInfo) {
            pp.trackInfo.isPaid = false;
            pp.trackInfo.isFree = true;
            pp.trackInfo.isVipFree = true;
            pp.trackInfo.isAuthorized = true;
            // 试听时长设为0（无限试听 = 不截断）
            pp.trackInfo.sampleDuration = 999999;
            pp.trackInfo.vipFreeType = 0;
            pp.trackInfo.vipFirstStatus = 1;
            // 价格改为免费
            pp.trackInfo.price = 0;
            pp.trackInfo.discountedPrice = 0;
            pp.trackInfo.displayPrice = "免费";
            pp.trackInfo.displayDiscountedPrice = "免费";
            // 防盗链标记关闭
            pp.trackInfo.isAntiLeech = false;
            // 高清音质解锁
            if (pp.trackInfo.trackQualityList && Array.isArray(pp.trackInfo.trackQualityList)) {
                for (var j = 0; j < pp.trackInfo.trackQualityList.length; j++) {
                    if (pp.trackInfo.trackQualityList[j]) {
                        pp.trackInfo.trackQualityList[j].canChoose = true;
                        pp.trackInfo.trackQualityList[j].needVip = false;
                        pp.trackInfo.trackQualityList[j].hasQuota = true;
                    }
                }
            }
            // priceTypes
            if (pp.trackInfo.priceTypes && Array.isArray(pp.trackInfo.priceTypes)) {
                for (var k = 0; k < pp.trackInfo.priceTypes.length; k++) {
                    if (pp.trackInfo.priceTypes[k]) {
                        pp.trackInfo.priceTypes[k].isVipFree = true;
                        pp.trackInfo.priceTypes[k].price = "0";
                        pp.trackInfo.priceTypes[k].discountedPrice = "0";
                        pp.trackInfo.priceTypes[k].displayPrice = "免费";
                        pp.trackInfo.priceTypes[k].displayDiscountedPrice = "免费";
                    }
                }
            }
        }

        // --- AlbumInfo ---
        if (pp.albumInfo) {
            pp.albumInfo.isPaid = false;
            pp.albumInfo.isVipFree = true;
            pp.albumInfo.isVipFirst = true;
            pp.albumInfo.isAuthorized = true;
            pp.albumInfo.vipFreeType = 0;
            pp.albumInfo.freeListenStatus = 1;
            pp.albumInfo.price = 0;
            pp.albumInfo.discountedPrice = 0;
            pp.albumInfo.displayPrice = "免费";
            pp.albumInfo.priceUnit = "免费";
        }

        // --- otherInfo ---
        if (pp.otherInfo) {
            pp.otherInfo.currentUserIsVip = true;
            pp.otherInfo.isAutoBuy = true;
            pp.otherInfo.expiringSoon = false;
        }

        // --- authorizeInfo ---
        if (pp.authorizeInfo) {
            pp.authorizeInfo.isTrackAuthorized = true;
            pp.authorizeInfo.isAlbumAuthorized = true;
            pp.authorizeInfo.hasWiretapped = false;
        }

        // --- vipResourceBtns (移除购买按钮) ---
        if (pp.vipResourceBtns && Array.isArray(pp.vipResourceBtns)) {
            pp.vipResourceBtns = [];
        }
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== 3. 播放页View =====
if (url.indexOf('/mobile-playpage/view/') !== -1) {
    // 这个接口目前没有isPaid字段，但保留以备用
    $done({body: body});
    return;
}

// ===== 4. 专辑价格弹窗 =====
if (url.indexOf('/product/promotion/v1/album/price/') !== -1) {
    if (obj.data && obj.data.behaviors && Array.isArray(obj.data.behaviors)) {
        for (var m = 0; m < obj.data.behaviors.length; m++) {
            if (obj.data.behaviors[m]) {
                // 隐藏所有购买按钮
                obj.data.behaviors[m].isHidden = true;
                if (obj.data.behaviors[m].afterSampleButtonText) {
                    obj.data.behaviors[m].afterSampleButtonText = "VIP会员 畅听中";
                }
                obj.data.behaviors[m].labelText = "";
                if (obj.data.behaviors[m].labelSubTitle) {
                    obj.data.behaviors[m].labelSubTitle = "";
                }
                // 移除购买行为
                if (obj.data.behaviors[m].action && obj.data.behaviors[m].action.type === 'url') {
                    obj.data.behaviors[m].action.type = 'none';
                }
            }
        }
        obj.data.afterSampleTitle = "VIP会员畅听无限制";
        obj.data.afterSampleSubTitle = "";
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== 5. 历史记录详情 =====
if (url.indexOf('/nyx/history/query/detail') !== -1) {
    if (obj.data && obj.data.listenModels && Array.isArray(obj.data.listenModels)) {
        for (var n = 0; n < obj.data.listenModels.length; n++) {
            var model = obj.data.listenModels[n];
            if (model) {
                model.isPaid = false;
                model.isVipFree = true;
                model.isAuthorized = true;
                model.paid = false;
                model.vipFreeType = 0;
                model.breakSecond = 999999; // 试听时长无限
            }
        }
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// ===== 6. 历史记录ID列表 =====
if (url.indexOf('/nyx/history/query/id/list') !== -1) {
    // 这个接口没有付费字段，透传
    $done({body: body});
    return;
}

// ===== 7. 首页个人信息 =====
if (url.indexOf('/mobile-user/v2/homePage/') !== -1) {
    if (obj.data) {
        // VIP相关字段全部改为true
        obj.data.isVip = true;
        obj.data.vipStatus = 1;
        if (obj.data.vipInfo) {
            obj.data.vipInfo.isVip = true;
            obj.data.vipInfo.status = 1;
        }
        if (obj.data.svipInfo) {
            obj.data.svipInfo.isVip = true;
            obj.data.svipInfo.status = 1;
        }
        if (obj.data.platinumVipInfo) {
            obj.data.platinumVipInfo.isVip = true;
            obj.data.platinumVipInfo.status = 1;
        }
        if (obj.data.childSVipInfo) {
            obj.data.childSVipInfo.isVip = true;
            obj.data.childSVipInfo.status = 1;
        }
        if (obj.data.anchorVipInfo) {
            obj.data.anchorVipInfo.isVip = true;
        }
    }
    $done({body: JSON.stringify(obj)});
    return;
}

// 未匹配到任何规则，透传
$done({body: body});
