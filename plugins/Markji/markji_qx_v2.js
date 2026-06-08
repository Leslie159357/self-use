// ==Quantumult X==
// @name         墨墨记忆卡 专业版解锁 v1.1
// @description  解锁墨墨记忆卡专业版所有功能 - 修改 /api/v2/system/check 响应
// @version      1.1
// @author       Minis
// @icon         https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/86/20/1f/86201fdf-27f5-b2b9-14e5-56ad5784fee9/AppIcon-0-0-1x_U007emarketing-0-7-0-0-85-220.png/512x512bb.png
// ==/Quantumult X==

var url = $request.url;
var body = $response.body;

if (typeof $response === 'undefined') {
    $done({});
}

if (!body) {
    $done({});
}

if (url.indexOf('/api/v2/system/check') === -1) {
    $done({});
}

try {
    var obj = JSON.parse(body);
    if (!obj || !obj.data) {
        $done({});
    }
    
    // 专业版解锁
    obj.data.plus_info = {
        "is_plus": true,
        "plus_expires_time": "2099-12-31T23:59:59.000Z",
        "is_lifetime": true
    };
    
    // 已付费标记
    obj.data.has_paid = true;
    
    // 学习限制解除
    obj.data.study_limit_info = {
        "day_new_limit": 9999,
        "day_review_limit": 99999,
        "new_affected_by_review_limit": false
    };
    
    // 牌组配额
    obj.data.study_info.private_deck_quota = 99999;
    obj.data.study_info.public_deck_quota = 99999;
    obj.data.study_info.replenish_card_count = 999;
    obj.data.study_info.available_mark = 999999;
    obj.data.study_info.free_mark = 999999;
    obj.data.study_info.paid_mark = 999999;
    
    // 卡片定价
    obj.data.card_price_enabled = true;
    obj.data.card_price_min_limit = 0;
    obj.data.card_price_max_limit = 999;
    obj.data.card_price_study_users_limit = 99999;
    
    // 其他限制
    obj.data.is_deck_max_limit_reached = false;
    
    $done({body: JSON.stringify(obj)});
} catch(e) {
    $done({});
}
