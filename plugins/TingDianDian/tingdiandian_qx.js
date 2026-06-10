// ==UserScript==
// @name         TingDianDian Pro Unlock
// @namespace    https://github.com/Leslie159357/Loon-Plugins
// @version      1.2.0
// @description  听点点 - 解锁所有Pro/Permanent会员功能（基于实际抓包修复）
// @author       Leslie159357
// @license      MIT
// ==/UserScript==

const url = $request.url;
const method = $request.method;

// 兼容 QX / Loon / Surge
const isQX = typeof $task !== 'undefined';
const isLoon = typeof $loon !== 'undefined';
const isSurge = typeof $httpClient !== 'undefined' && !isLoon;

function log(msg) {
  if (isQX || isLoon || isSurge) {
    console.log(msg);
  }
}

// 只处理 api.tingdiandian.com
if (url.indexOf('api.tingdiandian.com') === -1) {
  $done({});
}

// ===== 递归修改所有VIP/会员字段 =====
function unlockVIP(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = unlockVIP(obj[i]);
    }
    return obj;
  }
  
  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    
    const val = obj[key];
    
    // ===== 布尔会员字段 → true =====
    if (key === 'isPro' || key === 'isProPermanentMember' || 
        key === 'isBasicPermanentMember' || key === 'isOneMonthMember' || 
        key === 'isOneYearMember' || key === 'isBasicOneMonthMember' ||
        key === 'isGiveMemberDays') {
      obj[key] = true;
      continue;
    }
    
    // ===== 付费限制标记 → false =====
    if (key === 'showPermanentMember' || key === 'memberOnly' || 
        key === 'needSubscribe') {
      obj[key] = false;
      continue;
    }
    
    // ===== 积分相关 → 999999 =====
    if (key === 'permanentNumber' || key === 'pointsLimit' || 
        key === 'pointsMonthlyGrant' || key === 'pointsRolloverAvailable' ||
        key === 'pointsUsed' || key === 'pointsFrozen') {
      if (typeof val === 'number') {
        if (key === 'pointsUsed' || key === 'pointsFrozen') {
          obj[key] = 0;  // 已用归零
        } else if (key === 'pointsLimit') {
          obj[key] = 999999;  // 额度拉满
        } else {
          obj[key] = 999999;
        }
      }
      continue;
    }
    
    // ===== 时间额度 =====
    if (key === 'timeLimit' || key === 'timeUsed' || key === 'tokenLimit' || key === 'tokenUsed') {
      if (typeof val === 'number') {
        if (key === 'timeUsed' || key === 'tokenUsed') {
          obj[key] = 0;  // 已用归零
        } else {
          obj[key] = 999999;  // 额度拉满
        }
      }
      continue;
    }
    
    // ===== entitlements =====
    if (key === 'entitlement' && typeof val === 'string' && val === 'free') {
      obj[key] = 'pro';
      continue;
    }
    if (key === 'entitlements' && Array.isArray(val)) {
      // 清空 entitlements 数组（不限制）
      obj[key] = [];
      continue;
    }
    if (key === 'revenueCatUserId' && val === null) {
      obj[key] = 'rc_pro_member';
      continue;
    }
    
    // ===== 新用户offer → 不需要 =====
    if (key === 'hasUsedNewUserOffer' && typeof val === 'boolean') {
      obj[key] = true;
      continue;
    }
    
    // ===== 到期时间 =====
    if (key.indexOf('EndDate') !== -1 || key.indexOf('ExpiresAt') !== -1) {
      if (typeof val === 'string') {
        obj[key] = '2099-12-31T23:59:59.000Z';
      }
      continue;
    }
    
    // ===== purchase-catalog 商品 =====
    if (key === 'price' && typeof val === 'string') {
      obj[key] = '0';
      continue;
    }
    if (key === 'pointsAmount' && (typeof val === 'number' || typeof val === 'string')) {
      obj[key] = 999999;
      continue;
    }
    if (key === 'isActive' && typeof val === 'boolean' && val === false) {
      // 确保所有方案active
      obj[key] = true;
      continue;
    }
    if (key === 'memberOnly' && typeof val === 'boolean') {
      obj[key] = false;
      continue;
    }
    if (key === 'memberPlan' && typeof val === 'string') {
      obj[key] = 'pro';
      continue;
    }
    if (key === 'transcriptTimeLimit' && typeof val === 'number') {
      obj[key] = 999999;
      continue;
    }
    
    // 递归
    obj[key] = unlockVIP(val);
  }
  
  return obj;
}

