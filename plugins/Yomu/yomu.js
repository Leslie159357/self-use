// ==CloakNote==
// Yomu Premium 解锁 v2.0
// 直接替换整个 analytics profile 响应，无需依赖服务器数据
// ==/CloakNote==

const url = $request.url;
let body = $response.body;

// ========== 请求拦截 ==========
if ($request && $request.headers) {
  // 清除所有缓存标识
  if (url.indexOf('adaptytech.com') !== -1 && url.indexOf('/analytics/profiles/') !== -1) {
    var headers = $request.headers;
    if (headers['adapty-sdk-previous-response-hash']) {
      headers['adapty-sdk-previous-response-hash'] = '0000000000000000';
    }
    if (headers['if-none-match']) {
      headers['if-none-match'] = 'none';
    }
  }
}

// ========== 响应拦截 ==========
if (body) {
  try {
    var obj = JSON.parse(body);

    // 拦截所有 analytics/profiles 的响应（GET 和 PATCH）
    if (url.indexOf('analytics/profiles/') !== -1 && url.indexOf('adaptytech.com') !== -1) {

      // 直接替换整个 data 对象，生成含 premium 的完整 profile
      obj.data = {
        "type": "adapty_analytics_profile",
        "id": "4249379d-26bb-470c-aded-d4aa0325d196",
        "attributes": {
          "app_id": "d4434d39-4786-4757-9b81-fbf9bdb4de3e",
          "profile_id": "4249379d-26bb-470c-aded-d4aa0325d196",
          "customer_user_id": null,
          "is_test_user": false,
          "total_revenue_usd": 999.99,
          "segment_hash": "injected_premium",
          "applied_attribution_sources": [],
          "timestamp": 4099766399000,
          "paid_access_levels": {
            "premium": {
              "id": "premium",
              "is_active": true,
              "is_lifetime": true,
              "will_renew": true,
              "is_in_grace_period": false,
              "is_refund": false,
              "store": "app_store",
              "vendor_product_id": "lifetime.yomu.app",
              "activated_at": "2024-01-01T00:00:00Z",
              "renewed_at": "2024-01-01T00:00:00Z",
              "expires_at": "2099-12-31T23:59:59Z",
              "starts_at": "2024-01-01T00:00:00Z",
              "unsubscribed_at": null,
              "billing_issue_detected_at": null,
              "cancellation_reason": null
            }
          },
          "subscriptions": {
            "lifetime.yomu.app": {
              "is_active": true,
              "is_lifetime": true,
              "store": "app_store",
              "vendor_product_id": "lifetime.yomu.app",
              "vendor_transaction_id": "2000000000000000",
              "vendor_original_transaction_id": "2000000000000000",
              "purchased_at": "2024-01-01T00:00:00Z",
              "renewed_at": "2024-01-01T00:00:00Z",
              "expires_at": "2099-12-31T23:59:59Z",
              "starts_at": "2024-01-01T00:00:00Z",
              "is_sandbox": false,
              "is_refund": false
            }
          },
          "non_subscriptions": null,
          "custom_attributes": {},
          "promotional_offer_eligibility": false,
          "introductory_offer_eligibility": true,
          "autoconsume": true
        }
      };

      $done({body: JSON.stringify(obj)});
      return;
    }

    $done({});

  } catch (e) {
    $done({});
  }
} else {
  $done({});
}
