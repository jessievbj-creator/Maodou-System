# 毛豆积分系统

实时积分打卡系统，支持飞书通知。

## 功能

- 📋 每日任务打卡
- 🎯 实时积分计算
- 📈 7天趋势展示
- 🔔 飞书自动通知
- 🎮 奖励机制

## 部署

### 本地运行

```bash
node server.js
```

访问 http://localhost:3001

### Vercel 部署

1. Fork 这个仓库
2. 连接到 Vercel
3. 部署完成后获得公网 URL

## 配置

修改 `server.js` 中的 `FEISHU_WEBHOOK` 为你的飞书机器人 Webhook URL。

## 使用

- 姥姥用手机/iPad 打分
- 每次打分自动发飞书通知
- 可以随时查看 Dashboard 和趋势
