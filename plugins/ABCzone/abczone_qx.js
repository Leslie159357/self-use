// ==UserScript==
// @name         ABCzone (英语天天练) 会员解锁
// @namespace    https://github.com/Leslie159357/Loon-Plugins
// @version      2.0
// @description  破解学而思英语天天练 VIP/SVIP — 基于实际抓包数据构建
// @author       Leslie159357
// @mitm         app.chuangjing.com, api.xueersi.com, bookapp.xueersibook.com, api.xesvip.cn
// ==/UserScript==

const url = $request.url;
let body = $response.body;

if (!body) {
    $done({body});
}

try {
    body = JSON.parse(body);
} catch (e) {
    $done({body: JSON.stringify(body)});
}

/**
 * 递归遍历 JSON，将所有 VIP/会员/订阅相关字段设为解锁状态
 */
function unlockVIP(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    
    // 处理数组
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            if (typeof obj[i] === 'object' && obj[i] !== null) {
                unlockVIP(obj[i], `${path}[${i}]`);
            }
        }
        return;
    }
    
    // 遍历对象 key
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        const lowerKey = key.toLowerCase();
        const fullPath = path ? `${path}.${key}` : key;
        
        // === Bool 类型 VIP 字段 ===
        const boolVIP = [
            'is_vip', 'isvip', 'is_svip', 'is_svip_member', 'is_member',
            'ismember', 'is_subscribe', 'issubscribe', 'is_premium', 'ispremium',
            'is_pro', 'ispro', 'is_proplus', 'is_pro_feature',
            'is_active', 'isactive', 'is_trial', 'istrial',
            'has_bought', 'hasbought', 'is_paid', 'ispaid', 'is_paid_user',
            'vip', 'svip', 'pro', 'premium', 'member', 'subscribe',
            'isenable', 'is_enable', 'isenabled', 'is_enabled',
            'isbuy', 'is_buy', 'ispurchase', 'is_purchase'
        ];
        
        // === Int/Number 类型 VIP 字段 ===
        const intVIP = [
            'vip_status', 'svip_status', 'membership_type', 'membershiptype',
            'viptype', 'vip_type', 'usertype', 'user_type',
            'level', 'vip_level', 'svip_level', 'member_level'
        ];
        
        if (boolVIP.includes(lowerKey)) {
            // 已经是 true 就不改
            if (val === false || val === 'false' || val === 0 || val === '0') {
                obj[key] = true;
                console.log(`✅ Bool: ${fullPath} = false → true`);
            }
        } else if (intVIP.includes(lowerKey)) {
            // vip_status: 0=none, 1=trial, 2=pro(部分), 3=pro+(完整) / svip_status: 0=none, 1=svip
            if (val === 0 || val === '0') {
                if (lowerKey.includes('svip')) {
                    obj[key] = 1;
                } else {
                    obj[key] = 3;
                }
                console.log(`✅ Int: ${fullPath} = ${val} → ${obj[key]}`);
            } else if (val < 3 && !lowerKey.includes('svip')) {
                obj[key] = 3;
                console.log(`✅ Int: ${fullPath} = ${val} → 3`);
            }
        } else if (lowerKey.includes('viptype') || lowerKey.includes('membership_type') || lowerKey.includes('membershiptype')) {
            if (val === 0 || val === '0' || val === false) {
                obj[key] = 2;
                console.log(`✅ Type: ${fullPath} = ${val} → 2`);
            }
        } else if (lowerKey === 'vipendtime' || lowerKey === 'vip_end_time' || lowerKey === 'vipendtime' ||
                   lowerKey.includes('expire') || lowerKey.includes('endtime') || lowerKey.includes('end_time')) {
            // 到期时间设为 2099 年
            if (!val || val === 0 || val === '0' || val === null || val === '') {
                obj[key] = 4092599349000;
                console.log(`✅ Time: ${fullPath} = ${val} → 2099`);
            }
        } else if (lowerKey.includes('surplus_days') || lowerKey.includes('surplusdays') || lowerKey.includes('remain_days')) {
            obj[key] = 36500;
            console.log(`✅ Days: ${fullPath} = ${val} → 36500`);
        } else if (lowerKey === 'status' || lowerKey === 'subscriptionstatus' || lowerKey === 'sub_status') {
            if (val === 'trial' || val === 'unpaid' || val === 'expired' || val === 'none' || val === false || val === 0) {
                obj[key] = 'active';
                console.log(`✅ Status: ${fullPath} = ${val} → active`);
            }
        } else if (lowerKey === 'current_tier' || lowerKey === 'tier' || lowerKey === 'planname' || lowerKey === 'plan_name') {
            if (val === 'free' || val === 0 || val === 'none') {
                obj[key] = 'premium';
                console.log(`✅ Tier: ${fullPath} = ${val} → premium`);
            }
        } else if (lowerKey.includes('subscribe') || lowerKey.includes('subscription')) {
            if (val === false || val === 'false' || val === 0 || val === '0') {
                obj[key] = true;
                console.log(`✅ Sub: ${fullPath} = ${val} → true`);
            }
        } else if (lowerKey.includes('buy_source') || lowerKey.includes('buysource')) {
            if (val === 0 || val === false || val === null) {
                obj[key] = 1;
                console.log(`✅ BuySource: ${fullPath} = ${val} → 1`);
            }
        }
        
        // 递归遍历子对象
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            unlockVIP(obj[key], fullPath);
        }
    }
}

