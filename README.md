# molbot

molbot 是一個以 **Flask + NVIDIA API** 為核心的個人助理 Web 專案。  
目前已完成 **V1.5 第二輪**，並通過本地與正式站驗收。

---

## 專案目標

建立一個可部署在雲端、可由前端網頁直接互動的 AI 聊天助理，具備：

- 基本聊天能力
- 可承接最近上下文
- 最小可用續答功能
- 前端本地對話保存
- 基本錯誤提示與操作體驗
- 穩定的前端送出 / 續答狀態管理

---

## 目前版本狀態

**目前版本：V1.5 第二輪**  
**狀態：本地與正式站驗收完成**

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
- 已完成前端訊息狀態管理整理
- 已完成發送中禁止重複送出
- 已完成發送中禁止重複續答
- 已完成成功 / 失敗後按鈕狀態正確恢復
- 已完成續答流程重整，降低重複前文問題
- 已完成 pending 狀態訊息機制
- 已完成錯誤訊息不寫入正式歷史紀錄

---

## 正式站網址

### 前端
- `https://molbot-frontend.vercel.app`

### 後端
- Render 部署版本
- 實際 API 已由前端正式呼叫驗證可正常使用

---

## 部署狀態

### 後端部署
- 平台：Render
- 主程式：`app.py`

### 前端部署
- 平台：Vercel
- Git Repository：`jason1596840052026/moltbot`
- Production Branch：`main`
- Root Directory：`frontend`
- Framework Preset：`Other`

### 自動部署狀態
- frontend 已納入 Git 版本控制
- Vercel 已完成 Connect Git Repository
- push 到 GitHub `main` 後可自動觸發 deployment
- Root Directory 修正後，正式站不再出現 404
- 正式站已確認與本地版本一致

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
```

---

## 已確認可用功能

- Render 後端 API 可正常回應
- Vercel 前端可正常呼叫 Render `/chat`
- 前後端正式串通成功
- 可顯示模型名稱
- 基本上下文可用
- 續答功能可用
- localStorage 對話保存可用
- 清空聊天可用
- 發送中禁止重複送出可用
- 發送中禁止重複續答可用
- 成功 / 失敗後按鈕狀態可正常恢復
- Offline 測試時前端會顯示錯誤
- 恢復網路並重整後，錯誤訊息不留在歷史紀錄中
- 正式站版型已與本地一致
- Vercel 前端已可隨 git push 自動部署

---

## 驗收結論

molbot V1.5 第二輪已完成，且已通過：

- 本地驗收
- Render 後端驗收
- Vercel 前端驗收
- 正式站前後端串接驗收
- Vercel Git 自動部署驗證

目前專案已達到穩定的最小可用 Web 聊天助理狀態。

---

## 下一步建議方向

目前不優先擴充 Discord / Telegram。  
下一輪優先方向建議為：

- 續答去重再細修，降低少量重複內容
- UI 微調（訊息泡泡高度、排版、按鈕視覺）
- assistant / user 顯示標籤穩定化
- 文件持續同步與驗收項目補強
- 規劃 V1.5 後續優化項目

---

## 備註

目前 V1.5 第二輪已完成部署收斂與正式站同步。  
後續前端更新流程已簡化為：

```bash
# 修改 frontend 內容後執行
git add .
git commit -m "your message"
git push origin main
# 等待 Vercel 自動部署完成
```