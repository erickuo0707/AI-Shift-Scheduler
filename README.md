# AI 排班助手

依人員可上班時段、技能、工時目標、個人班別偏好與休息規則，產生可檢視、可匯出的排班建議。

## 目前版本

此 MVP 是純前端網頁，資料只儲存在使用者目前的瀏覽器，不會上傳到伺服器，也不需要 API 金鑰。排班由可解釋的規則與評分引擎產生：硬性條件用來避免不可排時段、技能不符、工時超限、休息不足與連續工作日超限；軟性評分用來平衡目標工時、班別偏好與晚班接早班風險。生成式 AI 對話功能可在後續版本接入安全的伺服器端服務。

## 開啟與部署

本機預覽：直接以瀏覽器開啟 `index.html`。

部署成可分享網址：

1. 到 repository 的 **Settings → Pages**。
2. 在 **Build and deployment → Source** 選擇 **GitHub Actions**。
3. 此後推送到 `main` 會自動部署；也可在 **Actions** 手動執行 `Deploy to GitHub Pages`。
4. 網址會是 `https://erickuo0707.github.io/AI-Shift-Scheduler/`。

## 隱私

人員姓名與排班資料預設只保存在本機瀏覽器的 Local Storage。請勿在公用裝置輸入不適合留存的個人資料。
