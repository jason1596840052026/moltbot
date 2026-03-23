# molbot

molbot 是一個以 **Flask + NVIDIA API** 為核心的個人助理 Web 專案。  
目前已完成 **V1.5 第一輪**，並通過正式站驗收。

---

## 專案目標

建立一個可部署在雲端、可由前端網頁直接互動的 AI 聊天助理，具備：

- 基本聊天能力
- 可承接最近上下文
- 最小可用續答功能
- 前端本地對話保存
- 基本錯誤提示與操作體驗

---

## 目前版本狀態

**目前版本：V1.5 第一輪**  
**狀態：正式站驗收完成**

### 已完成能力

- Flask 後端已完成
- Render 後端部署完成
- `/`、`/health`、`/chat` 路由可正常使用
- 已成功串接 NVIDIA API
- 已加入 CORS，並放行 Vercel 前端網址
- 前端已完成並部署到 Vercel
- 前後端正式串通成功
- 可正常發送訊息並顯示 AI 回覆
- 可顯示模型名稱
- 已完成基本上下文功能
- 已完成最小可用續答功能
- 已完成 history 清洗，限制最近 10 筆
- 已完成 localStorage 對話保存
- 已完成清空聊天功能
- 已完成前後端錯誤提示優化
- 已完成 `frontend/index.html`、`frontend/style.css` 結構整理

---

## 正式站網址

### 前端
- `https://molbot-frontend.vercel.app`

### 後端
- Render 部署版本
- 實際 API 由前端呼叫已驗證可正常使用

---

## 專案結構

```text
C:\mo\molbot
├─ app.py
├─ requirements.txt
├─ README.md
├─ acceptance-checklist.md
├─ test_nvidia_api.py
└─ frontend
   ├─ index.html
   ├─ app.js
   └─ style.css