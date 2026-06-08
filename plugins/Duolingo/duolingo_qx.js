// ==Quantumult X==
// @name         多邻国 Duolingo 完整解锁 v10
// @description  解锁 Super 会员 + 钻石 999999 + 时间宝/连胜激冻无限 + 连胜1000天🔥 + 安全盾2099 + 成就全满 + 日历打卡 + 紫水晶挑战改满 + 全功能标识
// @version      10.0
// @author       Minis
// @icon         https://simg-ssl.duolingo.com/ssr-logos/duolingo_logo.svg
// ==/Quantumult X==

const G = 999999, TB = 999, FZ = 999, XPC = 99;

// ====== 请求拦截 ======
function modReq(b) {
  try {
    let o = JSON.parse(b);
    if (!o.requests) return b;
    o.requests.forEach(r => {
      if (r.method === 'POST' && r.url && r.url.includes('shop-items')) {
        let b2 = JSON.parse(r.body);
        b2.isFree = true; b2.gems = 0;
        r.body = JSON.stringify(b2);
      }
    });
    return JSON.stringify(o);
  } catch(e) { return b; }
}

// ====== 用户数据修改 ======
function modUser(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return false;
  let m = false;

  if (typeof d.gems === 'number') { d.gems = G; m = true; }
  if (typeof d.lingots === 'number') { d.lingots = 999; m = true; }
  if (d.gemsConfig && typeof d.gemsConfig.gems === 'number') { d.gemsConfig.gems = G; m = true; }
  if (d.trackingProperties && typeof d.trackingProperties.gems === 'number') { d.trackingProperties.gems = G; m = true; }

  if (d.subscriberLevel && d.subscriberLevel !== 'PREMIUM') { d.subscriberLevel = 'PREMIUM'; m = true; }

  if (!d.subscriptionFeatures || !Array.isArray(d.subscriptionFeatures)) { d.subscriptionFeatures = []; m = true; }
  ['NO_NETWORK_ADS','UNLIMITED_HEARTS','LEGENDARY_LEVEL','MISTAKES_INBOX','MASTERY_QUIZ','EXPLAIN_MY_ANSWER','LICENSED_SONGS','CAN_ADD_SECONDARY_MEMBERS','DUOLINGO_MAX','ROLE_PLAY','VIDEO_CALL','ADVANCED_MATH'].forEach(f => {
    if (!d.subscriptionFeatures.includes(f)) d.subscriptionFeatures.push(f);
  }); m = true;

  if (d.purchasableFeatures && Array.isArray(d.purchasableFeatures)) {
    ['CAN_PURCHASE_IAP','CAN_PURCHASE_SUBSCRIPTION','CAN_PURCHASE_MAX','CAN_PURCHASE_APPLE_GIFT_SUBSCRIPTION'].forEach(f => {
      if (!d.purchasableFeatures.includes(f)) d.purchasableFeatures.push(f);
    }); m = true;
  }

  if (d.subscriptionConfigs && Array.isArray(d.subscriptionConfigs)) {
    if (!d.subscriptionConfigs.some(s => String(s.productId||'').includes('Max'))) {
      d.subscriptionConfigs.push({
        productId: 'com.duolingo.DuolingoMobile.subscription.Max.Monthly.v2',
        itemType: 'max_subscription', isInBillingRetryPeriod: false,
        isInGracePeriod: false, isFreeTrialPeriod: false,
        expirationTimestamp: 4102415999000, receiptSource: 10
      }); m = true;
    }
  }

  if (d.health) { d.health.unlimitedHeartsAvailable = true; m = true; }
  if (d.energyConfig) { d.energyConfig.maxEnergy = 9999; d.energyConfig.energy = 9999; m = true; }

  if (d.timerBoostConfig) {
    d.timerBoostConfig.timerBoosts = TB;
    d.timerBoostConfig.hasFreeTimerBoost = true;
    d.timerBoostConfig.hasPurchasedTimerBoost = true;
    d.timerBoostConfig.timePerBoost = 7200; m = true;
  }

  if (d.trackingProperties) {
    d.trackingProperties.num_item_streak_freeze = FZ;
    d.trackingProperties.has_item_streak_freeze = true;
    d.trackingProperties.streak = 1000;
    d.trackingProperties.has_item_weekend_amulet = true;
    d.trackingProperties.has_item_streak_wager = true; m = true;
  }

  if (d.streakData) {
    d.streakData.length = 1000;
    d.streakData.currentStreak = 1000;
    d.streakData.updatedTimestamp = Math.floor(Date.now() / 1000); m = true;
  }

  if (d.rewardCardsInventory) {
    Object.keys(d.rewardCardsInventory).forEach(k => { d.rewardCardsInventory[k] = XPC; }); m = true;
  }

  d.xpBoostMultiplier = 5.0; m = true;
  if (typeof d.totalXp === 'number' && d.totalXp < 999999) { d.totalXp = 999999; m = true; }

  if (d.shopItems && Array.isArray(d.shopItems)) {
    d.shopItems.forEach(item => {
      if (item.price && item.currencyType === 'XGM') item.price = 0;
      if (item.id === 'xp_boost_stackable') { item.remainingEffectDurationInSeconds = 999999; item.quantity = 999; }
    });
    if (!d.shopItems.some(s => s.id === 'xp_boost_stackable')) {
      d.shopItems.push({id:'xp_boost_stackable', purchaseDate:Math.floor(Date.now()/1000), purchasePrice:0, remainingEffectDurationInSeconds:999999, quantity:999});
    }
    m = true;
  }

  if (d.advertisableFeatures && Array.isArray(d.advertisableFeatures)) {
    ['NO_NETWORK_ADS','UNLIMITED_HEARTS','LEGENDARY_LEVEL','MISTAKES_INBOX','MASTERY_QUIZ','EXPLAIN_MY_ANSWER','LICENSED_SONGS','CAN_ADD_SECONDARY_MEMBERS','DUOLINGO_MAX','VIDEO_CALL','ROLE_PLAY','ADVANCED_MATH'].forEach(f => {
      if (!d.advertisableFeatures.includes(f)) d.advertisableFeatures.push(f);
    }); m = true;
  }

  return m;
}

