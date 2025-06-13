# BTC 仪表看板

一个展示比特币关键数据的仪表看板应用，采用前后端分离架构。

## 功能特性

- 实时显示当前 BTC 价格
- 展示最近 7 天的价格走势图表
- 响应式设计，支持多设备访问

## 技术栈

### 前端
- Next.js 14 (TypeScript)
- React 18
- Tailwind CSS
- Chart.js / Recharts (图表库)

### 后端
- Python Flask
- CoinGecko API (获取 BTC 数据)
- CORS 支持

## 项目结构

```
crypto-map/
├── frontend/          # Next.js 前端应用
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/           # Flask 后端服务
│   ├── app.py
│   ├── requirements.txt
│   └── ...
└── README.md
```

## 快速开始

### 启动后端服务

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 启动前端应用

```bash
cd frontend
npm install
npm run dev
```

## API 接口

- `GET /api/btc/price` - 获取当前 BTC 价格
- `GET /api/btc/history` - 获取最近 7 天价格历史

## 部署

- 前端：可部署到 Vercel、Netlify 等平台
- 后端：可部署到 Heroku、Railway 等平台