// ==ClawHub/YouMind Max Unlock v3.4==
// @version 3.4
// @description installSkill -> 伪造成功 + 注入技能到 listInstalledSkills
// @mitm hello-lucy.com
// ==/ClawHub/YouMind Max Unlock v3.4==

const url = $request.url;
const method = $request.method;
const body = $response.body;

// 缓存已安装的技能 ID 和详情（由 installSkill 和 getSkill 填充）
if (typeof self.installedCache === 'undefined') {
  self.installedCache = {};
  self.skillDetails = {};
}

// ===== installSkill 直接返回成功 =====
if (url.includes("/api/v1/skill/installSkill/")) {
  const skillId = url.split("installSkill/")[1]?.split("?")[0];
  if (skillId) self.installedCache[skillId] = true;
  
  $done({
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "OK" })
  });
  return;
}

// ===== uninstallSkill 直接返回成功 =====
if (url.includes("/api/v1/skill/uninstallSkill/")) {
  $done({
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "OK" })
  });
  return;
}

if (!url.includes("hello-lucy.com") || (method !== "GET" && method !== "POST")) {
  $done({});
  return;
}

let responseBody = body;
if (!responseBody || responseBody.length < 10) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(responseBody);
  
  // ===== 缓存 getSkill 详情，用于注入 listInstalledSkills =====
  if (url.includes("/api/v1/skill/getSkill/")) {
    const skillId = url.split("getSkill/")[1]?.split("?")[0];
    if (skillId && typeof obj === 'object' && obj.id) {
      self.skillDetails[skillId] = JSON.parse(JSON.stringify(obj));
    }
  }
  
  function modifyVIP(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      
      // productTier: "free"/"pro" -> "max"
      if ((key === "product_tier" || key === "productTier") && typeof val === "string") {
        if (["free", "trial", "none", "pro"].includes(val.toLowerCase())) {
          obj[key] = "max";
        }
      }
      
      // subTier
      if ((key === "sub_tier" || key === "subTier") && typeof val === "number") {
        obj[key] = 9999;
      }
      
      // status: "trialing" -> "active"
      if (key === "status" && typeof val === "string" && 
          ["trialing", "trial", "expired", "none", "inactive", "canceled", "cancelled", "free"].includes(val.toLowerCase())) {
        obj[key] = "active";
      }
      
      // Subscription flags
      if (["has_ever_had_subscription", "hasEverHadSubscription", 
           "hasPurchased", "has_purchased", 
           "isInstalled", "is_installed"].includes(key) && val === false) {
        obj[key] = true;
      }
      
      // Skill purchase
      if (key === "canViewerPurchase") obj[key] = true;
      if (key === "viewerPurchaseBlockedReason" && typeof val === "string") {
        delete obj[key];
      }
      if (key === "price" && typeof val === "number" && val > 0) {
        obj[key] = 0;
      }
      
      // Balance
      if (["monthly_balance", "monthlyBalance", "permanent_balance", "permanentBalance", 
           "bonus_balance", "bonusBalance", "spendable_balance", "spendableBalance",
           "daily_balance", "dailyBalance", "monthly_quota", "monthlyQuota",
           "daily_limit", "dailyLimit", "credit", "credits", "balance"].includes(key)) {
        if (typeof val === "number") {
          obj[key] = 9999999;
        }
      }
      
      // Dates -> 2099
      if (["trialExpiresAt", "trial_expires_at", "expiresAt", "expires_at",
           "expirationDate", "expiration_date",
           "current_period_end", "currentPeriodEnd",
           "current_period_start", "currentPeriodStart"].includes(key) && typeof val === "string") {
        obj[key] = val.replace(/20[2-9][4-9]/g, "2099");
      }
      
      // Recursion
      if (typeof val === 'object') {
        modifyVIP(val);
      }
    }
  }
  
  // ===== 在 listInstalledSkills 中注入新安装的技能 =====
  if (url.includes("/api/v1/skill/listInstalledSkills") && typeof obj === 'object' && obj.all) {
    const cachedIds = Object.keys(self.installedCache);
    for (const skillId of cachedIds) {
      // 检查是否已存在
      const alreadyExists = obj.all.some(s => s.id === skillId);
      if (!alreadyExists && self.skillDetails[skillId]) {
        const detail = self.skillDetails[skillId];
        const now = new Date().toISOString();
        // 构造 listInstalledSkills 格式的技能条目
        const entry = {
          id: detail.id,
          createdAt: detail.createdAt,
          updatedAt: now,
          creatorId: detail.creatorId || "",
          name: detail.name,
          description: detail.description || "",
          type: detail.type || "prompt-executer",
          visibility: detail.visibility || "public",
          reviewStatus: detail.reviewStatus || "approved",
          showcase: detail.showcase || [],
          forkCount: detail.forkCount || 0,
          earnedCredits: detail.earnedCredits || 0,
          price: 0,
          contentVisibility: detail.contentVisibility || "public",
          origin: detail.origin || "custom",
          suggestedCategories: detail.suggestedCategories || [],
          featured: detail.featured || false,
          latestVersionId: detail.latestVersionId || "",
          installedAt: now,
          installedUpdatedAt: now,
          hasUpdate: false
        };
        obj.all.push(entry);
      }
    }
    // Also set isInstalled on the all items
    for (const skill of obj.all) {
      if (cachedIds.includes(skill.id)) {
        skill.isInstalled = true;
      }
    }
  }
  
  modifyVIP(obj);
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({});
}
