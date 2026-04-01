# molbot

molbot 是一個以 **Flask + NVIDIA API + Vercel Frontend** 為核心的個人助理專案，  
目前已完成 Web、Telegram、Discord 第一輪串接。

目前雲端模型已切換為：

- `qwen/qwen3.5-122b-a10b`

---

## 目前狀態

目前可視為：

- `molbot V1.5 Stable`
- `Telegram webhook v1 完成`
- `Discord Round 1 完成`

目前已確認：

### Web
- 本地 Flask 後端可正常回應
- Render 後端 API 可正常回應
- Vercel 前端可正常呼叫 Render `/chat`
- 正式站左上角模型名稱顯示正常
- 正式站送出 / 續答 / 模型名稱顯示驗收完成
- 基本上下文可用
- 續答功能可用
- localStorage 對話保存可用
- 清空聊天可用
- 發送中禁止重複送出 / 續答可用
- 手機輸入換行正常
- 手機鍵盤彈出時介面可正常操作
- AI 回覆的粗體 / 清單 / 段落顯示已改善
- `frontend/app.js` 已改為依 hostname 自動切換 API：
  - `localhost / 127.0.0.1` → 本機 Flask
  - 其他情況 → Render 正式站

### Telegram
- Telegram Bot 已建立
- Telegram webhook v1 已成功掛上 Render
- Telegram 私訊 bot 可正常收到回覆
- `/start` 與一般提問可正常回覆
- `/continue` 可用
- `/reset` 可用
- Telegram 上下文目前先存在記憶體

### Discord
- Discord App / Bot 已建立
- Bot Token / Application ID / Public Key 已接入
- Message Content Intent 已開啟
- Guild / Channel 白名單已設定
- Interactions Endpoint URL 已正確掛到 Render
- Guild commands 已建立：
  - `/ask`
  - `/continue`
  - `/reset`
  - `/pingtest`
- `/ask` 可正常取得模型回覆
- `/continue` 可用
- `/reset` 可用
- Discord 目前走：
  - Flask HTTP Interactions
  - Slash Commands
  - deferred response（先顯示思考中，再補正式回覆）
- Discord 上下文目前先存在記憶體

---

## 專案結構

```text
C:\mo\molbot
├─ app.py
├─ requirements.txt
├─ README.md
├─ acceptance-checklist.md
├─ progress.md
├─ commands.md
├─ test_nvidia_api.py
├─ .env
└─ frontend
   ├─ index.html
   ├─ app.js
   └─ style.css
```

---

## 技術架構

### 後端
- Python / Flask
- requests
- python-dotenv
- flask-cors
- PyNaCl（Discord 簽章驗證）

### 前端
- HTML / CSS / JavaScript
- Vercel 部署

### 模型
- NVIDIA API
- 雲端模型：`qwen/qwen3.5-122b-a10b`

### 平台
- Web
- Telegram
- Discord

### 主要路由
- Web：`/`、`/health`、`/chat`
- Telegram：`/telegram/webhook/<secret>`
- Discord：`/discord/interactions`

---

## 目前模型設定

後端模型由環境變數控制：

```python
MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-8b-instruct")
```

目前已驗證的模型為：

```
qwen/qwen3.5-122b-a10b
```

---

## 必要環境變數

### NVIDIA
```
NVIDIA_API_KEY=
NVIDIA_MODEL=qwen/qwen3.5-122b-a10b
```

### Telegram
```
TELEGRAM_BOT_TOKEN=
TELEGRAM_ALLOWED_CHAT_ID=
TELEGRAM_WEBHOOK_SECRET=
```

### Discord
```
DISCORD_BOT_TOKEN=
DISCORD_APPLICATION_ID=
DISCORD_PUBLIC_KEY=
DISCORD_ALLOWED_GUILD_ID=
DISCORD_ALLOWED_CHANNEL_ID=
```

---

## 本地啟動方式

**1. 進入專案目錄**
```powershell
cd "C:\mo\molbot"
```

**2. 啟動虛擬環境**
```powershell
.\venv\Scripts\Activate.ps1
```

**3. 安裝套件**
```powershell
pip install -r requirements.txt
```

**4. 啟動後端**
```powershell
python app.py
```

**5. 開啟前端**

可直接使用 Live Server 或開啟：

```
frontend/index.html
```

---

## 本機測試

### 測試 /chat
```powershell
$body = @{
  message = "你好，請簡短自我介紹"
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri "http://127.0.0.1:5000/chat" `
  -Method Post `
  -ContentType "application/json; charset=utf-8" `
  -Body $body
```

### 測試 /health
```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:5000/health" `
  -Method Get
```

---

## Discord 目前做法

Discord 第一輪目前採用：

- Interactions HTTP Endpoint
- Slash Commands
- Flask 路由接收互動
- deferred response + 背景 thread 補正式回答

目前**不是**走 discord.py 長連線 Gateway 監聽。

### 已建立的 Discord commands
- `/ask`
- `/continue`
- `/reset`
- `/pingtest`

### /reset 的用途

`/reset` 是：清除目前這個 Discord session 的**暫存上下文記憶**

不是：刪除 Discord 頻道裡已經顯示的聊天訊息

---

## 部署資訊

### 前端正式站
```
https://molbot-frontend.vercel.app
```

### 後端正式站
```
https://moltbot-ckvn.onrender.com
```

---

## 已知限制

- 續答判定仍非完美，但目前可接受
- Telegram / Discord 上下文目前先存在記憶體
- Render 重啟後，Telegram / Discord 暫存上下文會消失
- Render Free 閒置時會冷啟動，第一次請求可能較慢
- Discord 第一輪仍以 Slash Commands 為主，尚未整理成完整多平台共用模組

---

## 驗收結論

目前 molbot 已完成：

- V1.5 Web 穩定版
- Qwen 雲端切換
- 正式站驗收
- Telegram webhook v1 串接
- Discord Round 1 串接

可視為：

**一版可保存、可交接、可繼續擴充的穩定版本。**

---

## 下一步規劃

- 整理 Web / Telegram / Discord 共用訊息入口邏輯
- 抽出共用 session / history 管理
- 收斂 Discord deferred response 與 log
- 視需要補 Discord 更完整 command 設計
- 規劃多平台共用設定與錯誤處理

---

## 備註

如果 Render Free 因閒置進入休眠，第一次請求可能會比較慢。
需要時可先打：

```
https://moltbot-ckvn.onrender.com/health
```

讓服務先喚醒。

請搭配 `acceptance-checklist.md`、`progress.md`、`commands.md` 一起使用。
- C:\mo\molbot\docs\acceptance-checklist.md
- C:\mo\molbot\docs\internal\progress.md
- C:\mo\molbot\docs\internal\commands.md