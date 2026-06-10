# 听点点 TingDianDian Pro Unlock

## 应用信息

| 项目 | 内容 |
|------|------|
| App 名称 | 听点点 (TingDianDian) |
| Bundle ID | com.zh.learning |
| 版本 | 1.1.38 (build 8) |
| 架构 | Flutter (Dart AOT) + ObjC |
| 付费系统 | RevenueCat + 自建后端 |
| ATS | ✅ NSAllowsArbitraryLoads = true，无 SSL Pinning |

## 插件功能（v1.2 - 基于抓包修复转录失败）

- ✅ **Pro 永久会员** — isPro=true, isProPermanentMember=true
- ✅ **基础永久/月付/年付** — 全部解锁
- ✅ **积分无限** — pointsLimit=999999, pointsMonthlyGrant=999999
- ✅ **已用积分归零** — pointsUsed=0, pointsFrozen=0
- ✅ **翻译/功能额度** — timeLimit=999999, tokenLimit=999999
- ✅ **检查权限** — check-can-use-transcript, check-points-limit-enough → true
- ✅ **到期时间** — 全部改为 2099-12-31
- ✅ **entitlement** — free → pro
- ✅ **商品价格** — purchase-catalog 所有商品价格改为0
- ✅ **强制转录成功** — transcript/create 服务端额度不足时强制伪造成功响应

## 拦截域名

`api.tingdiandian.com`

## 安装方式

### Quantumult X

```
https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/main/plugins/TingDianDian/tingdiandian_qx.sgmodule
```

1. Quantumult X → 右下角三图标 → 模块 → 右上角➕ → 粘贴链接 → 确定
2. 确保 MitM 已开启
3. 在 MitM → 主机名 中确认已包含 `api.tingdiandian.com`

### Loon

```
https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/main/plugins/TingDianDian/tingdiandian.plugin
```

1. Loon → 插件 → 右上角➕ → 粘贴链接 → 确定
2. 确保 MitM 已开启

## 使用方法

1. 安装模块/插件
2. 确保 MitM 已开启，域名已添加
3. **杀掉 App 重新打开**（本地缓存清空）

## ⚠️ 重要说明

v1.2 修复了转录失败问题：
- 服务端返回"点点额度不足，无法创建转录"时，强制伪造成功响应
- 同时拦截 transcript/statuses 中的错误状态，强制改为 SUCCEEDED

## 版本历史

| 版本 | 说明 |
|------|------|
| v1.0 | 初始版本，正则写错完全没生效 |
| v1.1 | 修复路径匹配和字段名，积分/会员功能正常 |
| v1.2 | 新增 transcript/create 强制成功，修复转录失败 |

## 已知限制

- RevenueCat 有本地缓存，需杀掉 App 重新打开才能生效
- 翻译扣分在服务端执行，MITM 无法拦截服务端内部的积分扣减逻辑
- 通过修改 `/user/...` 响应中的 `pointsUsed=0`、`pointsLimit=999999` 让 App 本地显示无限积分

## 仓库

https://github.com/Leslie159357/Loon-Plugins/tree/main/plugins/TingDianDian
