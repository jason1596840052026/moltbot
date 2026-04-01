# commands.md

## 專案用途

這份文件收錄「龍蝦部署專案 / molbot」常用指令、固定路徑、部署流程與目前已確認狀態。  
使用環境以 **Windows + PowerShell** 為主。

回覆原則：
- 先承接既有進度
- 以實作與除錯優先
- 不從已完成的基礎安裝重新開始
- 指令以 PowerShell 為主
- 若對話太長，要輸出可貼到新聊天室的交接摘要

---

## 1. 專案基本資訊

### 專案名稱
- `molbot`

### 專案類型
- Python Flask 個人助理專案
- 前後端分離：Flask + Vercel Frontend
- 個人助理 / 龍蝦部署專案

### 目前已完成
- 本機 Flask 後端可正常執行
- 已成功串接 NVIDIA API
- Render 已切換模型為 `qwen/qwen3.5-122b-a10b`
- Render `/chat` 已驗證可正確回傳 Qwen
- Vercel 前端可正常呼叫 Render `/chat`
- 正式站模型名稱顯示正常
- 基本上下文可用
- 續答功能可用
- localStorage 對話保存可用
- 清空聊天可用
- 發送中禁止重複送出 / 續答可用
- 手機輸入換行與鍵盤操作正常
- AI 回覆的粗體 / 清單 / 段落顯示已改善
- Telegram webhook v1 已打通
- Telegram 私訊 bot 可正常收到回覆
- Discord 第一輪已打通
- Discord `/ask`、`/continue`、`/reset` 可用
- README / acceptance-checklist / progress / commands 已同步
- 已完成 commit 與 push

### 目前重要檔案
- `C:\mo\molbot\app.py`
- `C:\mo\molbot\requirements.txt`
- `C:\mo\molbot\README.md`
- `C:\mo\molbot\acceptance-checklist.md`
- `C:\mo\molbot\progress.md`
- `C:\mo\molbot\commands.md`
- `C:\mo\molbot\test_nvidia_api.py`
- `C:\mo\molbot\.env`
- `C:\mo\molbot\frontend\index.html`
- `C:\mo\molbot\frontend\app.js`
- `C:\mo\molbot\frontend\style.css`

### 目前下一步
1. 整理 Web / Telegram / Discord 共用訊息入口邏輯
2. 抽出共用 session / history 管理
3. 收斂 Discord deferred response 與 log
4. 視需要再補更完整的 Discord commands
5. 文件持續同步

---

## 2. 常用 PowerShell 指令

### 切換到專案根目錄

```powershell
cd "C:\mo\molbot"
```

### 查看目前路徑

```powershell
pwd
```

### 查看檔案清單

```powershell
dir
```

---

## 3. Python / Flask

### 啟動虛擬環境

```powershell
.\venv\Scripts\Activate.ps1
```

### 安裝 requirements

```powershell
pip install -r requirements.txt
```

### 單裝 Discord 需要的套件（必要時）

```powershell
pip install pynacl
```

### 啟動 Flask app

```powershell
python app.py
```

### 語法檢查

```powershell
python -m compileall app.py
```

### 測試 NVIDIA API

```powershell
python test_nvidia_api.py
```

### 測試本機 /chat

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

### 喚醒 Render（Free 冷啟動時）

```powershell
Invoke-RestMethod `
  -Uri "https://moltbot-ckvn.onrender.com/health" `
  -Method Get
```

---

## 4. Telegram 常用指令

### 開 TLS 1.2（PowerShell 連 Telegram API 前）

```powershell
[Net.ServicePointManager]::SecurityProtocol =
    [Net.ServicePointManager]::SecurityProtocol -bor
    [Net.SecurityProtocolType]::Tls12
```

### 查 webhook 狀態

```powershell
Invoke-RestMethod `
  -Uri "https://api.telegram.org/bot$token/getWebhookInfo" `
  -Method Get
```

### 顯示 webhook 詳細欄位

```powershell
$info = Invoke-RestMethod `
  -Uri "https://api.telegram.org/bot$token/getWebhookInfo" `
  -Method Get

$info.result | Format-List *
```

### 直接送 Telegram 訊息測試

```powershell
$token = "你的_TELEGRAM_BOT_TOKEN"
$chatId = "你的_TELEGRAM_ALLOWED_CHAT_ID"

Invoke-RestMethod `
  -Uri "https://api.telegram.org/bot$token/sendMessage" `
  -Method Post `
  -Body @{
    chat_id = $chatId
    text    = "molbot direct sendMessage test"
  }
```

### 設定 webhook

```powershell
$token = "你的_TELEGRAM_BOT_TOKEN"
$secret = "你的_TELEGRAM_WEBHOOK_SECRET"
$renderBase = "https://moltbot-ckvn.onrender.com"
$webhookUrl = "$renderBase/telegram/webhook/$secret"
$encodedWebhookUrl = [uri]::EscapeDataString($webhookUrl)

Invoke-RestMethod `
  -Uri "https://api.telegram.org/bot$token/setWebhook?url=$encodedWebhookUrl" `
  -Method Get
```

### 刪除 webhook（重新抓 getUpdates 時用）

```powershell
Invoke-RestMethod `
  -Uri "https://api.telegram.org/bot$token/deleteWebhook?drop_pending_updates=false" `
  -Method Get
