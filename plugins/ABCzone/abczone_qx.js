// ==UserScript==
// @name         ABCzone (英语天天练) 会员解锁 v2.1
// @namespace    https://github.com/Leslie159357/Loon-Plugins
// @version      2.5
// @description  破解学而思英语天天练 VIP/SVIP + 剑桥收费 — 基于实际抓包数据修复
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

// ===== 日志 =====
const log = [];

/**
 * 递归遍历 JSON，将所有 VIP/会员/订阅相关字段设为解锁状态
 */
function unlockVIP(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            if (typeof obj[i] === 'object' && obj[i] !== null) {
                unlockVIP(obj[i], `${path}[${i}]`);
            }
        }
        return;
    }
    
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
            'isbuy', 'is_buy', 'ispurchase', 'is_purchase',
            'vip_hidden', 'order_hidden',
            'have_permission', 'has_permission',
            'is_svip'
        ];
        
        // === Int/Number 类型 VIP 字段 ===
        const intVIP = [
            'vip_status', 'svip_status', 'membership_type', 'membershiptype',
            'viptype', 'vip_type', 'usertype', 'user_type',
            'level', 'vip_level', 'svip_level', 'member_level'
        ];
        
        if (boolVIP.includes(lowerKey)) {
            if (val === false || val === 'false' || val === 0 || val === '0' || val === null) {
                obj[key] = true;
                log.push(`Bool: ${fullPath} = ${val} → true`);
            }
        } else if (intVIP.includes(lowerKey)) {
            if (val === 0 || val === '0') {
                if (lowerKey.includes('svip')) {
                    obj[key] = 1;
                } else {
                    obj[key] = 3;
                }
                log.push(`Int: ${fullPath} = ${val} → ${obj[key]}`);
            } else if (val < 3 && !lowerKey.includes('svip')) {
                obj[key] = 3;
                log.push(`Int: ${fullPath} = ${val} → 3`);
            }
        } else if (lowerKey.includes('viptype') || lowerKey.includes('membership_type') || lowerKey.includes('membershiptype')) {
            if (val === 0 || val === '0' || val === false) {
                obj[key] = 2;
                log.push(`Type: ${fullPath} = ${val} → 2`);
            }
        } else if (lowerKey === 'vipendtime' || lowerKey === 'vip_end_time' || lowerKey === 'vipendtime' ||
                   lowerKey.includes('expire') || lowerKey.includes('endtime') || lowerKey.includes('end_time') ||
                   lowerKey === 'vip_end_uts' || lowerKey === 'svip_end_uts') {
            if (!val || val === 0 || val === '0' || val === null || val === '') {
                obj[key] = 4092599349000;
                log.push(`Time: ${fullPath} = ${val} → 2099`);
            }
        } else if (lowerKey.includes('surplus_days') || lowerKey.includes('surplusdays') || lowerKey.includes('remain_days')) {
            obj[key] = 36500;
            log.push(`Days: ${fullPath} = ${val} → 36500`);
        } else if (lowerKey === 'status' || lowerKey === 'subscriptionstatus' || lowerKey === 'sub_status') {
            if (val === 'trial' || val === 'unpaid' || val === 'expired' || val === 'none' || val === false || val === 0) {
                obj[key] = 'active';
                log.push(`Status: ${fullPath} = ${val} → active`);
            }
        } else if (lowerKey === 'current_tier' || lowerKey === 'tier' || lowerKey === 'planname' || lowerKey === 'plan_name') {
            if (val === 'free' || val === 0 || val === 'none') {
                obj[key] = 'premium';
                log.push(`Tier: ${fullPath} = ${val} → premium`);
            }
        } else if (lowerKey.includes('subscribe') || lowerKey.includes('subscription')) {
            if (val === false || val === 'false' || val === 0 || val === '0') {
                obj[key] = true;
                log.push(`Sub: ${fullPath} = ${val} → true`);
            }
        } else if (lowerKey.includes('buy_source') || lowerKey.includes('buysource')) {
            if (val === 0 || val === false || val === null) {
                obj[key] = 1;
                log.push(`BuySource: ${fullPath} = ${val} → 1`);
            }
        } else if (lowerKey === 'schema' || lowerKey === 'scheme' || lowerKey.includes('schema_url')) {
            if (val && typeof val === 'string' && val.includes('buyVIP')) {
                obj[key] = '';
                log.push(`Schema: ${fullPath} 已清空(buyVIP跳转)`);
            }
        }
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            unlockVIP(obj[key], fullPath);
        }
    }
}

// ===== 特定接口的硬编码覆盖 =====

// 1. /abc-api/v3/study-level/get-my-level
if (url.includes('/abc-api/v3/study-level/get-my-level') && body.data) {
    body.data.is_vip = true;
    body.data.is_svip = true;
    log.push('🎯 /abc-api/v3/study-level/get-my-level → is_vip=true, is_svip=true');
}

// 2. /abc-api/v3/book/get-user-level-list
if (url.includes('/abc-api/v3/book/get-user-level-list') && body.data) {
    if (body.data.vip_status !== undefined) body.data.vip_status = 3;
    if (body.data.buy_source !== undefined) body.data.buy_source = 1;
    log.push('🎯 /abc-api/v3/book/get-user-level-list → vip_status=3');
}

