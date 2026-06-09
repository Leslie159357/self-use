// 百词斩 - Baicizhan VIP Unlock v2.0
// 基于 IPA 静态分析 + 实际抓包数据 (433_*) 编写
// 
// ⚠️ 核心发现: 百词斩主要业务API使用 Thrift 二进制协议 (application/x-thrift)
//    MITM 无法直接修改 Thrift 二进制响应体。
//    
// ✅ 可拦截的 VIP JSON 接口:
//   1. strategy.baicizhan.com/api/strategy/get_member_info_page 
//      → 修改 payed, userVipInfo, creditNum
//   2. learn.baicizhan.com/api/mall/proxy/virtual-currency/sell-info
//      → 商品信息
//   3. learn.baicizhan.com/api/mall/proxy/virtual-currency/apple/***
//      → 苹果内购商品
//
//   对于 Thrift 协议接口 (user_basic_info_v2, get_payed_books 等)，
//   需要通过 URL 重写/响应重写来修改关键的响应 Header 或触发 App 重读。

const url = $request.url;
const method = $request.method;
const isResponse = typeof $response !== 'undefined';

// 2099-12-31 23:59:59 UTC 时间戳 (毫秒)
const FUTURE_MS = 4102444799000;

if (isResponse) {
  let body = $response.body;
  let contentType = $response.headers?.['Content-Type'] || $response.headers?.['content-type'] || '';
  
  // 只处理 JSON 响应，跳过 Thrift 二进制
  if (typeof body === 'string' && body.length > 0) {
    try {
      let obj = JSON.parse(body);
      let modified = false;
      
      // ============================================================
      // 1. get_member_info_page - 会员信息页面
      // ============================================================
      if (url.indexOf('/api/strategy/get_member_info_page') !== -1) {
        if (obj.data) {
          // 付费状态
          if (obj.data.payed === false) {
            obj.data.payed = true;
            modified = true;
          }
          
          // 铜板
          if (obj.data.creditNum < 99999) {
            obj.data.creditNum = 99999;
            modified = true;
          }
          if (obj.data.getMonthCreditReward === false) {
            obj.data.getMonthCreditReward = true;
            modified = true;
          }
          if (obj.data.getTodayReward === false) {
            obj.data.getTodayReward = true;
            modified = true;
          }
          obj.data.todayRewardList = [{"type": 1, "value": 100, "desc": "Pro会员每日积分奖励"}];
          
          // userVipInfo - 从 null 改为 VIP 信息
          if (obj.data.userVipInfo === null) {
            obj.data.userVipInfo = {
              "entitlementKey": "bcz.app.vip.v1",
              "memberLevel": 2,
              "expireTime": FUTURE_MS,
              "maxValue": 99999,
              "currentValue": 99999,
              "nextRecoveryTime": null,
              "nextRecoveryAmount": null,
              "recoveryInterval": null
            };
            modified = true;
          } else {
            if (obj.data.userVipInfo.expireTime !== FUTURE_MS) {
              obj.data.userVipInfo.expireTime = FUTURE_MS;
              modified = true;
            }
            obj.data.userVipInfo.memberLevel = 2;
            obj.data.userVipInfo.maxValue = 99999;
            obj.data.userVipInfo.currentValue = 99999;
          }
          
          // 所有商品价格改为0
          if (obj.data.memberSaleInfoList && Array.isArray(obj.data.memberSaleInfoList)) {
            for (var i = 0; i < obj.data.memberSaleInfoList.length; i++) {
              var item = obj.data.memberSaleInfoList[i];
              if (item.price !== undefined || item.originPrice !== undefined) {
                item.price = 0;
                item.originPrice = 0;
                item.autoRenewal = 0;
                if (item.tag) {
                  var tags = item.tag.split(',,');
                  if (tags.length >= 2) {
                    tags[1] = "已解锁";
                  }
                  item.tag = tags.join(',,');
                }
                modified = true;
              }
            }
          }
        }
      }
      
      // ============================================================
      // 2. 在 JSON 响应中递归修改所有 VIP 相关字段（兜底）
      // ============================================================
      if (!modified) {
        modified = deepModifyVIP(obj);
      }
      
      if (modified) {
        $done({body: JSON.stringify(obj)});
        return;
      }
    } catch (e) {
      // JSON parse 失败 - 非 JSON 响应或 Thrift 二进制
    }
  }
}

$done({});

// ===== 递归修改VIP字段（兜底策略） =====
function deepModifyVIP(obj) {
  if (!obj || typeof obj !== 'object') return false;
  let changed = false;
  
  for (var key in obj) {
    var val = obj[key];
    var lk = key.toLowerCase();
    
    // Bool VIP标记
    if ((lk === 'payed' || lk === 'is_payed' || lk === 'ispayed' || 
         lk === 'isvip' || lk === 'is_vip' ||
         lk === 'ispremium' || lk === 'premium' ||
         lk === 'ismember' || lk === 'is_member') &&
        (val === false || val === 0 || val === 'false')) {
      obj[key] = true;
      changed = true;
    }
    
    // Int VIP类型
    else if ((lk === 'membertype' || lk === 'member_type' ||
              lk === 'viplevel' || lk === 'vip_level' ||
              lk === 'viptype' || lk === 'vip_type' ||
              lk === 'vipstatus' || lk === 'vip_status') &&
             (val === 0 || val === '0' || val === 'none')) {
      obj[key] = 1;
      changed = true;
    }
    
    // 过期时间
    else if ((lk === 'vipexpire' || lk === 'vip_expire' ||
              lk === 'expiretime' || lk === 'expire_time' ||
              lk === 'expirydate' || lk === 'expiry_date' ||
              lk === 'expirationtime' || lk === 'expiration_time' ||
              lk === 'vipexpireatms' || lk === 'vip_expire_at_ms' ||
              lk === 'endtime' || lk === 'end_time') &&
             (val === null || val === 0 || val === '0' || val === '')) {
      obj[key] = FUTURE_MS;
      changed = true;
    }
    
    // 配额/能量
    else if ((lk === 'creditnum' || lk === 'credit_num' ||
              lk === 'coin' || lk === 'coins' || lk === 'gold' ||
              lk === 'energy' || lk === 'diamond') &&
             typeof val === 'number' && val >= 0 && val < 99999) {
      obj[key] = 99999;
      changed = true;
    }
    
    // 递归处理子对象
    else if (typeof val === 'object' && val !== null) {
      if (deepModifyVIP(val)) {
        changed = true;
      }
    }
  }
  return changed;
}