// ====== 响应入口（Quantumult X 调用）======

// 获取当前请求信息
const url = typeof $request !== 'undefined' ? $request.url : '';
const method = typeof $request !== 'undefined' ? $request.method : '';
const body = typeof $response !== 'undefined' ? $response.body : '';

if (typeof $response === 'undefined') {
  // http-request
  if (body && url.includes('/batch')) {
    let mb = modReq(body);
    if (mb !== body) {
      $done({ body: mb });
    } else {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

if (!body) { $done({}); return; }

// ====== 响应处理 ======
function handleResponse() {
  try {
    // Batch 响应
    if (url.includes('/batch') && method === 'POST') {
      let obj = JSON.parse(body);
      if (!obj.responses) { $done({}); return; }
      let modified = false;
      for (let i = 0; i < obj.responses.length; i++) {
        let r = obj.responses[i];
        if (r.status === 400 && r.body === '') {
          r.status = 200; r.body = '{}'; modified = true; continue;
        }
        if (r.status !== 200 || typeof r.body !== 'string') continue;
        try {
          let d = JSON.parse(r.body);
          if (modUser(d)) { r.body = JSON.stringify(d); modified = true; }
        } catch(e) {}
      }
      if (modified) { $done({ body: JSON.stringify(obj) }); return; }
    }

    // 以下是独立端点
    let d = JSON.parse(body);
    if (typeof d !== 'object' || d === null) { $done({}); return; }

    // streakData 独立
    if (d.streakData && !url.includes('/batch')) {
      d.streakData.currentStreak = {length:1000, lastExtendedDate:'2099-12-31', endDate:'2099-12-31', startDate:'2026-01-01'};
      d.streakData.previousStreak = {length:1000, lastExtendedDate:'2099-12-31', endDate:'2099-12-31', startDate:'2026-01-01'};
      d.streakData.longestStreak = {length:1000, endDate:'2099-12-31', achieveDate:'2099-01-01', startDate:'2026-01-01'};
      $done({ body: JSON.stringify(d) }); return;
    }

    // xp_summaries 日历
    if (d.summaries && Array.isArray(d.summaries)) {
      const summaries = [];
      const now = Math.floor(Date.now() / 1000);
      for (let day = 0; day < 1000; day++) {
        const dateStart = (now - day * 86400) - ((now - day * 86400) % 86400);
        summaries.push({
          gainedXp: 500 + Math.floor(Math.random() * 200),
          frozen: false, streakExtended: true, date: dateStart,
          userId: '716692732', repaired: true, dailyGoalXp: 10,
          numSessions: 5, totalSessionTime: 600, shielded: false
        });
      }
      d.summaries = summaries;
      modUser(d);
      $done({ body: JSON.stringify(d) }); return;
    }

    // streak-shields 安全盾
    if (d.streakShields || url.includes('streak-shield')) {
      d.streakShields = d.streakShields || [];
      if (d.streakShields.length === 0) {
        d.streakShields.push({userId: '716692732', startDate: {year:2026, month:1, day:1}, endDate: {year:2099, month:12, day:31}});
      } else {
        d.streakShields.forEach(s => { s.endDate = {year:2099, month:12, day:31}; s.startDate = {year:2026, month:1, day:1}; });
      }
      modUser(d);
      $done({ body: JSON.stringify(d) }); return;
    }

    // perfect-streak-week
    if (d.countTotalPerfectStreakWeeks !== undefined) {
      d.countTotalPerfectStreakWeeks = 999; d.countCurrentPerfectStreakWeeks = 999;
      d.perfectStreakDates = [{startDate:'2026-01-01', endDate:'2099-12-31'}];
      modUser(d);
      $done({ body: JSON.stringify(d) }); return;
    }

    // achievements
    if (d.achievements && Array.isArray(d.achievements)) {
      d.achievements.forEach(a => {
        a.tier = 9; a.count = 99999; a.shouldShowUnlock = false; a.noProgressBar = true;
        let ts = []; let now = Date.now();
        for (let t = 0; t < (a.tierCounts ? a.tierCounts.length : 10); t++) {
          ts.push(now - (10-t) * 86400000);
        }
        a.unlockTimestamps = ts;
      });
      $done({ body: JSON.stringify(d) }); return;
    }

    // live-ops-challenges
    if (d.liveOpsChallenges && Array.isArray(d.liveOpsChallenges)) {
      d.liveOpsChallenges.forEach(ch => {
        ch.xpSections = [999, 999, 999];
        ch.challengeSections = [1, 1, 1];
        ch.initialTime = 9999;
        if (ch.levelXpSections) ch.levelXpSections = ch.levelXpSections.map(l => [999, 999, 999]);
        if (ch.levelChallengeSections) ch.levelChallengeSections = ch.levelChallengeSections.map(l => [1, 1, 1]);
      });
      modUser(d);
      $done({ body: JSON.stringify(d) }); return;
    }

    // activity-center
    if (url.includes('activity-center')) {
      d.hasNewActivity = true; d.newActivityCounts = {heart: 99, comment: 99};
      modUser(d);
      $done({ body: JSON.stringify(d) }); return;
    }

    // show-advertisable
    if (url.includes('show-advertisable')) {
      d.advertisableFeatures = ['NO_NETWORK_ADS','UNLIMITED_HEARTS','LEGENDARY_LEVEL','MISTAKES_INBOX','MASTERY_QUIZ','EXPLAIN_MY_ANSWER','LICENSED_SONGS','CAN_ADD_SECONDARY_MEMBERS','DUOLINGO_MAX','VIDEO_CALL','ROLE_PLAY','ADVANCED_MATH'];
      $done({ body: JSON.stringify(d) }); return;
    }

    // available-features
    if (url.includes('available-features')) {
      d.subscriptionFeatures = ['NO_NETWORK_ADS','UNLIMITED_HEARTS','LEGENDARY_LEVEL','MISTAKES_INBOX','MASTERY_QUIZ','EXPLAIN_MY_ANSWER','LICENSED_SONGS','CAN_ADD_SECONDARY_MEMBERS','DUOLINGO_MAX','VIDEO_CALL','ROLE_PLAY'];
      $done({ body: JSON.stringify(d) }); return;
    }

    // subscription-catalog
    if (url.includes('subscription-catalog') && d.plusPackageViewModels) {
      if (!d.plusPackageViewModels.some(p => p.type === 'max')) {
        d.plusPackageViewModels.push({
          productId: 'com.duolingo.DuolingoMobile.subscription.Max.Monthly.v2',
          type: 'max', isFamilyPlan: false, isStudentPlan: false,
          trackingProperties: {subscription_tier:'max_monthly', subscription_item_type:'MAX_SUBSCRIPTION'},
          advertisableFeatures: ['NO_NETWORK_ADS','UNLIMITED_HEARTS','LEGENDARY_LEVEL','MISTAKES_INBOX','MASTERY_QUIZ','EXPLAIN_MY_ANSWER','ROLE_PLAY','VIDEO_CALL','DUOLINGO_MAX']
        });
      }
      $done({ body: JSON.stringify(d) }); return;
    }

    // lapsed-info
    if (url.includes('lapsed-info')) {
      d.canRevive = true; d.streakRevivalData = {canRevive: true, revivalCost: 0, canWatchAd: true};
      $done({ body: JSON.stringify(d) }); return;
    }

    // subscription-optional-feature
    if (url.includes('subscription-optional-feature') || url.includes('unlimited-hearts')) {
      $done({ body: 'true' }); return;
    }

    // spree 课程连续学习
    if (d.course_spree_optional_feature !== undefined) {
      d.current_spree_length = 1000; d.longest_spree_length = 1000;
      d.course_spree_optional_feature = 'on'; d.spree_unlock_status = 'unlocked';
      modUser(d);
      $done({ body: JSON.stringify(d) }); return;
    }

    // 通用用户 GET
    if (url.includes('/users/') && !url.includes('/batch')) {
      if (modUser(d)) { $done({ body: JSON.stringify(d) }); return; }
    }

    $done({});
  } catch(e) {
    $done({});
  }
}

handleResponse();
