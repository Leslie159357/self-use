# 猫屎咖啡 小程序逆向分析报告

## 基本信息

| 项目 | 内容 |
|------|------|
| 小程序名称 | 猫屎咖啡（Cat Poop Coffee） |
| AppId | `wx02f4bd4c2c4522a9` |
| 服务器域名 | `minigames.liuzhaoling.com` |
| 数据 Key | `cafeData` |
| 存档方式 | 本地计算 → 上传云端备份 |

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/userData/getUserData` | GET | 读取游戏存档（核心！需响应拦截） |
| `/userData/upsertUserData` | POST | 上传完整游戏存档（JSON 字符串嵌套） |
| `/userData/getUserDataUpTime` | GET | 查更新时间，参数: appId, key, openId |

## 数据架构

游戏数据通过 `upsertUserData` 上传，通过 `getUserData` 读取。`data` 字段是一个 JSON 字符串，内部结构：

```
{
  "appId": "wx02f4bd4c2c4522a9",
  "key": "cafeData",
  "openId": "o6ZQa7Yf_...",
  "data": "{...localData 和大量游戏状态...}",
  "gameTime": 64
}
```

### 关键资源字段（在 localData 中）

| 字段 | 原始值 | 类型 | 说明 |
|------|--------|------|------|
| `_money` | 750 | int | 金币 |
| `_diamond` | 20 | int | 钻石 |
| `_bean` | 60 | int | 豆子 |
| `_guo` | 480 | int | 果冻/果酱 |
| `_fish` | 0 | int | 鱼 |
| `tili` | 3 | int | 体力 |
| `isRemoveAd` | true | bool | 已去广告 |
| `maxBuildCount` | 1 | int | 最大建造数 |
| `maxYanJIuCount` | 1 | int | 最大研究数 |
| `shopFishLeftCount` | 20 | int | 钓鱼剩余 |
| `zhuanPanLeftCount` | 10 | int | 转盘剩余 |
| `flyGiftLeftCount` | 50 | int | 飞行礼包剩余 |
| `orderAdLeftCount` | 5 | int | 订单广告剩余 |
| `tiliAdLeftCount` | 10 | int | 体力广告剩余 |
| `catRewadAdLeftCount` | 10 | int | 猫奖励广告剩余 |
| `ADDoubleLeftCount` | 10 | int | 广告翻倍剩余 |
| `todayShareCount` | 0 | int | 今日分享次数 |

### 其他结构

- **houseUpgrade**: 房间升级等级字典 (key: 房间ID, value: 等级)
- **UpgradeMap**: 房间的升级项详情（嵌套了 arrHasGet/arrHasShow）
- **yanJiuMapNew**: 研究地图（hasLittle/hasBig）
- **taskMap**: 任务进度（completeCount/hasGet）
- **decorateUnlockMap**: 装饰解锁皮肤
- **roomIsOpenAuto**: 自动开店开关
- **menuRedClickMap**: 红点点击状态

## 破解方案

### 方案 1：MITM 双重拦截（推荐 ⭐）

**核心逻辑：** 这个游戏的数值存在微信小程序本地，服务器只做备份。
所以需要拦截两条路径：

1. **响应拦截** `GET /userData/getUserData` — 客户端读取服务器数据时，注入大数值
2. **请求拦截** `POST /userData/upsertUserData` — 客户端上传时，也把数值改大，保持服务器备份一致

脚本已内置双重拦截逻辑，一个 JS 文件同时处理两种场景。

**Quantumult X 配置片段：**
```ini
[rewrite_remote]
https://raw.githubusercontent.com/你的仓库/maomao_cat_mitm.js, tag=猫屎咖啡, update-interval=86400

[MITM]
hostname = minigames.liuzhaoling.com
```

**Loon 配置片段：**
```ini
[Remote Script]
https://raw.githubusercontent.com/你的仓库/maomao_cat_mitm.js, tag=猫屎咖啡, enabled=true

[MITM]
hostname = minigames.liuzhaoling.com
```

**Surge 配置片段：**
```ini
[Script]
cafe_upload = type=http-request, pattern=^https://minigames\.liuzhaoling\.com/userData/upsertUserData, script-path=maomao_cat_mitm.js

[MITM]
hostname = %APPEND% minigames.liuzhaoling.com
```

### 方案 2：本地存储直接修改（最彻底）

由于小程序的数据存在微信本地存储（wx storage），理论上可以直接用 iMazing 备份修改或文件管理器修改微信的 LocalStorage 文件夹。

对于越狱设备，可以在微信的 WKBiz/WKWebView 的 localStorage 或微信小程序的 storage 文件中搜索 `cafeData` 直接修改。

### 方案 3：小游戏分包反编译

这个小游戏使用了微信小游戏引擎，可以尝试解压 `.wxapkg` 反编译源码，在代码层面直接改逻辑/数值。
