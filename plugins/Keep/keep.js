/*
 * Keep Premium Unlock v1.1
 * 功能：解锁Keep会员付费课程、跟练、训练计划、直播课
 * App版本：9.0.20
 * 
 * 覆盖的核心接口（基于实际抓包）：
 * 1. /kprime/v2/infoForClient — 会员身份核心（完整伪造）
 * 2. /kprime/v1/auth — 会员鉴权（完整伪造）
 * 3. /kprime/v2/home/complete/tab — 会员页面（完整伪造）
 * 4. /kprime/v2/home/complete/native — 新版会员页面（完整伪造！关键新增）
 * 5. /kprime/v2/home/complete/tab/exp — 会员tab实验（完整伪造）
 * 6. /nuocha/training/settings/summary — 训练设置（完整伪造）
 * 7. /guide-webapp/v1/popup/getPopUp — 弹窗控制（完整伪造）
 * 8. /guide-webapp/v3/motivate/page — 新版激励页面（完整伪造）
 * 
 * 已知限制：
 * - athena/... 接口返回AES加密的enkzip数据，无法直接修改
 * 
 * [rewrite_local]
 * # Keep Premium Unlock
 * ^https?:\/\/api\.gotokeep\.com\/(kprime|athena|nuocha|guide-webapp|pencil-webapp) url script-response-body https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/main/plugins/Keep/keep.js
 * 
 * [mitm]
 * hostname = api.gotokeep.com
 */

// ================== 完全伪造的响应 ==================
const fakeResponses = {

  // 1. 会员信息核心 - 所有会员状态聚合
  "/kprime/v2/infoForClient": {
    ok: true,
    errorCode: 0,
    text: null,
    moreInfo: null,
    data: {
      memberDTOList: [{
        memberType: "YEAR_CARD",
        membershipType: "YEAR_CARD",
        autoRenew: true,
        status: 1,
        statusTrack: "in_effect",
        paidStatus: 1,
        paidStatusTrack: "paid",
        gmtCurrentTypeExpire: 4102444799000,
        gmtExpire: 4102444799000,
        totalEffectiveDays: 9999,
        stockFlag: false
      }],
      status: JSON.stringify({
        WEIGHT_LOSS_COACH: "none", POSTURE_TIMES: "none",
        PHYSICAL_TEST_LOW_PRICE_COURSE: "none", PHYSICAL_TEST: "non_pt_other",
        LIVE: "none", LANSEXIONGDI_PARTNER: "none", E_PAI_PARTNER: "none",
        POSTURE: "none", SHUYOU_PARTNER: "none", LIVE_FAMILY: "none",
        NORMAL_FAMILY: "none", ZHONG_HE_PARTNER: "none",
        NORMAL: "in_effect", KEEPLAND: "none"
      }),
      paidStatus: JSON.stringify({
        WEIGHT_LOSS_COACH: "none", POSTURE_TIMES: "none",
        PHYSICAL_TEST_LOW_PRICE_COURSE: "none", PHYSICAL_TEST: "none",
        LIVE: "none", LANSEXIONGDI_PARTNER: "none", E_PAI_PARTNER: "none",
        POSTURE: "none", SHUYOU_PARTNER: "none", LIVE_FAMILY: "none",
        NORMAL_FAMILY: "none", ZHONG_HE_PARTNER: "none",
        NORMAL: "paid", KEEPLAND: "none"
      }),
      primeStatus: "in_effect",
      memberInfo: { status: 1, gmtExpire: 4102444799000, autoRenew: true }
    }
  },

  // 2. 会员鉴权
  "/kprime/v1/auth": {
    ok: true, errorCode: 0, text: null, moreInfo: null,
    data: {
      memberType: "YEAR_CARD", membershipType: "YEAR_CARD",
      autoRenew: true, status: 1, statusTrack: "in_effect",
      paidStatus: 1, paidStatusTrack: "paid",
      gmtCurrentTypeExpire: 4102444799000, gmtExpire: 4102444799000,
      totalEffectiveDays: 9999, stockFlag: false
    }
  },

  // 3. 会员页面 (旧路径 /tab)
  "/kprime/v2/home/complete/tab": {
    ok: true, errorCode: 0, text: null, moreInfo: null,
    data: {
      tab: "normal",
      memberInfo: { status: 1, gmtExpire: 4102444799000, autoRenew: true },
      headCopy: "尊贵的会员，欢迎回来",
      checkTheAgreement: true, moduleItems: []
    }
  },

  // 4. 会员页面 (新路径 /native) - 不做完整替换，用正则改字段
  //    原始响应的moduleItems包含大量UI数据，清空会导致页面空白
  //    正则替换处理：status, headCopy, gmtExpire 等

  // 5. 会员tab实验
  "/kprime/v2/home/complete/tab/exp": {
    ok: true, errorCode: 0, text: null, moreInfo: null,
    data: {
      tabSales: true,
      showOtherTabExp: true,
      memberInfo: { status: 1, gmtExpire: 4102444799000, autoRenew: true }
    }
  },

  // 6. 训练设置 - 改为付费用户
  "/nuocha/training/settings/summary": {
    ok: true, errorCode: 0, text: "",
    data: { settingsSummaryViewList: [], hasPaid: true }
  },

  // 7. 弹窗 - 空数据（去购买弹窗）
  "/guide-webapp/v1/popup/getPopUp": {
    errorCode: 0, text: "", data: null
  },

  // 8. 激励页面 - V1.1新增（新版Keep的额外接口）
  "/guide-webapp/v3/motivate/page": {
    ok: true, errorCode: 0, text: "", data: null
  },

  // 9. combo/goal
  "/guide-webapp/v1/combogoal/info": {
    errorCode: 0, text: "", data: null
  }
};

