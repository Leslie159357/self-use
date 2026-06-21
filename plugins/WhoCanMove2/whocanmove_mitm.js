(function() {
  var COINS = 999999;
  var DIAMONDS = 99999;
  var SP = 99999;
  var LEVEL = 9999;
  function log(msg) {
    if (typeof $console !== 'undefined' && $console.log) { $console.log('[谁能挪完] ' + msg); }
  }
  function handleRequest(body) {
    try {
      var obj = JSON.parse(body);
      obj.coins = COINS;
      obj.diamonds = DIAMONDS;
      obj.sp = SP;
      obj.level = LEVEL;
      if (!obj.customData) obj.customData = '{}';
      log('注入: coins=' + COINS + ', diamonds=' + DIAMONDS + ', sp=' + SP + ', level=' + LEVEL);
      return JSON.stringify(obj);
    } catch (e) {
      log('解析失败: ' + e.message);
      return body;
    }
  }
  var url = $request.url;
  var body = $request.body || $request.bodyBytes || '';
  if (url.indexOf('/app-api/game/chief/update') !== -1 && body) {
    $done({body: handleRequest(body)});
  } else {
    $done({});
  }
})();