// 3. /abc-api/v3/hello/get-level-list — 同时清空 vip_button 防止弹窗
if (url.includes('/abc-api/v3/hello/get-level-list') && body.data) {
    if (body.data.vip_status !== undefined) body.data.vip_status = 3;
    if (body.data.svip_status !== undefined) body.data.svip_status = 1;
    body.data.vip_button = false;
    body.data.vip_schema_url = '';
    body.data.vip_button_img = '';
    // 关键修复：module_list 中的 module_status=12 表示 SVIP 锁定
    // 设为 0（可访问）并清空购买跳转链接和 SVIP 图标
    if (body.data.module_list && Array.isArray(body.data.module_list)) {
        for (let i = 0; i < body.data.module_list.length; i++) {
            const m = body.data.module_list[i];
            if (m.module_status === 12) {
                m.module_status = 0;
                m.module_status_img = '';
                m.scheme = '';
                m.button_text = '';
                log.push(`🎯 module_list[${i}]: module_status=12→0, scheme已清空`);
            }
        }
    }
    log.push('🎯 /abc-api/v3/hello/get-level-list → vip_status=3, svip_status=1, vip_button=false, module_status修复');
}

// 4. /abc-api/v3/pay/order-confirm
if (url.includes('/abc-api/v3/pay/order-confirm')) {
    if (body.data) {
        // has_bought
        body.data.has_bought = true;
        // 到期时间
        body.data.vip_end_uts = 4092599349000;
        body.data.svip_end_uts = 4092599349000;
        // 权限
        body.data.have_permission = true;
        body.data.is_exp = false;
        // 隐藏购买入口
        body.data.order_hidden = true;
        // 隐藏剑桥独立商品的购买按钮 — 把 goods_type:1 的商品数量设为0/空
        // 直接把 svip_goods_list 设为空数组，取消所有单项商品的展示
        body.data.svip_goods_list = [];
        body.data.goods_list = [];
        body.data.union_goods_list = [];
        // 隐藏会员权益介绍（含剑桥广告）
        body.data.membership_privileges = [];
        // 清空父评
        body.data.parent_comment = {};
        log.push('🎯 /abc-api/v3/pay/order-confirm → has_bought=true, 到期时间=2099, 所有商品列表已清空');
    }
}

// 5. /abc-api/v3/book-article/get-article-data
if (url.includes('/abc-api/v3/book-article/get-article-data') && body.data) {
    body.data.is_vip = true;
    log.push('🎯 /abc-api/v3/book-article/get-article-data → is_vip=true');
}

// 6. /abc-api/v3/fox-activity/detail
if (url.includes('/abc-api/v3/fox-activity/detail') && body.data) {
    body.data.is_svip = true;
    log.push('🎯 /abc-api/v3/fox-activity/detail → is_svip=true');
}

// 7. /abc-api/v3/pay/get-user-data
if (url.includes('/abc-api/v3/pay/get-user-data') && body.data) {
    body.data.vip_hidden = true;
    body.data.order_hidden = true;
    body.data.vip_end_uts = 4092599349000;
    body.data.svip_end_uts = 4092599349000;
    body.data.vip_days = 36500;
    body.data.vip_scheme = '';
    // 清空弹窗信息，防止 App 弹出开通会员弹窗
    body.data.popup_info = {};
    body.data.vip_button_desc = '';
    log.push('🎯 /abc-api/v3/pay/get-user-data → vip_hidden=true, 到期时间=2099, 弹窗已清除');
}

// 8. /abc-api/v3/common/get-user-info
if (url.includes('/abc-api/v3/common/get-user-info')) {
    log.push('🎯 /abc-api/v3/common/get-user-info 命中');
}

// 9. ObjC: /basicsapi/v1/vip/detail (api.xueersi.com)
if (url.includes('/basicsapi/v1/vip/detail') || url.includes('/v1/vip/detail')) {
    log.push('🎯 ObjC VIP Detail 命中');
}

// 10. 对于剑桥等独立课程接口
if (url.includes('/abc-api/v3/book-article/') || url.includes('/abc-api/v3/learn/')) {
    if (body.data) {
        body.data.is_vip = true;
        body.data.is_svip = true;
    }
}

// 11. camb/get-practice-list — 剑桥情景对话，清空所有 buyVIP schema
if (url.includes('/abc-api/v3/camb/get-practice-list') && body.data) {
    const themes = body.data.theme_list || [];
    for (const t of themes) {
        if (t.list && Array.isArray(t.list)) {
            for (const p of t.list) {
                if (p.schema && p.schema.includes('buyVIP')) {
                    p.schema = '';
                    log.push(`🎯 camb: 清空plan "${p.plan_name}" 的 buyVIP schema`);
                }
            }
        }
    }
}

// 执行递归泛匹配
unlockVIP(body);

// 12. svip/expansion-source/get-video-play-url — 服务端返回 "非SVIP用户不可访问"
// 需要伪造一个成功的播放URL响应
if (url.includes('/abc-api/v3/svip/expansion-source/get-video-play-url')) {
    // 原响应 stat:0, 无法直接使用，需要伪造
    body.stat = 1;
    body.code = 0;
    body.msg = 'success';
    if (!body.data) body.data = {};
    body.data.play_url = '';
    body.data.duration = 0;
    log.push('🎯 svip/get-video-play-url: 伪造成功响应');
}

// 输出日志（精简）
console.log('ABCzone v2.1: ' + log.join(' | '));

$done({body: JSON.stringify(body)});
