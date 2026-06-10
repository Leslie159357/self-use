// ==ClosureCopy==
// ==/ClosureCopy==

// Trancy MITM Plugin v2.0 - 基于抓包数据精准修复
// MITM Domain: api.trancy.org, service.trancy.org, api.revenuecat.com, api.rc-backup.com, api-paywalls.revenuecat.com
//
// 从抓包确认的关键接口：
// 1. api.trancy.org/1/user/profile?includeQuota=1  — premium: false, AIEngineActive: false, stripePremiumActive: null
// 2. service.trancy.org/1/user/profile  — premium: false, subscription: null, AIEngineActive: false
// 3. api.rc-backup.com/v1/subscribers/{id}/offerings  — RevenueCat 产品列表（无需修改，用于显示）

const VERSION = "2.0";

function main() {
  const url = $request.url;
  const pathAndQuery = url.replace(/^https?:\/\/[^\/]+/, '');
  
  // 只处理 JSON 响应
  const ct = ($response.headers['Content-Type'] || ($response.headers['content-type'] || '')).toLowerCase();
  if (!ct.includes('json')) {
    $done({});
    return;
  }
  
  let body;
  try {
    body = JSON.parse(typeof $response.body === 'string' ? $response.body : $response.body.toString());
  } catch (e) {
    $done({});
    return;
  }
  
  // ======= api.trancy.org/1/user/profile 响应 =======
  if (/api\.trancy\.org\/1\/user\/profile/.test(url) && body.data) {
    console.log('[Trancy] Modifying api.trancy.org/1/user/profile');
    const data = body.data;
    
    // VIP 核心字段
    data.premium = true;
    data.stripePremiumActive = true;
    data.stripeAIEngineActive = true;
    data.subscription = "premium";
    data.AIEngineActive = true;
    data.plan = "premium";
    data.tier = "premium";
    data.isPro = true;
    data.isPremium = true;
    data.pro = true;
    
    // 额度
    if (data.quota) {
      if (data.quota.AIEngineBill) {
        data.quota.AIEngineBill.balance = 999999;
        data.quota.AIEngineBill.cost = 0;
        data.quota.AIEngineBill.amount = 999999;
        data.quota.AIEngineBill.OpenAI = 999999;
        data.quota.AIEngineBill.Anthropic = 999999;
        data.quota.AIEngineBill.DeepL = 999999;
        data.quota.AIEngineBill.Google = 999999;
        data.quota.AIEngineBill.DeepSeek = 999999;
        data.quota.AIEngineBill.Meta = 999999;
        data.quota.AIEngineBill.GLM = 999999;
        data.quota.AIEngineBill.tokens = 999999;
        data.quota.AIEngineBill.AIEngineExpired = 9999999999999;
        data.quota.AIEngineBill.premiumExpired = 9999999999999;
      }
      if (data.quota.AITokens) {
        data.quota.AITokens.used = 0;
        data.quota.AITokens.limit = 999999;
      }
      if (data.quota.whisperx) {
        data.quota.whisperx.used = 0;
        data.quota.whisperx.limit = 999999;
      }
      if (data.quota.pdf) {
        data.quota.pdf.used = 0;
        data.quota.pdf.limit = 999999;
      }
    }
    
    body.message = "ok";
    $done({ body: JSON.stringify(body) });
    return;
  }
  
  // ======= service.trancy.org/1/user/profile 响应 =======
  if (/service\.trancy\.org\/1\/user\/profile/.test(url) && body.data) {
    console.log('[Trancy] Modifying service.trancy.org/1/user/profile');
    const data = body.data;
    
    // VIP 核心字段
    data.premium = true;
    data.stripePremiumActive = true;
    data.stripeAIEngineActive = true;
    data.subscription = "premium";
    data.AIEngineActive = true;
    data.plan = "premium";
    data.tier = "premium";
    data.isPro = true;
    data.isPremium = true;
    data.pro = true;
    
    // 额度
    if (data.quota) {
      if (data.quota.AIEngineBill) {
        data.quota.AIEngineBill.balance = 999999;
        data.quota.AIEngineBill.cost = 0;
        data.quota.AIEngineBill.amount = 999999;
        data.quota.AIEngineBill.OpenAI = 999999;
        data.quota.AIEngineBill.Anthropic = 999999;
        data.quota.AIEngineBill.DeepL = 999999;
        data.quota.AIEngineBill.Google = 999999;
        data.quota.AIEngineBill.DeepSeek = 999999;
        data.quota.AIEngineBill.Meta = 999999;
        data.quota.AIEngineBill.GLM = 999999;
        data.quota.AIEngineBill.tokens = 999999;
        data.quota.AIEngineBill.AIEngineExpired = 9999999999999;
        data.quota.AIEngineBill.premiumExpired = 9999999999999;
      }
      if (data.quota.AITokens) {
        data.quota.AITokens.used = 0;
        data.quota.AITokens.limit = 999999;
      }
      if (data.quota.whisperx) {
        data.quota.whisperx.used = 0;
        data.quota.whisperx.limit = 999999;
      }
      if (data.quota.pdf) {
        data.quota.pdf.used = 0;
        data.quota.pdf.limit = 999999;
      }
    }
    
    body.message = "ok";
    $done({ body: JSON.stringify(body) });
    return;
  }
  
  // ======= RevenueCat 响应（offerings/subscribers） =======
  if (/api\.revenuecat\.com|api\.rc-backup\.com|api-paywalls\.revenuecat\.com/.test(url)) {
    console.log('[Trancy] Modifying RevenueCat response');
    
    if (body.subscriber) {
      const sub = body.subscriber;
      
      // 确保 entitlements 存在
      if (!sub.entitlements) sub.entitlements = {};
      
      // 创建完整 entitlement
      for (const entId of ["pro", "premium", "plus", "all_access"]) {
        if (!sub.entitlements[entId]) sub.entitlements[entId] = {};
        sub.entitlements[entId] = {
          ...sub.entitlements[entId],
          expires_date: "2099-12-31T23:59:59Z",
          purchase_date: "2024-06-10T00:00:00Z",
          latest_purchase_date: "2024-06-10T00:00:00Z",
          product_identifier: sub.entitlements[entId]?.product_identifier || "com.trancy.app_yearly",
          is_active: true,
          will_renew: true,
          is_sandbox: false,
          ownership_type: "PURCHASED",
          store: "app_store",
          period_type: "active",
          original_purchase_date: "2024-01-01T00:00:00Z",
          unsubscribe_detected_at: null,
          billing_issues_detected_at: null,
          grace_period_expires_date: null,
          refund_reason: null
        };
      }
      
      // 订阅
      if (!sub.subscriptions) sub.subscriptions = {};
      for (const pid of ["com.trancy.app_monthly", "com.trancy.app_yearly", "com.trancy.app_ai_monthly", "com.trancy.app_ai_yearly"]) {
        if (!sub.subscriptions[pid]) sub.subscriptions[pid] = {};
        sub.subscriptions[pid] = {
          ...sub.subscriptions[pid],
          expires_date: "2099-12-31T23:59:59Z",
          purchase_date: sub.subscriptions[pid]?.purchase_date || "2024-06-10T00:00:00Z",
          original_purchase_date: sub.subscriptions[pid]?.original_purchase_date || "2024-01-01T00:00:00Z",
          is_active: true,
          will_renew: true,
          is_sandbox: false,
          period_type: "active",
          store: "app_store",
          ownership_type: "PURCHASED",
          unsubscribe_detected_at: null,
          billing_issues_detected_at: null
        };
      }
      
      // 顶层字段
      sub.first_seen = sub.first_seen || "2024-01-01T00:00:00Z";
      sub.original_application_version = "1.0";
      sub.original_purchase_date = "2024-01-01T00:00:00Z";
      sub.management_url = "https://apps.apple.com/account/subscriptions";
      
      body.request_date = "2099-12-31T23:59:59Z";
      body.request_date_ms = "4092599349000";
    }
    
    $done({ body: JSON.stringify(body) });
    return;
  }
  
  // ======= 通用递归修改（兜底） =======
  console.log('[Trancy] Applying generic modify for: ' + pathAndQuery);
  
  function deepModify(obj, depth) {
    if (depth > 15 || !obj || typeof obj !== 'object') return;
    
    if (!Array.isArray(obj)) {
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        const lk = key.toLowerCase();
        
        // 布尔字段
        if (typeof val === 'boolean') {
          if (/^(is)?(pro|premium|vip|member|subscribed|paid|active|entitled|enabled|unlocked|svip|plus|gold|promember)/.test(lk)) {
            obj[key] = true;
          }
          if (/^(is)?(trial|canceled|expired|limited|blocked|sandbox)/.test(lk)) {
            obj[key] = false;
          }
        }
        
        // 数字字段
        if (typeof val === 'number') {
          if (/(balance|credit|quota|limit|token|point|coin)/i.test(lk)) {
            if (val === 0 || lk.includes('balance') || lk.includes('limit')) {
              obj[key] = 999999;
            }
          }
          if (/(expire|end|expir)/i.test(lk) && val === 0) {
            obj[key] = 9999999999999;
          }
          if (/(status|tier|level)/i.test(lk) && (val === 0 || val === 1 || val === 2)) {
            obj[key] = 999;
          }
        }
        
        // 字符串字段
        if (typeof val === 'string') {
          if (/(status|plan|tier|type|role|entitlement)/i.test(lk)) {
            const vl = val.toLowerCase();
            if (/^(free|basic|trial|expired|inactive|none|standard|limited)$/.test(vl)) {
              obj[key] = 'premium';
            }
          }
        }
        
        if (obj[key] && typeof obj[key] === 'object') deepModify(obj[key], depth + 1);
      }
    } else {
      for (const item of obj) {
        if (item && typeof item === 'object') deepModify(item, depth + 1);
      }
    }
  }
  
  deepModify(body, 0);
  $done({ body: JSON.stringify(body) });
}

main();
