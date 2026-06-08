// 百词斩 - Baicizhan VIP Unlock
// Quantumult X / Loon 通用脚本
// Intercept VIP membership API responses to unlock all premium features
// 
// 覆盖域名:
//   learn.baicizhan.com  - H5/支付/Mall API
//   conan.baicizhan.com  - RPC业务API
//   system.baicizhan.com - 系统服务
//   try.baicizhan.com    - 辅助服务
//   du.baicizhan.com     - 兼容老API
//   passport.baicizhan.com - 认证

const url = $request.url;
const isResponse = typeof $response !== 'undefined';

// 未来过期时间戳: 2099-12-31 23:59:59 UTC
const FUTURE_TIMESTAMP = 4102444799000;
const VIP_EXPIRE_DATE = "2099-12-31T23:59:59Z";

if (isResponse) {
  let body = $response.body;
  
  if (typeof body === 'string' && body.length > 0) {
    try {
      let obj = JSON.parse(body);
      let modified = false;
      
      // ===== 递归修改所有VIP字段 =====
      function deepModify(obj, path) {
        if (!obj || typeof obj !== 'object') return false;
        let changed = false;
        
        for (let key in obj) {
          const val = obj[key];
          const lowerKey = key.toLowerCase();
          const currentPath = path ? `${path}.${key}` : key;
          
          // === Bool类型VIP标记 ===
          if (lowerKey === 'isvip' || lowerKey === 'is_vip' || lowerKey === 'isv' || 
              lowerKey === 'vip' || lowerKey === 'ispremium' || lowerKey === 'premium' ||
              lowerKey === 'ispayed' || lowerKey === 'is_payed' || 
              lowerKey === 'ispaid' || lowerKey === 'is_paid' ||
              lowerKey === 'canread' || lowerKey === 'can_read' ||
              lowerKey === 'issubscribe' || lowerKey === 'is_subscribe' ||
              lowerKey === 'ismember' || lowerKey === 'is_member' ||
              lowerKey === 'issvvip' || lowerKey === 'is_svvip' ||
              lowerKey === 'issvip' || lowerKey === 'is_svip' ||
              lowerKey === 'ismembership' || lowerKey === 'is_membership' ||
              lowerKey === 'haspurchased' || lowerKey === 'has_purchased' ||
              lowerKey === 'haspayed' || lowerKey === 'has_payed') {
            if (val === false || val === 0 || val === 'false' || val === '0') {
              obj[key] = true;
              changed = true;
            }
          }
          
          // === Int类型VIP标记（0=普通, 1+=VIP） ===
          if (lowerKey === 'vipstatus' || lowerKey === 'vip_status' ||
              lowerKey === 'svipstatus' || lowerKey === 'svip_status' ||
              lowerKey === 'membertype' || lowerKey === 'member_type' ||
              lowerKey === 'membershiptype' || lowerKey === 'membership_type' ||
              lowerKey === 'usertype' || lowerKey === 'user_type' ||
              lowerKey === 'vip_level' || lowerKey === 'viplevel' ||
              lowerKey === 'viptype' || lowerKey === 'vip_type' ||
              lowerKey === 'vip' || lowerKey === 'v' ||  // 注意全局vip字段
              lowerKey === 'status') {
            if (val === 0 || val === '0' || val === 'none' || val === 'normal') {
              obj[key] = 1;
              changed = true;
            }
          }
          
          // === 过期时间 ===
          if (lowerKey === 'vipexpire' || lowerKey === 'vip_expire' ||
              lowerKey === 'vipexpiration' || lowerKey === 'vip_expiration' ||
              lowerKey === 'expiretime' || lowerKey === 'expire_time' ||
              lowerKey === 'expirationtime' || lowerKey === 'expiration_time' ||
              lowerKey === 'vipexpiretime' || lowerKey === 'vip_expire_time' ||
              lowerKey === 'vipexpireat' || lowerKey === 'vip_expire_at' ||
              lowerKey === 'vipexpireatms' || lowerKey === 'vip_expire_at_ms' ||
              lowerKey === 'vipewpendtime' || lowerKey === 'vipendtime' ||
              lowerKey === 'vipendtime' || lowerKey === 'vip_end_time' ||
              lowerKey === 'expirydate' || lowerKey === 'expiry_date' ||
              lowerKey === 'expiredate' || lowerKey === 'expire_date' ||
              lowerKey === 'membershipExpirationTime' || 
              lowerKey === 'membershipexpirationtime' ||
              lowerKey === 'expirationdate' || lowerKey === 'expiration_date') {
            if (val === null || val === 0 || val === '0' || val === '' || 
                (typeof val === 'number' && val < Date.now())) {
              obj[key] = FUTURE_TIMESTAMP;
              changed = true;
            }
          }
          
          // === 会员类型字符串 ===
          if (lowerKey === 'membershiptype' || lowerKey === 'membership_type' ||
              lowerKey === 'membertype' || lowerKey === 'member_type' ||
              lowerKey === 'viptype' || lowerKey === 'vip_type') {
            if (val === 'none' || val === 'normal' || val === 'free' || val === '' || val === null) {
              obj[key] = 'vip';
              changed = true;
            }
          }
          
          // === 试用量/配额 ===
          if (lowerKey === 'trialremaining' || lowerKey === 'trial_remaining') {
            if (val < 99999) {
              obj[key] = 99999;
              changed = true;
            }
          }
          
          // === 每日限制 ===
          if (lowerKey === 'daynewlimit' || lowerKey === 'day_new_limit' ||
              lowerKey === 'dailynewlimit' || lowerKey === 'daily_new_limit' ||
              lowerKey === 'dayreviewlimit' || lowerKey === 'day_review_limit' ||
              lowerKey === 'dailyreviewlimit' || lowerKey === 'daily_review_limit') {
            if (val < 99999) {
              obj[key] = 99999;
              changed = true;
            }
          }
          
          // === 配额/能量 ===
          if (lowerKey === 'wordenergy' || lowerKey === 'word_energy' ||
              lowerKey === 'energy' || lowerKey === 'coin' || lowerKey === 'coins' ||
              lowerKey === 'gold' || lowerKey === 'diamond' || lowerKey === 'gems' ||
              lowerKey === 'availablemark' || lowerKey === 'available_mark' ||
              lowerKey === 'freemark' || lowerKey === 'free_mark' ||
              lowerKey === 'paidmark' || lowerKey === 'paid_mark' ||
              lowerKey === 'studyenergy' || lowerKey === 'study_energy') {
            if (typeof val === 'number' && val >= 0 && val < 99999) {
              obj[key] = 99999;
              changed = true;
            }
          }
          
          // === 递归处理对象 ===
          if (typeof val === 'object' && val !== null) {
            if (deepModify(val, currentPath)) {
              changed = true;
            }
          }
        }
        return changed;
      }
      
      // === 处理顶层data/unwrap ===
      modified = deepModify(obj, '');
      
      if (modified) {
        $done({ body: JSON.stringify(obj) });
        return;
      }
    } catch (e) {
      // JSON parse 失败，非JSON响应
    }
  }
}

$done({});
