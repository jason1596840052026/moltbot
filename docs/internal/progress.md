# progress.md

## 目前做到哪一步

目前 `molbot V1.5` 已完成：

- 雲端模型切換
- 正式站驗收
- 前後端串接確認
- Telegram webhook 第一版打通
- Discord 第一輪串接打通

目前可視為：

- `V1.5 Stable`
- `Telegram webhook v1 完成`
- `Discord Round 1 完成`

---

## 目前已完成

- Render 已設定 `NVIDIA_MODEL=qwen/qwen3.5-122b-a10b`
- Render `/chat` 已驗證可正確回傳 Qwen 模型
- 正式站左上角模型名稱顯示正常
- 正式站送出 / 續答 / 模型名稱顯示驗收完成
- 本地 Flask 後端可正常回應
- Render 後端 API 可正常回應
- Vercel 前端可正常呼叫 Render `/chat`
- 正式站前後端串接正常
- 基本上下文可用
- 續答功能可用
- localStorage 對話保存可用
- 清空聊天可用
- 發送中禁止重複送出 / 續答可用
- 手機輸入換行正常
- 手機鍵盤彈出時介面可正常操作
- AI 回覆的粗體 / 清單 / 段落顯示已改善
- Telegram Bot 已建立
- Telegram webhook v1 已成功掛上 Render
- Telegram 私訊 bot 可正常收到回覆
- `/start`、一般提問可正常回覆
- Telegram `/continue` 可用
- Telegram `/reset` 可用
- Discord App / Bot 已建立
- Discord Interactions Endpoint 已可用
- Discord guild commands 已建立（`/ask`、`/continue`、`/reset`、`/pingtest`）
- Discord `/ask` 可正常取得正式模型回覆
- Discord `/continue` 可用
- Discord `/reset` 可用（清除後端暫存上下文，非刪除聊天室訊息）
- README.md 已更新
- acceptance-checklist.md 已更新
- progress.md / commands.md 已更新
- 已完成多輪 commit 與 push

---

## 目前專案狀態

- 版本狀態：`V1.5 Stable`
- 部署狀態：前端 / 後端均已上線
- 模型狀態：已切換至 Qwen
- 驗收狀態：Web + Telegram + Discord 第一輪已通過
- 平台串接狀態：
  - Web 可用
  - Telegram v1 可用
  - Discord Round 1 可用

---

## 已完成項目

### 後端

- 已完成 Flask 後端基本 API 運作
- 已完成 NVIDIA API 串接
- 已確認雲端實際呼叫模型為 Qwen
- `/chat` 路由已於本地與 Render 驗證成功
- 已完成基本上下文與續答流程整理
- 已做過一輪去重與錯誤體驗細修
- 已新增 Telegram webhook 路由第一版
- 已新增 Telegram 文字訊息處理
- 已新增 Telegram `/start`、`/reset`、`/continue` 指令基礎支援
- 已新增 Discord interactions 路由第一版
- 已新增 Discord slash commands 基礎支援
- 已完成 Discord deferred response 流程
- 已加入 Discord 記憶體 session 暫存

### 前端

- 已完成 Vercel 前端與 Render 後端串接
- 已完成模型名稱顯示
- 已完成 localStorage 對話保存
- 已完成清空聊天
- 已完成送出中禁止重複送出 / 續答
- 已完成手機輸入換行與鍵盤操作體驗修正
- `app.js` 已可依 hostname 自動切換本地 / 正式站 API

### 顯示與體驗

- 已完成 Markdown 輕量顯示策略整理
- 目前支援：
  - `**粗體**`
  - 編號清單
  - 項目清單
  - 基本段落與換行
- `style.css` 已補基本段落與清單樣式，閱讀性已改善

### Telegram 串接結果

- 本機 `.env` 與 Render Environment 已補齊 Telegram 變數
- `setWebhook` / `getWebhookInfo` 驗證成功
- 直接 `sendMessage` 測試成功
- 手動 POST 到 webhook 路由測試成功
- 真實 Telegram 私訊流程已可用

### Discord 串接結果

- Discord App / Bot 已建立
- Discord Interactions Endpoint 已可用
- Discord guild commands 已可用
- Discord `/ask` 已成功取得正式模型回答
- Discord `/continue` 已可用
- Discord `/reset` 已可用
- Discord 第一輪確認採用：
  - HTTP Interactions
  - Slash Commands
  - deferred response
- 目前不是走 Gateway 常駐監聽

### 文件與版本

- `README.md` 已更新
- `acceptance-checklist.md` 已更新
- `progress.md` 已更新
- `commands.md` 已更新
- 已完成 `git commit` 與 `git push`

---

## 當前可接受限制

- 續答判定仍非完美
- Telegram / Discord 上下文目前先存在記憶體
- Render 重啟後 Telegram / Discord 暫存上下文會消失
- Render Free 閒置時會冷啟動，第一次請求可能較慢
- Discord 第一輪仍以 Slash Commands 為主
- 多平台共用邏輯尚未完全抽離整理

---

## 當前錯誤 / 卡住問題

- 目前無主要卡住問題
- Discord 第一輪已可用，接下來重點不再是打通，而是整理共用邏輯與文件同步

---

## 下一步要做什麼

### 近一步建議（優先順序）

1. 整理 Web / Telegram / Discord 共用訊息入口邏輯
2. 抽出共用 session / history 管理方式
3. 收斂 Discord deferred response 與 log
4. 視需要補更完整的 Discord command 設計
5. 再視需要更新 README / acceptance-checklist

### 建議策略

- Web 已穩定
- Telegram 已打通
- Discord 第一輪已打通
- 下一階段優先不是重做平台串接，而是整理：
  - 共用模型呼叫邏輯
  - 共用上下文管理
  - 平台差異化回應流程

---

## 已確認環境資訊

- 作業系統：Windows
- Shell：PowerShell
- 後端框架：Flask
- 模型來源：NVIDIA API
- 目前雲端模型：`qwen/qwen3.5-122b-a10b`
- 前端部署：Vercel
- 後端部署：Render
- Telegram：Webhook v1 已完成
- Discord：Round 1 已完成