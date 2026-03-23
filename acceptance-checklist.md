# molbot acceptance checklist

## 驗收目標

確認 molbot V1.5 第二輪在：

- 本地環境
- Render 後端
- Vercel 前端
- 正式站前後端串接
- Vercel Git 自動部署

皆已達到可用狀態，並完成正式站驗收。

---

## 專案基本資訊

- 專案名稱：molbot
- 後端：Flask
- 前端：HTML / CSS / JavaScript
- 模型來源：NVIDIA API
- 前端正式站：`https://molbot-frontend.vercel.app`
- 驗收版本：V1.5 第二輪
- 正式站驗證日期：2026-03-23

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

---

## B. 前端驗收

### B-1 前端頁面基本功能
- [x] 可正常輸入訊息
- [x] 可正常送出訊息
- [x] 可顯示 AI 回覆
- [x] 可顯示 loading / pending 狀態
- [x] 可阻擋空白輸入
- [x] 可顯示模型名稱

### B-2 對話操作功能
- [x] 清空聊天可正常使用
- [x] 續答功能可正常使用
- [x] localStorage 對話保存可正常使用

### B-3 前端狀態管理
- [x] 發送中禁止重複送出
- [x] 發送中禁止重複續答
- [x] 成功後按鈕狀態可正常恢復
- [x] 失敗後按鈕狀態可正常恢復

### B-4 結構整理
- [x] `frontend/index.html` 已整理
- [x] `frontend/style.css` 已整理
- [x] `frontend/app.js` 已同步正式站版本
- [x] 已補上 `sendBtn` click 綁定
- [x] 已補上 `chatBox / modelInfo` fallback 相容目前 `index.html` 結構

---

## C. 上下文與續答驗收

### C-1 基本上下文
- [x] 可承接最近對話內容
- [x] 問答多輪後仍可維持基本上下文

### C-2 History 清洗策略
- [x] history 已完成清洗
- [x] history 已限制最近 10 筆
- [x] 送出前會再次清洗空值
- [x] 未出現明顯 history 無限制膨脹問題

### C-3 續答策略
- [x] 已完成最小可用續答功能
- [x] 回答中斷後可手動續答
- [x] 續答後可延續既有回答方向
- [x] 已降低續答時重複前文問題
- [x] user / assistant / system 訊息流程已重整
- [x] 錯誤訊息不寫入正式歷史紀錄

---

## D. 正式站驗收

### D-1 前後端正式站串接
- [x] Vercel 前端可正常呼叫 Render 後端
- [x] 正式站可正常收發聊天訊息

### D-2 正式站驗收項目
- [x] 基本連線：通過
- [x] 上下文：通過
- [x] 續答：通過
- [x] localStorage：通過
- [x] 清空聊天：通過
- [x] 錯誤提示：通過
- [x] UI 顯示：通過

### D-3 第二輪正式站驗收項目
- [x] 發送中禁止重複送出：通過
- [x] 發送中禁止重複續答：通過
- [x] 成功 / 失敗後正確恢復按鈕狀態：通過
- [x] 續答去重基本可用：通過
- [x] 正式站問答測試正常：通過

---

## E. 錯誤處理驗收

### E-1 後端關閉情境
- [x] 後端關閉時前端可顯示錯誤提示

### E-2 正常回應情境
- [x] 後端正常回應時不會被前端誤判為錯誤

### E-3 錯誤提示優化
- [x] 前後端錯誤提示已完成基本優化
- [x] Offline 測試可正常顯示錯誤
- [x] 恢復網路並重整後，錯誤訊息不留在歷史紀錄中

---

## F. 本地驗收

### F-1 本地聊天流程
- [x] 本地測試正常
- [x] 本地前端與後端可正常串接

### F-2 本地對話體驗
- [x] 續答可用
- [x] localStorage 可用
- [x] 清空聊天可用
- [x] 上下文可用
- [x] 發送中狀態控制可用

---

## G. 文件與版本控制

### G-1 文件同步
- [x] README 已完成 V1.5 第二輪狀態同步
- [x] acceptance-checklist 已完成第二輪正式站驗收結果同步

### G-2 Git 與部署
- [x] frontend 已納入 Git 版本控制
- [x] 最新前端修正已 commit 並 push
- [x] 已完成 Vercel 手動重新部署
- [x] 正式站已與本地一致

### G-3 Vercel Git 自動部署
- [x] 已完成 Vercel Connect Git Repository
- [x] repo：`jason1596840052026/moltbot`
- [x] Production Branch：`main`
- [x] Root Directory：`frontend`
- [x] Framework Preset：`Other`
- [x] push 後可自動觸發 deployment
- [x] 修正 Root Directory 後正式站不再 404

---

## 驗收結論

### 結論
- [x] molbot V1.5 第二輪完成
- [x] 本地驗收完成
- [x] 正式站驗收完成
- [x] Vercel Git 自動部署驗證完成
- [x] 可進入下一階段穩定性優化與細修

### 下一階段方向
- [ ] 續答去重再細修
- [ ] UI / UX 小幅改善
- [ ] assistant / user 顯示標籤穩定化
- [ ] 文件持續同步
- [ ] V1.5 後續優化規劃

---

## 備註

目前 molbot 已達到穩定可用的最小 Web 聊天助理狀態。  
下一輪應以穩定性、續答品質、介面細修與文件一致性為優先，暫不優先擴充 Discord / Telegram。