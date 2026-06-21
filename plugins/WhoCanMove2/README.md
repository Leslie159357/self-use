# 谁能挪完 (拼多多小游戏) — 破解分析

AppId: wxcb8d7b6dfad21e95

## API接口
- `api.gzgame99.cn/cpApi/setting/configV2` — 零鉴权游戏配置
- `cpchxapi.dianwanshidai.com/app-api/game/auth/login` — jsCode → JWT (7天)
- `cpchxapi.dianwanshidai.com/app-api/game/chief/update` — 无sign校验

## 破解方法
Loon插件: https://raw.githubusercontent.com/Leslie159357/self-use/main/plugins/WhoCanMove2/WhoCanMove.plugin

直接curl:
curl -X POST 'https://cpchxapi.dianwanshidai.com/app-api/game/chief/update' \
  -H 'authorization: Bearer TOKEN' \
  -H 'content-type: application/json' \
  -d '{"coins":999999,"diamonds":99999,"sp":99999,"level":99,"customData":"{}"}'
