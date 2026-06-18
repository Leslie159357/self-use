// ==CloakNote==
// Yomu Premium 解锁 v1.0
// 兼容: Loon / Surge / Quantumult X
// 拦截: api.adapty.io（Adapty 用户 Profile API）
// 注意: Adapty v3.x SDK 对 profile 数据使用 AES 加密传输，
//       此脚本尝试拦截解密后的响应。如果无效，请使用备份修改法。
// ==/CloakNote==

const url = $request.url;
let body = $response.body;

if (!body) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);

  // ==========================================================
  // 1. Adapty Profile - 注入 Premium Access Level
  //    匹配所有包含 profile 的 Adapty API 路径
  // ==========================================================
  if (url.indexOf('/profile') !== -1 && url.indexOf('adapty.io') !== -1) {
    // 确保 access_levels 存在
    if (!obj.access_levels) {
      obj.access_levels = {};
    }

    // 注入/修改 premium access level
    obj.access_levels.premium = {
      "id": "premium",
      "is_active": true,
      "is_lifetime": true,
      "will_renew": true,
      "is_in_grace_period": false,
      "is_refund": false,
      "store": "app_store",
      "vendor_product_id": "com.yomu.premium.yearly",
      "activated_at": "2024-01-01T00:00:00Z",
      "renewed_at": "2024-01-01T00:00:00Z",
      "expires_at": "2099-12-31T23:59:59Z",
      "starts_at": "2024-01-01T00:00:00Z",
      "unsubscribed_at": null,
      "billing_issue_detected_at": null,
      "cancellation_reason": null
    };

    // 确保必要字段
    if (obj.subscriptions === undefined) obj.subscriptions = {};
    if (obj.non_subscriptions === undefined) obj.non_subscriptions = {};
    if (obj.version === undefined) obj.version = 1;

    $done({body: JSON.stringify(obj)});
    return;
  }

  $done({});

} catch (e) {
  $done({});
}
