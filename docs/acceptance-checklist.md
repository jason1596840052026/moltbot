# acceptance-checklist.md

## molbot 驗收清單

目前版本：

- `molbot V1.5 Stable`
- `Telegram webhook v1`
- `Discord Round 1`

---

## A. Web / 後端基本驗收

### 1. 本機 Flask 啟動
- [ ] `python app.py` 可正常啟動
- [ ] 本機 `http://127.0.0.1:5000/health` 可回應

### 2. Render 後端
- [ ] Render service 已成功部署
- [ ] `https://moltbot-ckvn.onrender.com/health` 可回應
- [ ] `https://moltbot-ckvn.onrender.com/chat` 可正常回應

### 3. 模型驗證
- [ ] Render 環境變數已設定 `NVIDIA_MODEL=qwen/qwen3.5-122b-a10b`
- [ ] `/chat` 已驗證實際回傳為 Qwen 模型內容
- [ ] 正式站左上角模型名稱顯示正常

---

## B. Web 前端驗收

### 1. 前後端串接
- [ ] Vercel 前端可正常呼叫 Render `/chat`
- [ ] 正式站可正常發問並收到回答
- [ ] 正式站送出功能正常
- [ ] 正式站續答功能正常

### 2. 狀態管理
- [ ] localStorage 對話保存正常
- [ ] 清空聊天正常
- [ ] 發送中禁止重複送出 / 續答正常

### 3. 手機介面
- [ ] 手機輸入換行正常
- [ ] 手機鍵盤彈出時畫面可正常操作

### 4. 顯示效果
- [ ] 粗體顯示正常
- [ ] 清單顯示正常
- [ ] 段落與換行顯示正常

### 5. API 自動切換
- [ ] localhost / 127.0.0.1 時使用本機 Flask
- [ ] 其他 hostname 時使用 Render 正式站

---

## C. Telegram 驗收

### 1. Bot / Webhook
- [ ] Telegram Bot 已建立
- [ ] `.env` 與 Render Environment 已補齊 Telegram 變數
- [ ] `setWebhook` 成功
- [ ] `getWebhookInfo` 驗證成功
- [ ] 手動 POST 到 Telegram webhook 路由成功

### 2. 實際互動
- [ ] Telegram 私訊 bot 可正常收到回覆
- [ ] `/start` 正常
- [ ] 一般提問正常
- [ ] `/continue` 正常
- [ ] `/reset` 正常

### 3. Telegram 限制
- [ ] 知道 Telegram 上下文目前存在記憶體
- [ ] 知道 Render 重啟後 Telegram 暫存上下文會消失

---

## D. Discord 驗收

### 1. Discord 基本設定
- [ ] Discord App 已建立
- [ ] Discord Bot 已建立
- [ ] Bot Token 已取得
- [ ] Application ID 已取得
- [ ] Public Key 已取得
- [ ] Message Content Intent 已開啟
- [ ] Bot 已加入測試伺服器

### 2. Discord 環境變數
- [ ] Render 已設定：
  - [ ] `DISCORD_BOT_TOKEN`
  - [ ] `DISCORD_APPLICATION_ID`
  - [ ] `DISCORD_PUBLIC_KEY`
  - [ ] `DISCORD_ALLOWED_GUILD_ID`
  - [ ] `DISCORD_ALLOWED_CHANNEL_ID`

### 3. Discord 端點設定
- [ ] `一般資訊 -> 互動端點 URI` 已設定：
  - [ ] `https://moltbot-ckvn.onrender.com/discord/interactions`
- [ ] Discord Webhook 頁未重複綁定同一條 interactions URL
- [ ] Interactions endpoint 驗證成功

### 4. Discord commands
- [ ] `/ask` 已建立
- [ ] `/continue` 已建立
- [ ] `/reset` 已建立
- [ ] `/pingtest` 已建立

### 5. Discord 實測
- [ ] `/pingtest` 可回 `未知指令：pingtest`
- [ ] `/ask` 可取得正式模型回覆
- [ ] `/continue` 可接續回覆
- [ ] `/reset` 可清除 Discord session 暫存上下文
- [ ] 已理解 `/reset` 不會刪除聊天室畫面上的歷史訊息

### 6. Discord 限制
- [ ] 已理解 Discord 第一輪目前走 Slash Commands + HTTP Interactions
- [ ] 已理解目前不是走 Gateway 常駐監聽
- [ ] 已理解上下文目前存在記憶體
- [ ] 已理解 Render 重啟後 Discord 暫存上下文會消失

---

## E. Git / 文件同步驗收

### 1. Git
- [ ] `git status` 乾淨
- [ ] 變更已 commit
- [ ] 變更已 push 到 GitHub

### 2. 文件
- [ ] `README.md` 已同步到 Discord 第一輪完成版
- [ ] `acceptance-checklist.md` 已同步到 Discord 第一輪完成版
- [ ] `progress.md` 已同步到 Discord 第一輪完成版
- [ ] `commands.md` 已同步到 Discord 第一輪完成版

---

## F. 目前可接受限制

- [ ] 續答判定仍非完美，但現階段可接受
- [ ] Telegram / Discord 上下文目前先存在記憶體
- [ ] Render 重啟後暫存上下文會消失
- [ ] Render Free 閒置時可能冷啟動
- [ ] Discord 第一輪仍以 Slash Commands 為主，尚未整理成完整多平台共用模組

---

## 驗收結論

若以上項目大致通過，可判定目前狀態為：

- `molbot V1.5 Stable`
- `Telegram webhook v1 完成`
- `Discord Round 1 完成`
- 可進入下一階段：多平台共用邏輯整理