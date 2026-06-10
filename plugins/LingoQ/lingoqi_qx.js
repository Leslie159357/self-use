// LingoQ VIP Unlock - MITM Script v2.2
// QX & Loon 通用
// 基于抓包数据: 修复SSE流截断问题，保留字幕拦截
// Bundle ID: com.lingoq.ios.lingeqi

// =============================================
// 配置区
// =============================================

// VIP 字段配置（基于实际抓包验证）
const VIP_CONFIG = {
    // VIP 核心字段（来自 /usercenter-facade-app-prod/users/index）
    vip: true,
    lifetimeVip: true,
    vipLeftDays: 99999,
    
    // 订阅/会员状态
    isVip: true,
    is_vip: true,
    vipStatus: 1,
    vip_status: 1,
    memberStatus: 1,
    member_status: 1,
    membershipStatus: 1,
    membership_status: 1,
    isMember: true,
    is_member: true,
    isPremium: true,
    is_premium: true,
    isPro: true,
    is_pro: true,
    isSubscriber: true,
    is_subscriber: true,
    subscriber: true,
    subscriptionStatus: "active",
    subscription_status: "active",
    status: "active",
    
    // 到期时间 (2099-12-31)
    expireDate: "2099-12-31T23:59:59Z",
    expire_date: "2099-12-31T23:59:59Z",
    expiryDate: "2099-12-31T23:59:59Z",
    expiry_date: "2099-12-31T23:59:59Z",
    expirationDate: "2099-12-31T23:59:59Z",
    expiration_date: "2099-12-31T23:59:59Z",
    vipExpireDate: "2099-12-31T23:59:59Z",
    vip_expire_date: "2099-12-31T23:59:59Z",
    vipEndDate: "2099-12-31T23:59:59Z",
    vip_end_date: "2099-12-31T23:59:59Z",
    
    // 时间戳
    expireTimestamp: 4102444799,
    expire_timestamp: 4102444799,
    expiryTimestamp: 4102444799,
    expiry_timestamp: 4102444799,
    vipEndTimestamp: 4102444799,
    vip_end_timestamp: 4102444799,
    vipEndUts: 4102444799000,
    vip_end_uts: 4102444799000,
    
    // 付费状态
    hasPurchased: true,
    has_purchased: true,
    hasBought: true,
    has_bought: true,
    isPaid: true,
    is_paid: true,
    paid: true,
    payed: true,
    purchased: true,
    
    // 其他
    isTrial: false,
    is_trial: false,
    isExpired: false,
    is_expired: false,
    isCancelled: false,
    is_cancelled: false,
    autoRenew: true,
    auto_renew: true,
    canTrial: false,
    can_trial: false,
    trialPeriod: false,
    trial_period: false,
    
    // 数量类 - 无限
    balance: 999999,
    credit: 999999,
    credits: 999999,
    coin: 999999,
    coins: 999999,
    gems: 999999,
    diamond: 999999,
    diamonds: 999999,
    points: 999999,
    score: 999999,
    trophy: 999999,
    trophy_num: 999999,
    flower: 999999,
    heart: 999999,
    energy: 999999,
    star: 999999,
    stars: 999999,
    signInDays: 999,
};

// VIP相关Key名（递归匹配用）
const VIP_KEYS = [
    'vip', 'member', 'subscription', 'premium', 'pro', 'subscriber',
    'paid', 'payed', 'purchased', 'bought',
    'expire', 'expiry', 'expiration',
    'trial', 'auto_renew', 'autoRenew',
    'is_free', 'isFree',
    'balance', 'credit', 'coin', 'gem', 'diamond', 'trophy',
    'flower', 'heart', 'energy', 'star', 'point', 'score',
    'entitlement', 'entitle',
    'privilege', 'right',
    'apple_order', 'appleOrder',
    'receipt', 'verify',
    'codeRedemption', 'redemption',
    'signInDays', 'sign_in_days',
];

// SSE 流接口（直接透传，不尝试解析 JSON）
const SSE_PATHS = [
    'stream/video/chat',
];

// 需要透传的静态资源
const PASSTHROUGH_EXTENSIONS = [
    '.m3u8', '.ts', '.jpg', '.png', '.gif', '.wav', '.mp3',
];

// =============================================
// 核心逻辑
// =============================================

function isSSE(url) {
    for (const p of SSE_PATHS) {
        if (url.includes(p)) return true;
    }
    return false;
}

function isPassthrough(url) {
    for (const ext of PASSTHROUGH_EXTENSIONS) {
        if (url.includes(ext)) return true;
    }
    return false;
}

function recursiveModify(obj, path = '') {
    if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            obj[i] = recursiveModify(obj[i], path + '[' + i + ']');
        }
        return obj;
    }
    
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const val = obj[key];
        const currentPath = path ? path + '.' + key : key;
        const keyLower = key.toLowerCase();
        
        // 精确匹配VIP配置
        if (VIP_CONFIG.hasOwnProperty(key)) {
            obj[key] = VIP_CONFIG[key];
            continue;
        }
        
        // 拦截 subtitleUrl - 阻止盗版提示字幕加载
        if (keyLower === 'subtitleurl' && typeof val === 'string' && val.includes('video-subtitle/')) {
            obj[key] = '';
            continue;
        }
        
        // 数字 0/1 布尔类字段泛匹配
        if (val === false || val === 0) {
            for (const vipKey of VIP_KEYS) {
                if (keyLower.includes(vipKey.toLowerCase())) {
                    if (typeof val === 'boolean') {
                        obj[key] = true;
                    } else if (typeof val === 'number') {
                        obj[key] = 1;
                    }
                    break;
                }
            }
        }
        
        // 数字 0 泛匹配余额类
        if (val === 0 && typeof val === 'number') {
            for (const balKey of ['balance', 'credit', 'coin', 'gem', 'diamond', 'trophy', 'flower', 'heart', 'energy', 'star', 'point', 'score']) {
                if (keyLower.includes(balKey)) {
                    obj[key] = 999999;
                    break;
                }
            }
        }
        
        // 递归遍历对象
        if (typeof val === 'object') {
            obj[key] = recursiveModify(val, currentPath);
        }
    }
    return obj;
}

// QX/Loon hook: 响应拦截
if (typeof $response !== 'undefined' && $response.body) {
    const url = $request.url || '';
    
    // SSE 流接口直接透传，不处理
    if (isSSE(url)) {
        $done({});
        return;
    }
    
    // 静态资源透传
    if (isPassthrough(url)) {
        $done({});
        return;
    }
    
    try {
        let body = JSON.parse($response.body);
        if (typeof body === 'object') {
            body = recursiveModify(body);
            $done({ body: JSON.stringify(body) });
        } else {
            $done({});
        }
    } catch (e) {
        // 非 JSON 响应直接透传
        $done({});
    }
} else {
    $done({});
}
