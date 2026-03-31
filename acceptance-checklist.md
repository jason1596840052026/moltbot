# molbot acceptance checklist

## 驗收目標

確認 molbot V1.5 Stable 目前在：

- 本地環境
- Render 後端
- Vercel 前端
- 正式站前後端串接
- Telegram webhook v1
- 手機版輸入與介面穩定性
- Render 雲端 Qwen 模型切換

皆已達到可用狀態。

---

## 專案基本資訊

- 專案名稱：molbot
- 後端：Flask
- 前端：HTML / CSS / JavaScript
- 模型來源：NVIDIA API
- 前端正式站：`https://molbot-frontend.vercel.app`
- 後端正式站：`https://moltbot-ckvn.onrender.com`
- 驗收版本：V1.5 Stable
- 正式站驗證日期：2026-03-30

---

## A. 後端驗收

### A-1 Flask 後端可正常啟動
- [x] `app.py` 可在本機正常啟動

### A-2 路由可正常使用
- [x] `GET /` 可正常回應
- [x] `GET /health` 可正常回應
- [x] `POST /chat` 可正常回應

### A-3 NVIDIA API 串接正常
- [x] 已成功串接 NVIDIA API
- [x] 後端可正常取得模型回覆

### A-4 CORS 設定正常
- [x] 已加入 CORS
- [x] 已放行 Vercel 前端網址
- [x] 已放行本地 Live Server 5500 / 5502

---

## B. Render 後端驗收

### B-1 Render 部署正常
- [x] Render web service 可正常存活
- [x] 正式站可正常呼叫 `/health`

### B-2 雲端 `/chat` 驗證正常
- [x] Render `/chat` 可正常回覆
- [x] Render `/chat` 已驗證實際呼叫 Qwen 模型

### B-3 環境變數正確
- [x] `NVIDIA_API_KEY` 已設定
- [x] `NVIDIA_MODEL=qwen/qwen3.5-122b-a10b` 已設定
- [x] Telegram 相關環境變數已補齊
- [x] Telegram 環境變數補齊後已重新部署

---

## C. Vercel 前端驗收

### C-1 前端可正常開啟
- [x] 正式站首頁可正常載入
- [x] 聊天介面可正常顯示

### C-2 前端串接正常
- [x] 前端可正常送出訊息到 Render
- [x] 前端可正常接收模型回覆
- [x] 左上角模型名稱顯示正常

### C-3 API Base URL 策略正常
- [x] 本地 `localhost / 127.0.0.1` 可走本機後端
- [x] 正式站可走 Render 後端

---

## D. 聊天功能驗收

### D-1 基本聊天功能
- [x] 一般提問可正常回覆
- [x] 基本上下文可用
- [x] 模型名稱可正確顯示

### D-2 續答功能
- [x] 續答按鈕可用
- [x] 續答可正常向後端送出請求
- [x] 續答內容會補進同一則 assistant 訊息中
- [x] 已做過一輪去重與體驗細修

### D-3 localStorage
- [x] 對話內容可保存
- [x] 重整後對話仍可保留
- [x] 清空聊天可正常清除

### D-4 按鈕與送出狀態
- [x] 發送中不可重複送出
- [x] 發送中不可重複續答
- [x] 成功 / 失敗後按鈕狀態可恢復

---

## E. 顯示與版面驗收

### E-1 Markdown 輕量顯示
- [x] `**粗體**` 顯示正常
- [x] 編號清單顯示正常
- [x] 項目清單顯示正常
- [x] 段落與換行顯示正常

### E-2 介面體驗
- [x] UI 閱讀性已改善
- [x] assistant / user 顯示正常
- [x] 錯誤訊息可正常顯示
- [x] `style.css` 已補段落與清單樣式

---

## F. 手機版驗收

### F-1 輸入行為
- [x] 手機按 Enter 不會直接送出
- [x] 手機可正常換行

### F-2 介面穩定性
- [x] 手機鍵盤彈出時仍可正常操作
- [x] 聊天畫面未出現明顯跑版

---

## G. Telegram webhook v1 驗收

### G-1 Bot 建立與設定
- [x] Telegram Bot 已建立
- [x] `TELEGRAM_BOT_TOKEN` 已取得
- [x] `TELEGRAM_WEBHOOK_SECRET` 已設定
- [x] `TELEGRAM_ALLOWED_CHAT_ID` 已確認並修正為正確值

### G-2 Webhook 設定
- [x] `setWebhook` 成功
- [x] `getWebhookInfo` 顯示正確 webhook URL
- [x] `pending_update_count = 0`
- [x] `last_error_message` 為空

### G-3 Telegram 訊息驗證
- [x] 直接 `sendMessage` 測試成功
- [x] 手動 POST webhook 路由測試成功
- [x] 真實 Telegram 私訊可收到 bot 回覆
- [x] `/start` 可正常回覆
- [x] 一般提問可正常回覆

### G-4 Telegram 已知限制
- [x] Telegram 上下文目前先存在記憶體
- [x] Render 重啟後 Telegram 暫存上下文會消失
- [x] Render Free 冷啟動時第一次請求可能較慢

---

## H. 文件與版本控制

### H-1 文件同步
- [x] `README.md` 已同步到目前版本狀態
- [x] `acceptance-checklist.md` 已同步到 Telegram 完成版
- [x] `progress.md` 已同步到 Telegram 完成版
- [x] `commands.md` 已同步到 Telegram 完成版

### H-2 Git 與部署
- [x] 最新修改已 commit 並 push
- [x] Render 已成功部署 Telegram webhook v1 版本
- [x] 正式站與本地主要功能一致

---

## 驗收結論

### 結論
- [x] molbot V1.5 Stable 可視為完成
- [x] 本地驗收完成
- [x] 正式站驗收完成
- [x] Render 雲端 Qwen 模型切換完成
- [x] Telegram webhook v1 驗證完成
- [x] 專案已達到可保存、可交接、可繼續擴充狀態

### 下一階段方向
- [ ] Discord 第一版串接
- [ ] 平台訊息入口共用邏輯整理
- [ ] Telegram 上下文持久化策略
- [ ] UI / UX 後續細修
- [ ] 文件持續同步

---

## 備註

目前 molbot 已不只是最小 Web 聊天助理，也已完成 Telegram webhook 第一版。  
下一輪若要繼續擴充，建議優先進入 Discord 串接與平台共用邏輯整理。