// ===== 处理响应 =====
try {
  // 解析
  let body;
  if (typeof $response.body === 'string') {
    body = JSON.parse($response.body);
  } else {
    body = $response.body;
  }
  
  if (!body || typeof body !== 'object') {
    $done({});
  }
  
  const path = url.replace(/^https?:\/\/api\.tingdiandian\.com\//, '');
  log('🔄 ' + path);
  
  // 按路径特殊处理
  const isUser = path.startsWith('user/');
  const isConfig = path.startsWith('config/');
  
  // 通用解锁
  let modified = unlockVIP(body);
  
  // ===== user/d6z7qikngvt2mxas 特殊处理 =====
  if (isUser && path.indexOf('/user/') === 0) {
    if (modified.data) {
      modified.data.isPro = true;
      modified.data.isProPermanentMember = true;
      modified.data.isBasicPermanentMember = true;
      modified.data.isOneMonthMember = true;
      modified.data.isOneYearMember = true;
      modified.data.isBasicOneMonthMember = true;
      modified.data.isGiveMemberDays = true;
      modified.data.showPermanentMember = false;
      modified.data.needSubscribe = false;
      modified.data.entitlement = 'pro';
      modified.data.entitlements = [];
      modified.data.revenueCatUserId = 'rc_pro_member';
      modified.data.permanentNumber = 999999;
      modified.data.pointsLimit = 999999;
      modified.data.pointsMonthlyGrant = 999999;
      modified.data.pointsUsed = 0;
      modified.data.pointsFrozen = 0;
      modified.data.timeLimit = 999999;
      modified.data.timeUsed = 0;
      modified.data.tokenLimit = 999999;
      modified.data.tokenUsed = 0;
      modified.data.frozenQuota = 0;
      // 到期时间
      modified.data.oneMonthMemberEndDate = '2099-12-31T23:59:59.000Z';
      modified.data.oneYearMemberEndDate = '2099-12-31T23:59:59.000Z';
      modified.data.basicOneMonthMemberEndDate = '2099-12-31T23:59:59.000Z';
      modified.data.giveMemberDaysEndDate = '2099-12-31T23:59:59.000Z';
      modified.data.newUserOfferExpiresAt = '2099-12-31T23:59:59.000Z';
      modified.data.hasUsedNewUserOffer = true;
      
      log('✅ /user 修改完成');
    }
  }
  
  // ===== config/purchase-catalog =====
  if (path === 'config/purchase-catalog') {
    if (modified.data && modified.data.memberships) {
      for (let i = 0; i < modified.data.memberships.length; i++) {
        modified.data.memberships[i].price = '0';
        modified.data.memberships[i].pointsAmount = 999999;
        modified.data.memberships[i].memberOnly = false;
        modified.data.memberships[i].memberPlan = 'pro';
        modified.data.memberships[i].transcriptTimeLimit = 999999;
      }
      log('✅ purchase-catalog 价格全0');
    }
  }
  
  // ===== config/feature-comparison =====
  if (path === 'config/feature-comparison') {
    // 对比页数据 - 不需要改
    log('✅ feature-comparison 透传');
  }
  
  // ===== check-can-use-transcript =====
  if (path === 'user/check-can-use-transcript') {
    modified.data = true;
    log('✅ check-can-use-transcript → true');
  }
  
  // ===== check-points-limit-enough =====
  if (path.indexOf('check-points-limit-enough') !== -1) {
    modified.data = true;
    log('✅ check-points-limit-enough → true');
  }
  
  // ===== check-batch-transcript-member =====
  if (path.indexOf('check-batch-transcript-member') !== -1) {
    modified.data = true;
    log('✅ check-batch-transcript-member → true');
  }
  
  // ===== content-source/subscriptions/list =====
  if (path.indexOf('subscriptions/list') !== -1) {
    modified.data = [];
    log('✅ subscriptions/list 清空订阅限制');
  }
  
  // ===== transcript/create - 创建转录 =====
  if (path === 'transcript/create') {
    if (modified.success === false || !modified.success) {
      // 服务端拒绝（额度不足），伪造成功响应
      // 从请求URL提取参数
      modified.success = true;
      delete modified.message;
      modified.data = {
        id: Math.floor(Math.random() * 90000 + 10000),
        collectionId: null,
        contentSourceId: 5140,
        contentEpisodeId: 0,
        userId: 'd6z7qikngvt2mxas',
        name: 'Transcription',
        basePath: '',
        status: 'RUNNING',
        languageHints: ['en'],
        type: 'video',
        order: null,
        error: null,
        latest: true,
        subtitleMasks: null,
        showSubtitleMask: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      log('✅ transcript/create 强制改为成功');
    }
  }
  
  // ===== transcript/statuses =====
  if (path.indexOf('transcript/statuses') !== -1) {
    if (modified.data && Array.isArray(modified.data)) {
      for (let i = 0; i < modified.data.length; i++) {
        if (modified.data[i].error) {
          log('❌ transcript/statuses 有错误: ' + modified.data[i].error);
          modified.data[i].status = 'SUCCEEDED';
          modified.data[i].error = null;
        }
      }
    }
  }
  
  $done({ body: JSON.stringify(modified) });
  
} catch (e) {
  log('❌ Error: ' + e.toString());
  $done({});
}
