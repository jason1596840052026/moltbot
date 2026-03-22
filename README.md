# molbot

molbot 是一個以 **Flask + NVIDIA API** 為核心的簡易聊天助理專案。  
目前已完成後端部署到 **Render**、前端部署到 **Vercel**，並已完成前後端正式串接。

目前版本已支援：

- 前端聊天介面
- 呼叫 Render 後端 `/chat`
- 顯示 AI 回覆
- 顯示模型名稱
- 基本上下文（前端暫存 history 後傳給後端）
- CORS 白名單控管
- 基本 loading / 清空聊天 / 空白訊息阻擋

---

## 1. 專案狀態

目前為第一個可用版本（V1 收尾整理階段），已完成：

- Flask 後端完成
- Render 部署成功
- `/`、`/health`、`/chat` 路由可正常使用
- NVIDIA API 串接成功
- 已加入 CORS，並放行 Vercel 前端網址
- 前端已完成並部署到 Vercel
- 前端聊天頁可正常使用
- 已完成基本上下文功能
- 後端已支援 history
- 後端已將 `max_tokens` 調整為 `800`

---

## 2. 正式網址

### 前端

- https://molbot-frontend.vercel.app

### 後端

- Render 後端已正式上線
- 主要 API：
  - `/`
  - `/health`
  - `/chat`

---

## 3. 專案結構

```text
molbot/
├─ app.py
├─ requirements.txt
├─ README.md
├─ test_nvidia_api.py
├─ .gitignore
├─ .env               # 僅本機使用，請勿上傳
└─ frontend/
   ├─ index.html
   ├─ app.js
   └─ style.css
```

---

## 4. 技術組成

### 後端

- Python
- Flask
- flask-cors
- requests
- python-dotenv
- gunicorn（部署使用）

### 前端

- HTML
- CSS
- JavaScript

### AI 模型來源

- NVIDIA API（`meta/llama-3.1-8b-instruct`）

---

## 5. 環境變數

本專案透過環境變數管理 API Key。

必要的環境變數：

- `NVIDIA_API_KEY`

本機 `.env` 範例：

```env
NVIDIA_API_KEY=your_api_key_here
```

> 請勿將 `.env` 上傳至 GitHub。  
> 正式部署時，請在 Render 的環境變數設定頁面填入。

---

## 6. 本機執行方式（Windows / PowerShell）

### 6-1. 進入專案目錄

```powershell
cd C:\mo\molbot
```

### 6-2. 啟動虛擬環境

```powershell
.\venv\Scripts\Activate.ps1
```

### 6-3. 安裝套件

```powershell
pip install -r requirements.txt
```

### 6-4. 啟動 Flask 後端

```powershell
python app.py
```

### 6-5. 本機預設 URL

```
http://127.0.0.1:5000
```

---

## 7. 前端本機查看方式

前端檔案位於：

```text
frontend/
├─ index.html
├─ app.js
└─ style.css
```

若只需快速查看畫面，可直接開啟 `frontend/index.html`。  
若要測試正式串接，建議以前端正式站為主：

- https://molbot-frontend.vercel.app

---

## 8. API Endpoints

### GET /

後端服務狀態確認。

**Response 範例：**

```json
{
  "message": "molbot backend is running"
}
```

### GET /health

Health check endpoint。

**Response 範例：**

```json
{
  "status": "ok"
}
```

### POST /chat

傳送使用者訊息，取得 AI 回覆。

**Request body：**

```json
{
  "message": "你好，請用繁體中文自我介紹",
  "history": []
}
```

**Response 範例：**

```json
{
  "reply": "你好！我是 molbot ..."
}
```

---

## 9. PowerShell 測試範例

### 測試 /

```powershell
Invoke-RestMethod `
  -Uri "https://moltbot-ckvn.onrender.com/" `
  -Method Get
```

### 測試 /health

```powershell
Invoke-RestMethod `
  -Uri "https://moltbot-ckvn.onrender.com/health" `
  -Method Get
```

### 測試 /chat（繁體中文 + history）

```powershell
$body = @{
    message = "你好，請用繁體中文自我介紹"
    history = @()
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri "https://moltbot-ckvn.onrender.com/chat" `
  -Method Post `
  -ContentType "application/json; charset=utf-8" `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
```

---

## 10. 部署方式

### 10-1. 後端部署（Render）

後端目前已部署成功。部署重點：

- Web Service 指向後端專案 repo
- 啟動命令使用 Flask / gunicorn
- 環境變數需包含 NVIDIA API Key
- CORS 白名單需包含前端正式網址

目前後端已確認可正常回應 `/`、`/health`、`/chat`。

### 10-2. 前端部署（Vercel）

前端目前已部署成功。部署重點：

- `frontend/` 已納入 Git 版本控制
- 前端透過 `app.js` 呼叫 Render `/chat`
- 已確認正式站可正常收發訊息

正式網址：

- https://molbot-frontend.vercel.app

---

## 11. 使用方式

1. 打開前端正式網址
2. 在輸入框輸入訊息
3. 按送出
4. 前端顯示「思考中」
5. 收到 Render 後端回應後，畫面顯示 AI 回覆
6. 若後端有回傳模型名稱，前端會同步顯示
7. 可使用清空聊天按鈕清除目前前端對話紀錄

---

## 12. 目前已確認可用功能

- Render 後端 API 正常回應
- Vercel 前端正常呼叫 Render `/chat`
- 前後端正式串通成功
- 可顯示模型名稱
- 基本上下文可用
- 前端可送出訊息
- 前端可顯示 AI 回覆
- 有 loading 狀態
- 可清空聊天
- 空白內容不可送出

---

## 13. 已知限制

目前版本仍有以下限制：

1. **模型回答品質不完全可控**
   - 模型偶爾可能答偏或自述不準
   - 屬於模型行為，不一定是程式錯誤

2. **尚未支援續答機制**
   - 回答若中途截斷，尚未提供「繼續回答」功能

3. **上下文仍為前端暫存**
   - 目前 history 由前端維護
   - 關閉頁面或清空聊天後即消失
   - 尚未做長期記憶或資料庫保存

4. **錯誤提示仍可再優化**
   - 使用者端看到的錯誤資訊仍偏簡化

5. **尚未做完整對話紀錄保存**
   - 目前無帳號系統，也未寫入資料庫

---

## 14. 下一階段優化方向

建議優先順序如下：

1. 續答功能
2. 更穩定的上下文策略
3. 錯誤提示優化
4. UI / UX 優化
5. 對話紀錄保存

---

## 15. 驗收建議

每次更新後，至少確認以下項目：

- 前端正式站可開啟
- 可正常送出訊息
- AI 可正常回覆
- `/health` 正常
- CORS 無錯
- 上下文可簡單延續
- 模型名稱可顯示
- 空白訊息無法送出
- 清空聊天正常

---

## 16. 開發備註

- Windows 環境，PowerShell 優先工作流
- `.env` 僅供本機使用，正式 API Key 請設定於 Render 環境變數
- 錯誤處理方向：統一回傳 JSON 格式、處理 API 請求錯誤與非預期 Server 錯誤

---

## 備註

目前為可用 V1，重點在：

- 架構已打通
- 雲端部署已完成
- 前後端已正式串接
- 基本聊天流程可用

下一階段會從「可用」往「更穩定、更好用」推進。