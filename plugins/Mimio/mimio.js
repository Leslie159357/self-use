// Mimio AI Premium Unlock v1.0
// Mimio 英语口语助手 - 解锁所有会员功能
// API域名: ignite.net.cn
// By Leslie

const url = $request.url;
const method = $request.method;
let body = $response.body;

// 尝试解析JSON响应
try {
  let obj = JSON.parse(body);
  if (!obj || obj.code !== 0) {
    $done({body: body});
    return;
  }

  // ========== 1. 核心会员接口: GET /mimio/api/v1/user/info ==========
  if (url.includes('/mimio/api/v1/user/info') && method === 'GET') {
    if (obj.data) {
      obj.data.hasValidMembership = true;
      obj.data.isPremium = true;
      obj.data.membershipDays = 99999;
      obj.data.role = 'premium';
      obj.data.cardType = 'lifetime';
      obj.data.cardStartAt = '2026-05-28T00:00:00Z';
      obj.data.cardExpireAt = '2099-12-31T23:59:59Z';
    }
    console.log('Mimio: user/info - Premium unlocked ✅');
  }

  // ========== 2. 配额检查: GET /mimio/api/v1/quota/check ==========
  if (url.includes('/mimio/api/v1/quota/check') && method === 'GET') {
    if (obj.data) {
      obj.data.unlimited = true;
      obj.data.remaining = 99999;
      obj.data.total = 99999;
    }
    console.log('Mimio: quota/check - Unlimited ✅');
  }

  // ========== 3. 配额消耗: GET /mimio/api/v1/quota/consume ==========
  if (url.includes('/mimio/api/v1/quota/consume') && method === 'GET') {
    if (obj.data) {
      obj.data.unlimited = true;
      obj.data.remaining = 99999;
      obj.data.total = 99999;
    }
    console.log('Mimio: quota/consume - Unlimited ✅');
  }

  $done({body: JSON.stringify(obj)});
} catch (e) {
  console.log('Mimio: parse error - ' + e.message);
  $done({body: body});
}
