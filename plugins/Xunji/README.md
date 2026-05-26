# 训记 (XunJi / SynFit) Premium Unlock

## 支持的App
- 训记 (TrainNote) - 健身训练记录App
- App Store ID: 1445302655

## 拦截接口
| 接口 | 原始值 | 修改后 |
|------|--------|--------|
| `POST /fetch_policy` | `isgrand: false` | `isgrand: true` |
| `GET /try_vip_get` | `vipDay: -1, hasTry: false` | `vipDay: 36500, hasTry: true` |

## 安装
在Loon中点击下方链接安装：

https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/main/plugins/Xunji/xunji.plugin

## 域名
- `api.xunjiapp.cn` - 核心API
- `eatings.xunjiapp.cn` - 饮食记录
- `trains.xunjiapp.cn` - 训练同步
