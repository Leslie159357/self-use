# YouMind Pro Unlock v2.1

## 安装链接
**QX 模块:**
```
https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/refs/heads/master/plugins/YouMind/youmind_qx.sgmodule
```
**Loon 插件:**
```
https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/refs/heads/master/plugins/YouMind/youmind.plugin
```

## MITM 域名
`hello-lucy.com`

## 基于实际抓包（v2.1 修复）
| 修复项 | 值 |
|--------|-----|
| API 域名 | `hello-lucy.com`（非 `clawhub.ai`） |
| `getCurrentUser.space.status` | `"trialing"` → `"active"` |
| `trialExpiresAt` | 2026 → 2099 |
| `credit.getCreditAccount.productTier` | `"free"` → `"pro"` |
| `credit.getCreditAccount.subTier` | `1` → `999` |
| `hasEverHadSubscription` | `false` → `true` |
| 所有余额字段 | → `999999` |
| 响应格式 | 同时支持 camelCase + snake_case |

## 使用方法
1. 确保已删除旧版插件/模块
2. 安装新版
3. 开启 MitM，域名添加 `hello-lucy.com`
4. 杀掉 App 重新打开
5. 抓包验证响应是否被修改

⚠️ App 存在本地缓存，修改后必须杀掉 App 重开
