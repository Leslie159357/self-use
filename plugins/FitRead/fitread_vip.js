// FitRead VIP 解锁 - QX 版
var body = $response.body;
if (body) {
  try {
    var obj = JSON.parse(body);
    if (obj && obj.data) {
      obj.data.isVip = true;
      obj.data.startDate = "2025-01-01 00:00:00";
      obj.data.endDate = "2099-12-31 23:59:59";
    }
    $done({body: JSON.stringify(obj)});
  } catch(e) {
    $done({});
  }
} else {
  $done({});
}