```

---

## 5. Discord 常用指令與注意事項

### Discord 必要環境變數

```env
DISCORD_BOT_TOKEN=
DISCORD_APPLICATION_ID=
DISCORD_PUBLIC_KEY=
DISCORD_ALLOWED_GUILD_ID=
DISCORD_ALLOWED_CHANNEL_ID=
```

### Discord Interactions Endpoint

應設定在：

> 一般資訊 -> 互動端點 URI

內容為：

```
https://moltbot-ckvn.onrender.com/discord/interactions
```

> **注意**：不要把同一條 interactions URL 再重複綁到 Webhook 頁，否則容易干擾 Discord interactions 驗證與請求流程。

### Discord command registration 用 PowerShell

先設定變數：

```powershell
$BotToken = "你的 DISCORD_BOT_TOKEN"
$AppId    = "你的 DISCORD_APPLICATION_ID"
$GuildId  = "你的 DISCORD_ALLOWED_GUILD_ID"

$Headers = @{
  Authorization  = "Bot $BotToken"
  "Content-Type" = "application/json"
  "User-Agent"   = "molbot/1.5 (Windows PowerShell; Discord command registration)"
}
```

### 註冊 /ask

```powershell
$Body = @'
{
  "name": "ask",
  "description": "Ask molbot a question",
  "type": 1,
  "options": [
    {
      "name": "message",
      "description": "Your question",
      "type": 3,
      "required": true
    }
  ]
}
'@

Invoke-RestMethod `
  -Uri "https://discord.com/api/v10/applications/$AppId/guilds/$GuildId/commands" `
  -Method Post `
  -Headers $Headers `
  -Body $Body
```

### 註冊 /reset

```powershell
$Body = @'
{
  "name": "reset",
  "description": "Reset Discord conversation context",
  "type": 1
}
'@

Invoke-RestMethod `
  -Uri "https://discord.com/api/v10/applications/$AppId/guilds/$GuildId/commands" `
  -Method Post `
  -Headers $Headers `
  -Body $Body
```

### 註冊 /continue

```powershell
$Body = @'
{
  "name": "continue",
  "description": "Continue the previous reply",
  "type": 1
}
'@

Invoke-RestMethod `
  -Uri "https://discord.com/api/v10/applications/$AppId/guilds/$GuildId/commands" `
  -Method Post `
  -Headers $Headers `
  -Body $Body
```

### 註冊 /pingtest

```powershell
$Body = @'
{
  "name": "pingtest",
  "description": "Ping test command",
  "type": 1
}
'@

Invoke-RestMethod `
  -Uri "https://discord.com/api/v10/applications/$AppId/guilds/$GuildId/commands" `
  -Method Post `
  -Headers $Headers `
  -Body $Body
```

### Discord 測試指令

```
/pingtest
/ask message:你好
/continue
/reset
```

### Discord /reset 說明

`/reset` 的用途是：**清除 AI 在後端記憶體中的暫存上下文**

不是：刪除 Discord 畫面上的舊訊息

---

## 6. Git 常用指令

### 查看狀態

```powershell
git status
```

### 加入追蹤

```powershell
git add .
```

### 提交

```powershell
git commit -m "feat: update molbot"
```

### 推送到 GitHub

```powershell
git push origin main
```

### 查看最近提交

```powershell
git log --oneline -5
```

---

## 7. GitHub / 安全檢查

### 查看 .gitignore

```powershell
Get-Content .gitignore
```

### 確認 .env 沒被追蹤

```powershell
git status
```

### 若 .env 已被追蹤，移除快取

```powershell
git rm --cached .env
```

### 建議 .gitignore 至少包含

```gitignore
.env
__pycache__/
*.pyc
.venv/
venv/
.vscode/
frontend/.vercel/
```

---

## 8. Render / Vercel 部署檢查

### 部署後檢查重點

- `/chat` 是否正常回應
- 前端是否可正常發送訊息
- 左上角模型名稱是否正確
- 續答是否可正常使用
- 手機介面是否正常輸入與操作
- Telegram bot 是否可正常回應
- Discord slash commands 是否可正常回應

### 手動重新部署

- Render Dashboard -> 右上角 `Manual Deploy`
- 環境變數修改後，若未自動套用，需手動重新部署

---

## 9. 除錯常用指令

### Python 版本

```powershell
python --version
```

### pip 版本

```powershell
pip --version
```

### 已安裝套件

```powershell
pip list
```

### 查 port 佔用

```powershell
netstat -ano | findstr :5000
```

---

## 10. 專案固定路徑

| 項目 | 路徑 |
|------|------|
| 本機專案路徑 | `C:\mo\molbot` |
| 後端主程式 | `C:\mo\molbot\app.py` |
| 前端目錄 | `C:\mo\molbot\frontend` |
| 前端腳本 | `C:\mo\molbot\frontend\app.js` |
| 前端樣式 | `C:\mo\molbot\frontend\style.css` |
| 驗收文件 | `C:\mo\molbot\acceptance-checklist.md` |
C:\mo\molbot\docs\acceptance-checklist.md
C:\mo\molbot\docs\internal\progress.md
C:\mo\molbot\docs\internal\commands.md
---

## 11. 現階段判定

目前可視為：

- `molbot V1.5 Stable`
- `Telegram webhook v1 完成`
- `Discord Round 1 完成`

下一步主軸不是重做部署，而是：

- 共用入口邏輯整理
- 共用上下文管理整理
- 平台差異化回應流程整理

---

## 12. 協作方式

- 每次先承接目前既有進度
- 優先提供一個主要步驟，避免一次給太多除錯分支
- 若中途出現錯誤、疑問或畫面不同，先停在當前步驟排查
- 以 Windows / PowerShell 可直接操作為優先
- 若要換新聊天室，需輸出完整交接摘要