// ================== 精确正则替换 ==================
const regexRules = [
  // -- 会员身份 --
  { pattern: /"memberType":"(NORMAL|TRIAL|FREE|NOBUY)"/g, replacement: '"memberType":"YEAR_CARD"' },

  // -- 会员状态：3=expired, 2=about_to_expire →
  { pattern: /"status":3/g, replacement: '"status":1' },
  { pattern: /"status":2[,\s}]/g, replacement: '"status":1,' },

  // -- 状态文本 --
  { pattern: /"statusTrack":"expired"/g, replacement: '"statusTrack":"in_effect"' },
  { pattern: /"statusTrack":"trial"/g, replacement: '"statusTrack":"in_effect"' },
  { pattern: /"primeStatus":"expired"/g, replacement: '"primeStatus":"in_effect"' },
  { pattern: /"primeStatus":"trial"/g, replacement: '"primeStatus":"in_effect"' },
  { pattern: /"primeStatus":"none"/g, replacement: '"primeStatus":"in_effect"' },
  { pattern: /"membership_status":"expired"/g, replacement: '"membership_status":"active"' },

  // -- 直播课 --
  { pattern: /"userLiveMemberStatus":false/g, replacement: '"userLiveMemberStatus":true' },
  { pattern: /"canWatchLive":false/g, replacement: '"canWatchLive":true' },
  { pattern: /"userMemberAutoRenew":false/g, replacement: '"userMemberAutoRenew":true' },
  { pattern: /"userUseLiveMemberRights":false/g, replacement: '"userUseLiveMemberRights":true' },

  // -- 自动续费 --
  { pattern: /"autoRenew":false/g, replacement: '"autoRenew":true' },

  // -- 付费标记 --
  { pattern: /"hasPaid":false/g, replacement: '"hasPaid":true' },
  { pattern: /"free":false/g, replacement: '"free":true' },
  { pattern: /"limitFree":false/g, replacement: '"limitFree":true' },
  { pattern: /"isVip":false/g, replacement: '"isVip":true' },
  { pattern: /"member":false/g, replacement: '"member":true' },

  // -- 限制归零 --
  { pattern: /"limitCount":[1-9]\d*/g, replacement: '"limitCount":0' },
  { pattern: /"videoTime":[1-9]\d*/g, replacement: '"videoTime":0' },

  // -- 功能解锁 --
  { pattern: /"downLoadAll":false/g, replacement: '"downLoadAll":true' },
  { pattern: /"preview":true/g, replacement: '"preview":false' },
  { pattern: /"startEnable":false/g, replacement: '"startEnable":true' },
  { pattern: /"restrictedNow":true/g, replacement: '"restrictedNow":false' },
  { pattern: /"membershipOnly":true/g, replacement: '"membershipOnly":false' },

  // -- 修复null的autoRenew和gmtExpire --
  { pattern: /"gmtExpire":null/g, replacement: '"gmtExpire":4102444799000' },
  { pattern: /"autoRenew":null/g, replacement: '"autoRenew":true' },

  // -- 到期时间→2099年 --
  { pattern: /"gmtExpire":1[0-9]{12}/g, replacement: '"gmtExpire":4102444799000' },
  { pattern: /"gmtCurrentTypeExpire":1[0-9]{12}/g, replacement: '"gmtCurrentTypeExpire":4102444799000' },
  { pattern: /"gmtPaidTypeExpire":1[0-9]{12}/g, replacement: '"gmtPaidTypeExpire":4102444799000' },
  { pattern: /"gmtEffective":1[0-9]{12}/g, replacement: '"gmtEffective":1706623416000' },

  // -- 错误码归零 --
  { pattern: /"errorCode":[1-9]\d*/g, replacement: '"errorCode":0' },
  { pattern: /"errCode":[1-9]\d*/g, replacement: '"errCode":0' },

  // -- 购买按钮文案置空 --
  { pattern: /"buttonText":"[^"]*"/g, replacement: '"buttonText":""' },

  // -- headCopy 替换（"会员已过期"改为"欢迎回来"）--
  { pattern: /"headCopy":"[^"]*"/g, replacement: '"headCopy":"尊贵的会员，欢迎回来"' },

  // -- limitFreeType 置空 --
  { pattern: /"limitFreeType":"[^"]*"/g, replacement: '"limitFreeType":""' },
];

// ================== 主逻辑 ==================
let url = $request.url;
let body = $response.body;

// 1. 检查完全伪造
for (let key in fakeResponses) {
  if (url.indexOf(key) !== -1) {
    $done({ body: JSON.stringify(fakeResponses[key]) });
    return;
  }
}

// 2. 正则替换（仅对kprime/nuocha/athena/guide/pencil）
if (/api\.gotokeep\.com\/(kprime|athena|nuocha|guide|pencil)/.test(url)) {
  try {
    for (let rule of regexRules) {
      body = body.replace(rule.pattern, rule.replacement);
    }
  } catch (e) {
    console.log("Keep unlock regex error: " + e);
  }
}

$done({ body });
