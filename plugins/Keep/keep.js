/*
 * Keep Premium Unlock v1.2
 * 功能：解锁Keep会员付费课程、跟练、训练计划、直播课
 * App版本：9.0.20
 *
 * 核心原则：只拦截真正影响会员状态的接口
 * - kprime/* — 会员身份、鉴权、页面（核心）
 * - guide-webapp/* — 弹窗、激励页面
 * - nuocha/* — 训练设置
 * - 不拦截 athena/...（AES加密不能改）和 pencil/...（运动功能，无关会员）
 *
 * [rewrite_local]
 * # Keep Premium Unlock
 * ^https?:\/\/api\.gotokeep\.com\/(kprime|nuocha|guide-webapp) url script-response-body https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/main/plugins/Keep/keep.js
 *
 * [mitm]
 * hostname = api.gotokeep.com
 */

// ================== 完全伪造的响应 ==================
// 对核心会员接口，返回完整的伪造JSON
const fakeResponses = {

  // 1. 会员信息核心 - 所有会员状态聚合
  "/kprime/v2/infoForClient": {
    ok: true, errorCode: 0, text: null, moreInfo: null,
    data: {
      memberDTOList: [{
        memberType: "YEAR_CARD", membershipType: "YEAR_CARD",
        autoRenew: true, status: 1, statusTrack: "in_effect",
        paidStatus: 1, paidStatusTrack: "paid",
        gmtCurrentTypeExpire: 4102444799000, gmtExpire: 4102444799000,
        totalEffectiveDays: 9999, stockFlag: false
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

  // 3. 会员页面 (旧路径)
  "/kprime/v2/home/complete/tab": {
    ok: true, errorCode: 0, text: null, moreInfo: null,
    data: {
      tab: "normal",
      memberInfo: { status: 1, gmtExpire: 4102444799000, autoRenew: true },
      headCopy: "尊贵的会员，欢迎回来",
      checkTheAgreement: true, moduleItems: []
    }
  },

  // 4. 会员页面tab实验 (先返回好数据，后续页面还会调它)
  "/kprime/v2/home/complete/tab/exp": {
    ok: true, errorCode: 0, text: null, moreInfo: null,
    data: {
      tabSales: true, showOtherTabExp: true,
      memberInfo: { status: 1, gmtExpire: 4102444799000, autoRenew: true }
    }
  },

  // 5. 训练设置 - 改为付费用户
  "/nuocha/training/settings/summary": {
    ok: true, errorCode: 0, text: "",
    data: { settingsSummaryViewList: [], hasPaid: true }
  },

  // 6. 课程开始权限验证 - ⭐ 关键！返回status:true才能开练
  "/nuocha/plans/": {
    ok: true, errorCode: 0, text: "",
    data: { status: true, text: "", schema: "" }
  },

  // 6. 弹窗 - 空数据（去购买弹窗）
  "/guide-webapp/v1/popup/getPopUp": {
    errorCode: 0, text: "", data: null
  },

  // 7. 激励页面
  "/guide-webapp/v3/motivate/page": {
    ok: true, errorCode: 0, text: "", data: null
  },

  // 8. combo/goal
  "/guide-webapp/v1/combogoal/info": {
    errorCode: 0, text: "", data: null
  }
};

// ================== 精确正则替换 ==================
// 对其他kprime/guide/nuocha接口进行精确的关键字替换
const regexRules = [

  // 会员身份：NORMAL/TRIAL/FREE → YEAR_CARD
  { pattern: /"memberType":"(\w)*"/g, replacement: '"memberType":"YEAR_CARD"' },

  // 会员状态：3(expired)/2 → 1(active)
  { pattern: /"status":3/g, replacement: '"status":1' },

  // 会员状态文本
  { pattern: /"statusTrack":"expired"/g, replacement: '"statusTrack":"in_effect"' },
  { pattern: /"primeStatus":"expired"/g, replacement: '"primeStatus":"in_effect"' },

  // 自动续费
  { pattern: /"autoRenew":false/g, replacement: '"autoRenew":true' },
  { pattern: /"autoRenew":null/g, replacement: '"autoRenew":true' },

  // 付费标记
  { pattern: /"hasPaid":false/g, replacement: '"hasPaid":true' },
  { pattern: /"free":false/g, replacement: '"free":true' },
  { pattern: /"limitFree":false/g, replacement: '"limitFree":true' },
  { pattern: /"isVip":false/g, replacement: '"isVip":true' },
  { pattern: /"member":false/g, replacement: '"member":true' },

  // 直播课权限
  { pattern: /"userLiveMemberStatus":false/g, replacement: '"userLiveMemberStatus":true' },
  { pattern: /"canWatchLive":false/g, replacement: '"canWatchLive":true' },

  // 限制归零
  { pattern: /"limitCount":\d{1,3}/g, replacement: '"limitCount":0' },
  { pattern: /"videoTime":\d{2,}/g, replacement: '"videoTime":0' },

  // 功能解锁
  { pattern: /"downLoadAll":false/g, replacement: '"downLoadAll":true' },
  { pattern: /"preview":true/g, replacement: '"preview":false' },
  { pattern: /"startEnable":false/g, replacement: '"startEnable":true' },
  { pattern: /"restrictedNow":true/g, replacement: '"restrictedNow":false' },
  { pattern: /"membershipOnly":true/g, replacement: '"membershipOnly":false' },

  // 到期时间null → 2099年
  { pattern: /"gmtExpire":null/g, replacement: '"gmtExpire":4102444799000' },
  
  // headCopy替换
  { pattern: /"headCopy":"[^"]*"/g, replacement: '"headCopy":"尊贵的会员，欢迎回来"' },

  // 购买按钮文案置空
  { pattern: /"buttonText":"[^"]*"/g, replacement: '"buttonText":""' },

  // 错误码归零
  { pattern: /"errorCode":[1-9]\d*/g, replacement: '"errorCode":0' },

  // 课程开始权限
  { pattern: /"data":false/g, replacement: '"data":true' },

  // 会员权益验证 status:false → true
  { pattern: /"status":false/g, replacement: '"status":true' },
];

// ================== 主逻辑 ==================
let url = $request.url;
let body = $response.body;

// 1. 先检查是否匹配到完全伪造的接口
for (let key in fakeResponses) {
  if (url.indexOf(key) !== -1) {
    $done({ body: JSON.stringify(fakeResponses[key]) });
    return;
  }
}

// 2. 正则替换（仅对kprime/nuocha/guide接口）
if (/api\.gotokeep\.com\/(kprime|nuocha|guide)/.test(url)) {
  try {
    for (let rule of regexRules) {
      body = body.replace(rule.pattern, rule.replacement);
    }
  } catch (e) {
    console.log("Keep unlock regex error: " + e);
  }
}

$done({ body });
