var body = $response.body;
var url = $request.url;
var method = $request.method;

if (!body) {
  $done({});
  return;
}

try {
  var obj = JSON.parse(body);

  // 匹配 app.xmind.cn/api/drive/team/profile-by-id
  if (url.indexOf('profile-by-id') !== -1 && method === 'POST') {
    if (obj.profile) {
      obj.profile.plan = 'pro';
      obj.profile.status = 'active';
      obj.profile.expiredAt = '2099-12-31T23:59:59Z';
      obj.profile.credits = [{
        'type': 'pro',
        'total': 99999,
        'remainder': 99999
      }];
      obj.profile.isAiDisabled = false;
    }
    if (obj.credit) {
      obj.credit.sheetLimit = 99999;
    }
    console.log('[Xmind] profile-by-id -> plan: pro, sheetLimit: 99999');
  }

  $done({body: JSON.stringify(obj)});

} catch(e) {
  console.log('[Xmind] Error: ' + e.message);
  $done({});
}
