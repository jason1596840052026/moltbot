# molbot

molbot 是一個以 **Flask + Vercel Frontend + NVIDIA API** 為核心的個人助理專案。  
目前已完成：

- Web 聊天前後端串接
- Render 雲端部署
- Vercel 前端部署
- Qwen 模型切換
- Telegram webhook v1 串接

目前專案狀態可視為：

**molbot V1.5 Stable**

---

## 專案目標

建立一個可在：

- 本地環境
- Render 雲端後端
- Vercel 正式前端
- Telegram Bot

上穩定使用的中文 AI 助理。

---

## 目前版本狀態

### 版本
- `V1.5 Stable`

### 目前主模型
- `qwen/qwen3.5-122b-a10b`

### 目前已完成
- Flask 後端 API 可正常運作
- NVIDIA API 串接成功
- Render 後端部署成功
- Vercel 前端部署成功
- Web 正式站前後端串接成功
- 模型名稱顯示正常
- 基本上下文可用
- 續答功能可用
- localStorage 對話保存可用
- 清空聊天可用
- 發送中禁止重複送出 / 續答可用
- 手機輸入換行正常
- 手機鍵盤彈出時介面可正常操作
- AI 回覆的粗體 / 清單 / 段落顯示已改善
- Telegram Bot 已建立
- Telegram webhook v1 已打通
- Telegram 私訊 bot 可正常回覆
- `/start`、一般提問可正常回覆

---

## 技術架構

### 後端
- Python
- Flask
- requests
- python-dotenv
- flask-cors

### 前端
- HTML
- CSS
- JavaScript

### 模型來源
- NVIDIA API

### 部署
- Backend：Render
- Frontend：Vercel

### Bot 平台
- Telegram webhook v1

---

## 專案結構

```text
molbot/
├─ app.py
├─ requirements.txt
├─ README.md
├─ acceptance-checklist.md
├─ test_nvidia_api.py
├─ .env
└─ frontend
   ├─ index.html
   ├─ app.js
   └─ style.css
```

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

當 `/chat` 被呼叫時，後端會將 `MODEL` 寫入 NVIDIA API payload，
因此不是單純前端顯示文字，而是實際呼叫模型設定。

---

## 已確認可用功能

### Web / 後端
- 本地 Flask 後端可正常回應
- `GET /` 可正常回應
- `GET /health` 可正常回應
- `POST /chat` 可正常回應
- Render 後端 API 可正常回應
- Vercel 前端可正常呼叫 Render `/chat`
- 正式站前後端串接正常
- 左上角模型名稱顯示正常
- 基本上下文可用
- 續答功能可用
- localStorage 對話保存可用
- 清空聊天可用
- 發送中禁止重複送出可用
- 發送中禁止重複續答可用

### 顯示與互動
- AI 回覆粗體顯示可用
- 編號清單顯示可用
- 項目清單顯示可用
- 基本段落與換行顯示可用
- 手機輸入可正常換行，不會直接送出
- 手機鍵盤彈出時介面仍可正常操作

### Telegram
- Telegram Bot 已建立
- Webhook 已成功設定到 Render
- `getWebhookInfo` 驗證成功
- 直接 `sendMessage` 測試成功
- 手動 POST webhook 路由測試成功
- 真實 Telegram 私訊流程可用
- `/start` 可正常回覆
- 一般提問可正常回覆
- `/reset`、`/continue` 已有基礎支援

---

## Telegram 目前實作方式

目前 Telegram 採用：

- Webhook 架構
- Render 公開 HTTPS 網址作為 webhook endpoint
- Telegram 訊息轉送到 Flask 路由處理
- Bot 回覆再透過 Telegram Bot API 發送

### 目前 Telegram 使用的環境變數

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_ALLOWED_CHAT_ID=
```

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

### Render 環境變數（目前至少包含）
```
NVIDIA_API_KEY=
NVIDIA_MODEL=qwen/qwen3.5-122b-a10b
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_ALLOWED_CHAT_ID=
```

---

## 本地啟動方式

**1. 進入專案目錄**
```powershell
cd molbot
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

## 本地 / 正式站 API 切換

目前前端 `frontend/app.js` 已支援：

- `localhost / 127.0.0.1` 自動打本機 Flask
- 其他情況自動打 Render 正式站

因此平常不需要每次手動改 `API_BASE_URL`。

---

## 已知限制

- 續答判定仍非完美，但現階段可接受
- Telegram 上下文目前先存在記憶體
- Render 重啟後，Telegram 暫存上下文會消失
- Render Free 閒置時會冷啟動，第一次請求可能較慢
- Telegram 第一版目前以純文字為主
- Discord 尚未開始正式串接

---

## 驗收結論

目前 molbot 已完成：

- V1.5 Web 穩定版
- Qwen 雲端切換
- 正式站驗收
- Telegram webhook v1 串接

可視為：

**一版可保存、可交接、可繼續擴充的穩定版本。**

---

## 下一步規劃

- 文件同步與版本整理
- Discord 第一版串接
- 平台訊息入口共用邏輯整理
- 視需要補平台權限、白名單與多平台 session 策略

---

## 備註

如果 Render Free 因閒置進入休眠，第一次請求可能會比較慢。
需要時可先打：

```
https://moltbot-ckvn.onrender.com/health
```

讓服務先喚醒。