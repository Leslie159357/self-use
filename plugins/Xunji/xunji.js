// 训记(TrainNote/SynFit) Premium Unlock v1.0
// @author Leslie159357
// @description 解锁Grand会员/VIP功能
// @hostname api.xunjiapp.cn, eatings.xunjiapp.cn, trains.xunjiapp.cn

const url = $request.url;
const body = $response.body;

if (!body) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);

  // ===== 1. 会员策略 - 改为grand会员 =====
  if (url.includes('/fetch_policy') && obj.success && obj.res) {
    obj.res.isgrand = true;
    console.log('✅ [训记] fetch_policy: isgrand → true');
    $done({ body: JSON.stringify(obj) });
    return;
  }

  // ===== 2. VIP试用 - 改为有VIP =====
  if (url.includes('/try_vip_get') && obj.success && obj.res) {
    obj.res.vipDay = 36500;
    obj.res.hasTry = true;
    obj.res.showVipTry = true;
    console.log('✅ [训记] try_vip_get: VIP激活');
    $done({ body: JSON.stringify(obj) });
    return;
  }

  // ===== 3. 其他接口透传 =====
  $done({});

} catch (e) {
  console.log('❌ [训记] 解析失败: ' + e.message);
  $done({});
}