// ===== 特定接口的硬编码覆盖（基于实际抓包） =====

// 1. Flutter: /abc-api/v3/study-level/get-my-level → is_vip, is_svip
if (url.includes('/abc-api/v3/study-level/get-my-level') && body.data) {
    body.data.is_vip = true;
    body.data.is_svip = true;
    console.log('🎯 硬编码: /abc-api/v3/study-level/get-my-level → is_vip=true, is_svip=true');
}

// 2. Flutter: /abc-api/v3/book/get-user-level-list → vip_status
if (url.includes('/abc-api/v3/book/get-user-level-list') && body.data) {
    if (body.data.vip_status !== undefined) {
        body.data.vip_status = 3;
        console.log('🎯 硬编码: /abc-api/v3/book/get-user-level-list → vip_status=3');
    }
    if (body.data.buy_source !== undefined) {
        body.data.buy_source = 1;
    }
}

// 3. Flutter: /abc-api/v3/hello/get-level-list → vip_status, svip_status
if (url.includes('/abc-api/v3/hello/get-level-list') && body.data) {
    if (body.data.vip_status !== undefined) {
        body.data.vip_status = 3;
    }
    if (body.data.svip_status !== undefined) {
        body.data.svip_status = 1;
    }
    console.log('🎯 硬编码: /abc-api/v3/hello/get-level-list → vip_status=3, svip_status=1');
}

// 4. Flutter: /abc-api/v3/pay/order-confirm → has_bought
if (url.includes('/abc-api/v3/pay/order-confirm') && body.data) {
    body.data.has_bought = true;
    console.log('🎯 硬编码: /abc-api/v3/pay/order-confirm → has_bought=true');
}

// 5. Flutter: /abc-api/v3/book-article/get-article-data → is_vip
if (url.includes('/abc-api/v3/book-article/get-article-data') && body.data) {
    body.data.is_vip = true;
    console.log('🎯 硬编码: /abc-api/v3/book-article/get-article-data → is_vip=true');
}

// 6. Flutter: /abc-api/v3/fox-activity/detail → is_svip
if (url.includes('/abc-api/v3/fox-activity/detail') && body.data) {
    body.data.is_svip = true;
    console.log('🎯 硬编码: /abc-api/v3/fox-activity/detail → is_svip=true');
}

// 7. ObjC: /basicsapi/v1/vip/detail (api.xueersi.com)
if (url.includes('/basicsapi/v1/vip/detail') || url.includes('/v1/vip/detail')) {
    console.log('🎯 ObjC VIP Detail 命中: ' + url);
}

// 8. ObjC: /v1/mine/user-status / aggregation/v1/mine/user-status
if (url.includes('/mine/user-status')) {
    console.log('🎯 ObjC user-status 命中: ' + url);
}

// 9. Flutter: /abc-api/v3/user/plan-list-v2
if (url.includes('/abc-api/v3/user/plan-list') || url.includes('/abc-api/v3/user/get-user-data')) {
    console.log('🎯 Flutter 用户数据 命中: ' + url);
}

// 10. Flutter: /abc-api/v3/common/get-user-info
if (url.includes('/abc-api/v3/common/get-user-info')) {
    console.log('🎯 Flutter get-user-info 命中: ' + url);
}

// 执行递归泛匹配（覆盖所有接口中遗漏的字段）
unlockVIP(body);

$done({body: JSON.stringify(body)});
