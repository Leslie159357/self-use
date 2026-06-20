// 猫屎咖啡 (Cat Poop Coffee) - MITM 双重拦截脚本 (v2.0)
// 微信小程序 AppId: wx02f4bd4c2c4522a9
// 服务器域名: minigames.liuzhaoling.com
//
// 策略:
//   1. 请求拦截: POST upsertUserData — 上传时把资源改大，保证服务器存的是大数值
//   2. 响应拦截: GET getUserData — 读取时把资源改大，客户端本地拿到大数值
//
// 支持: Quantumult X / Loon / Surge
//
// QX 配置:
// [rewrite_local]
// ^https:\/\/minigames\.liuzhaoling\.com\/userData\/getUserData url script-response-body catpoop.js
// ^https:\/\/minigames\.liuzhaoling\.com\/userData\/upsertUserData url script-request-body catpoop.js
//
// Loon 配置:
// [Script]
// http-response ^https?:\/\/minigames\.liuzhaoling\.com\/userData\/getUserData script-path=catpoop.js, requires-body=true, timeout=10, tag=猫屎咖啡-读取
// http-request ^https?:\/\/minigames\.liuzhaoling\.com\/userData\/upsertUserData script-path=catpoop.js, timeout=10, tag=猫屎咖啡-上传

(function() {
  // ===== 要修改的资源数值 =====
  var RESOURCES = {
    '_money': 99999999,           // 金币
    '_diamond': 99999,            // 钻石
    '_bean': 99999,               // 豆子
    '_guo': 99999,                // 果冻/果酱
    '_fish': 99999,               // 鱼
    'tili': 999,                  // 体力
    'shopFishLeftCount': 999,     // 钓鱼剩余次数
    'shopFishEndTime': 0,         // 钓鱼冷却时间（0=无冷却）
    'shopDiamondLeftCount': 999,  // 商店钻石剩余
    'shopDiamondEndTime': 0,      // 商店钻石冷却
    'shopMoneyLeftCount': 999,    // 商店金币剩余
    'shopMoneyEndTime': 0,        // 商店金币冷却
    'shopFreeDiamond': 999,       // 免费钻石数
    'zhuanPanLeftCount': 999,     // 转盘剩余次数
    'flyGiftLeftCount': 999,      // 飞行礼包剩余次数
    'orderAdLeftCount': 999,      // 订单广告剩余次数
    'tiliAdLeftCount': 999,       // 体力广告剩余次数
    'catRewadAdLeftCount': 999,   // 猫奖励广告剩余次数
    'todayShareCount': 999,       // 今日分享次数
    'maxBuildCount': 99,          // 最大建造数
    'maxYanJIuCount': 99,         // 最大研究数
    'ADDoubleCount': 999,         // 广告翻倍次数
    'ADDoubleLeftCount': 999,     // 广告翻倍剩余
    'allEarn': 9999999,           // 总收益
    '_researchCount': 999,        // 研究数量
    '_roomCount': 999,            // 房间数量
    '_decorateCount': 999,        // 装饰数量
    'gameTime': 0,                // 游戏时间（置0防封）
    'lianGameTime': 0             // 连连看游戏时间
  };

  // ===== 修改 localData =====
  function modifyLocalData(localData) {
    if (!localData) return localData;
    for (var key in RESOURCES) {
      if (localData.hasOwnProperty(key)) {
        localData[key] = RESOURCES[key];
      }
    }
    localData['isRemoveAd'] = true;
    localData['hasShopFreeDiamond'] = true;
    return localData;
  }

  // ===== 处理 JSON 字符串中的 data 字段 =====
  function processResponseData(dataStr) {
    try {
      var dataObj = JSON.parse(dataStr);
      if (dataObj.localData) {
        dataObj.localData = modifyLocalData(dataObj.localData);
        return JSON.stringify(dataObj);
      }
    } catch (e) {
      console.log('[猫屎咖啡] data解析失败: ' + e.message);
    }
    return dataStr;
  }

  // ===== 处理响应体 (getUserData) =====
  function handleResponse(body) {
    try {
      var obj = JSON.parse(body);
      if (obj.data && typeof obj.data === 'string') {
        obj.data = processResponseData(obj.data);
        console.log('[猫屎咖啡] 响应数据已修改 ✓');
        return JSON.stringify(obj);
      }
    } catch (e) {
      console.log('[猫屎咖啡] 响应解析失败: ' + e.message);
    }
    return body;
  }

  // ===== 处理请求体 (upsertUserData) =====
  function handleRequest(body) {
    try {
      var obj = JSON.parse(body);
      if (obj.data && typeof obj.data === 'string') {
        var dataObj = JSON.parse(obj.data);
        if (dataObj.localData) {
          dataObj.localData = modifyLocalData(dataObj.localData);
          obj.data = JSON.stringify(dataObj);
          console.log('[猫屎咖啡] 上传数据已修改 ✓');
          return JSON.stringify(obj);
        }
      }
    } catch (e) {
      console.log('[猫屎咖啡] 请求解析失败: ' + e.message);
    }
    return body;
  }

  // ===== 入口: 根据是否有 $response 判断是响应还是请求 =====
  var url = $request.url;

  // 响应拦截 - GET /userData/getUserData
  if (typeof $response !== 'undefined' && $response.body) {
    if (url.indexOf('/userData/getUserData') !== -1) {
      var modifiedBody = handleResponse($response.body);
      $done({body: modifiedBody});
    } else {
      $done({});
    }
    return;
  }

  // 请求拦截 - POST /userData/upsertUserData
  var body = $request.body || $request.bodyBytes || '';
  if (url.indexOf('/userData/upsertUserData') !== -1 && body) {
    var modifiedBody = handleRequest(body);
    $done({body: modifiedBody});
  } else {
    $done({});
  }
})();
