// FocusFlight RevenueCat 订阅劫持脚本 v3.0
// 同时支持 http-request（直接回复）和 http-response（替换响应）
// 拦截 /v1/subscribers/ 所有路径（包括 offerings）

const url = $request.url;
const isSubscriberRequest = /\/v1\/subscribers\//.test(url);

if (!isSubscriberRequest) {
  $done({});
  return;
}

// 统一伪造响应体（包含完整 entitlements + subscriptions）
const fakeResponseBody = JSON.stringify({
  "request_date": "2099-12-31T23:59:59Z",
  "request_date_ms": "9999999999999",
  "subscriber": {
    "entitlements": {
      "pro": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "latest_purchase_date": "2024-06-10T00:00:00Z",
        "product_identifier": "net.cementpla.focusflights.lifetime",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "ownership_type": "PURCHASED",
        "store": "app_store",
        "period_type": "active",
        "original_purchase_date": "2024-01-01T00:00:00Z",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null,
        "refund_reason": null
      },
      "premium": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "latest_purchase_date": "2024-06-10T00:00:00Z",
        "product_identifier": "net.cementpla.focusflights.lifetime",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "ownership_type": "PURCHASED",
        "store": "app_store",
        "period_type": "active",
        "original_purchase_date": "2024-01-01T00:00:00Z",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null,
        "refund_reason": null
      },
      "plus": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "latest_purchase_date": "2024-06-10T00:00:00Z",
        "product_identifier": "net.cementpla.focusflights.lifetime",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "ownership_type": "PURCHASED",
        "store": "app_store",
        "period_type": "active",
        "original_purchase_date": "2024-01-01T00:00:00Z",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null,
        "refund_reason": null
      },
      "all_access": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "latest_purchase_date": "2024-06-10T00:00:00Z",
        "product_identifier": "net.cementpla.focusflights.lifetime",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "ownership_type": "PURCHASED",
        "store": "app_store",
        "period_type": "active",
        "original_purchase_date": "2024-01-01T00:00:00Z",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null,
        "refund_reason": null
      }
    },
    "first_seen": "2026-06-23T07:02:16Z",
    "last_seen": "2026-06-23T07:50:59Z",
    "management_url": "https://apps.apple.com/account/subscriptions",
    "non_subscriptions": {},
    "original_app_user_id": "$RCAnonymousID:de40d95d15ce4f4db825ddfd11054970",
    "original_application_version": "265",
    "original_purchase_date": "2024-01-01T00:00:00Z",
    "other_purchases": {},
    "subscriptions": {
      "net.cementpla.focusflights.premium.monthly": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "period_type": "active",
        "store": "app_store",
        "ownership_type": "PURCHASED",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null
      },
      "net.cementpla.focusflights.premium.annually": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "period_type": "active",
        "store": "app_store",
        "ownership_type": "PURCHASED",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null
      },
      "net.cementpla.focusflights.lifetime": {
        "expires_date": "2099-12-31T23:59:59Z",
        "purchase_date": "2024-06-10T00:00:00Z",
        "is_active": true,
        "will_renew": true,
        "is_sandbox": false,
        "period_type": "active",
        "store": "app_store",
        "ownership_type": "PURCHASED",
        "unsubscribe_detected_at": null,
        "billing_issues_detected_at": null
      }
    }
  }
});

const fakeHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Expose-Headers": "X-Request-Id",
  "X-RevenueCat-Request-Time": Date.now().toString()
};

// 判断是 request 还是 response 阶段
// Loon http-request: 有 $request.url 没有 $response
// Loon http-response: 有 $response.status
if (typeof $response === 'undefined' || $response === null) {
  // http-request 阶段：直接回复伪造数据
  $done({
    response: {
      status: 200,
      headers: fakeHeaders,
      body: fakeResponseBody
    }
  });
} else {
  // http-response 阶段：替换响应体
  $done({
    status: 200,
    headers: fakeHeaders,
    body: fakeResponseBody
  });
}
