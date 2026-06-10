// ==ClawHub/YouMind Pro Unlock v2.1==
// @version 2.1
// @description 基于抓包数据：修改 getCurrentUser/findSubscription/credit 的 VIP 状态
// @mitm hello-lucy.com
// ==/ClawHub/YouMind Pro Unlock v2.1==

const url = $request.url;
const method = $request.method;

// 只拦截 hello-lucy.com 的关键 API
const targetPaths = [
  "getCurrentUser",
  "findSubscription",
  "getCreditAccount",
  "getTotalBonusRedeem",
  "listCreditsConsumeTransactionsInCurrentPeriod",
  "listPermanentCreditGrants",
  "listSkillEarnings"
];

const shouldIntercept = targetPaths.some(path => url.includes(path));

if (!shouldIntercept) {
  $done({});
  return;
}

if (method === "GET" || method === "POST") {
  let body = $response.body;
  
  try {
    let obj = JSON.parse(body);
    
    function modifyVIP(obj) {
      if (!obj || typeof obj !== 'object') return;
      
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        
        // ===== snake_case versions =====
        // space.status: "trialing" -> "active"
        if (key === "status" && typeof val === "string" && 
            ["trialing", "trial", "expired", "none", "inactive", "canceled", "cancelled", "free"].includes(val.toLowerCase())) {
          obj[key] = "active";
        }
        
        // product_tier / productTier: "free" -> "pro"
        if ((key === "product_tier" || key === "productTier") && typeof val === "string") {
          if (["free", "trial", "none"].includes(val.toLowerCase())) {
            obj[key] = "pro";
          }
        }
        
        // sub_tier / subTier
        if ((key === "sub_tier" || key === "subTier") && typeof val === "number" && val < 10) {
          obj[key] = 999;
        }
        
        // has_ever_had_subscription, hasEverHadSubscription
        if ((key === "has_ever_had_subscription" || key === "hasEverHadSubscription") && val === false) {
          obj[key] = true;
        }
        
        // 余额字段 (both snake and camel)
        if (["monthly_balance", "monthlyBalance", "permanent_balance", "permanentBalance", 
             "bonus_balance", "bonusBalance", "spendable_balance", "spendableBalance",
             "daily_balance", "dailyBalance", "monthly_quota", "monthlyQuota"].includes(key)) {
          if (typeof val === "number" && val < 999999) {
            obj[key] = 999999;
          }
        }
        
        // trialExpiresAt / trial_expires_at -> 改到 2099
        if ((key === "trialExpiresAt" || key === "trial_expires_at" || 
             key === "expiresAt" || key === "expires_at" ||
             key === "expirationDate" || key === "expiration_date" ||
             key === "current_period_end" || key === "currentPeriodEnd") && typeof val === "string") {
          if (val.includes("2026") || val.includes("2025") || val.includes("2024")) {
            obj[key] = val.replace("2026", "2099").replace("2025", "2099").replace("2024", "2099");
          }
        }
        
        // credit / balance 通用字段
        if ((key === "credit" || key === "credits" || key === "balance") && typeof val === "number") {
          obj[key] = 999999;
        }
        
        // Recursion
        if (typeof val === 'object') {
          modifyVIP(val);
        }
      }
    }
    
    modifyVIP(obj);
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
} else {
  $done({});
}
