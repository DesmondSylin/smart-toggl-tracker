# Smart Toggl Tracker for Obsidian

中文 | [English](./README.md)

一個智慧的 Obsidian 外掛，能夠與 Toggl 時間追蹤服務無縫整合，讓您在做筆記的同時輕鬆追蹤時間。

## 功能特色

### 🎯 智慧計時建議
- **自動分析筆記內容**：根據目前筆記的檔案名稱、標題階層、清單結構和標籤，自動建議適合的專案和描述
- **歷史記錄推薦**：根據之前的時間記錄，提供相關的計時建議
- **一鍵快速開始**：選取文字或點擊右鍵即可快速開始計時

### ⏱️ 直覺的時間管理
- **即時計時器**：在側邊欄顯示目前運行的計時器，即時顯示已經過時間
- **快速操作**：輕鬆開始、停止、編輯時間記錄
- **視覺化介面**：使用 Svelte 構建的現代化使用者介面

### 📊 時間記錄追蹤
- **本週統計**：顯示本週總計時時間
- **每日明細**：按日期分組顯示時間記錄
- **專案標識**：使用顏色區分不同專案
- **標籤支援**：完整支援 Toggl 標籤系統

### 🔄 同步與離線處理
- **自動同步**：與 Toggl 服務自動同步資料
- **離線偵測**：網路中斷時提供重新連線選項
- **錯誤處理**：完善的錯誤提示和處理機制

### 🖥️ 桌面版增強功能
- **狀態列計時器**：在底部狀態列顯示 Toggl 圖示和目前計時狀態
- **快速存取**：點擊狀態列圖示快速開啟計時器面板
- **即時顯示**：狀態列即時顯示目前計時任務名稱和已經過時間

### 🔌 開發者 API
- **外掛整合**：提供 API 供其他外掛呼叫開始計時功能
- **程式化控制**：支援透過程式碼控制計時器的開始和停止

## 安裝方式

### 使用 BRAT 安裝（推薦）
由於此外掛尚未上架到 Obsidian 官方社群外掛市場，建議使用 BRAT 進行安裝：

1. **安裝 BRAT 外掛**：
   - 打開 Obsidian 設定
   - 前往「第三方外掛」→「社群外掛」
   - 關閉「安全模式」
   - 搜尋並安裝 "Obsidian42 - BRAT"
   - 啟用 BRAT 外掛

2. **透過 BRAT 安裝 Smart Toggl Tracker**：
   - 打開命令面板（`Ctrl/Cmd + P`）
   - 輸入 "BRAT: Add a beta plugin for testing"
   - 輸入 GitHub 儲存庫網址：`DesmondSylin/smart-toggl-tracker`
   - 點擊「Add Plugin」
   - 等待安裝完成後啟用外掛

3. **啟用外掛**：
   - 前往「設定」→「第三方外掛」
   - 找到「Smart Toggl Tracker」並啟用

### 手動安裝
如果您不想使用 BRAT，也可以手動安裝：

1. 前往 [GitHub Releases 頁面](https://github.com/DesmondSylin/smart-toggl-tracker/releases)
2. 下載最新版本的 `smart-toggl-tracker.zip` 檔案
3. 解壓縮到您的 Obsidian 外掛資料夾：`<vault>/.obsidian/plugins/smart-toggl-tracker/`
4. 重新載入 Obsidian（`Ctrl/Cmd + R`）
5. 在設定中啟用外掛

> **注意**：使用 BRAT 安裝的好處是可以自動接收外掛更新，而手動安裝則需要手動下載新版本。

## 設定教學

### 1. 取得 Toggl API Token
1. 登入您的 [Toggl Track 帳戶](https://track.toggl.com)
2. 前往 [個人資料頁面](https://track.toggl.com/profile)
3. 在「API Token」區段複製您的 token

### 2. 設定外掛
1. 在 Obsidian 設定中找到「Smart Toggl Tracker」
2. 貼上您的 Toggl API Token
3. 點擊「Connect」按鈕
4. 連線成功後即可開始使用

## 使用方法

### 快速開始計時
1. **使用命令面板**：
   - 按 `Ctrl/Cmd + P` 開啟命令面板
   - 輸入 "Start Toggl Timer"
   - 選擇合適的專案和描述

2. **使用右鍵選單**：
   - 在編輯器中右鍵點擊
   - 選擇「Start Timer」
   - 從建議清單中選擇

3. **使用側邊欄**：
   - 開啟「Toggl Timer」面板
   - 點擊「Start a new timer」
   - 填寫計時詳細資訊

### 智慧建議系統
外掛會根據以下內容自動產生建議：

- **檔案名稱**：將檔案名稱作為專案名稱候選
- **標題階層**：分析目前位置的標題階層作為專案結構
- **清單結構**：根據清單的層級關係建議專案
- **資料夾路徑**：使用資料夾名稱作為專案候選
- **標籤內容**：將筆記中的標籤轉換為 Toggl 標籤

### 管理計時記錄
- **編輯記錄**：點擊任何時間記錄進行編輯
- **重複計時**：點擊播放按鈕重新開始相同的計時
- **停止計時**：點擊停止按鈕結束目前計時
- **同步資料**：手動同步 Toggl 資料

### 桌面版狀態列功能
- **快速存取**：在底部狀態列顯示 Toggl 計時器圖示 (⏱️)
- **即時狀態**：顯示目前計時任務名稱和已經過時間
- **一鍵開啟**：點擊狀態列圖示快速開啟計時器面板
- **自動更新**：每秒更新計時狀態，無需手動重新整理

> **注意**：狀態列功能僅在桌面版 Obsidian 中可用

## 可用命令

外掛提供以下命令（可透過命令面板使用）：

- `Show Tracker`：顯示計時器面板
- `Sync Now`：立即同步 Toggl 資料
- `Open Timer Panel`：開啟計時器面板
- `Stop Toggl Timer`：停止目前運行的計時器
- `Start Toggl Timer`：開始新的計時器

## 設定選項

### Toggl API Token
輸入您的 Toggl API Token 以連線到 Toggl 服務。

### 除錯模式
啟用除錯模式可以：
- 顯示詳細的除錯資訊
- 停用自動同步功能
- 在控制台輸出詳細日誌

## 疑難排解

### 連線問題
- **Token 無效**：請確認您的 Toggl API Token 是否正確
- **網路錯誤**：檢查網路連線，外掛會自動偵測離線狀態
- **請求過多**：如果收到 429 錯誤，請稍後再試

### 同步問題
- **資料不同步**：點擊「Sync」按鈕手動同步
- **記錄遺失**：檢查 Toggl 網站上的記錄狀態

### 效能問題
- **載入緩慢**：大量歷史記錄可能影響載入速度
- **記憶體使用**：外掛會載入最近 7 天的記錄

## 隱私與安全

- 外掛僅與官方 Toggl API 通訊
- 所有資料使用 HTTPS 加密傳輸
- API Token 僅儲存在本地
- 不會收集或傳送個人資料給第三方

## 支援與回饋

如果您遇到問題或有功能建議，請：

1. 查看 [GitHub Issues](https://github.com/DesmondSylin/smart-toggl-tracker/issues)
2. 提交新的 Issue 描述問題
3. 在社群中分享使用經驗

## 開發資訊

### 技術架構
- **前端框架**：Svelte
- **開發語言**：TypeScript
- **API 整合**：Toggl Track API v9
- **資料儲存**：IndexedDB（透過 idb）

### 開發者 API

外掛提供公開 API 供其他外掛使用：

#### `startTrackingByAPI(description, project, tags)`

開始新的計時記錄。

**參數：**
- `description` (string): 任務描述
- `project` (string): 專案名稱（會自動搜尋匹配的專案）
- `tags` (string[]): 標籤陣列

**返回值：**
- `Promise<{ok: boolean}>`: 成功返回 `{ok: true}`，失敗返回 `{ok: false}`

**使用範例：**
```javascript
// 取得 Smart Toggl Tracker 外掛實例
const smartTogglPlugin = this.app.plugins.plugins['smart-toggl-tracker'];

// 開始計時
const result = await smartTogglPlugin.startTrackingByAPI(
  '撰寫文件',
  '專案名稱',
  ['tag1', 'tag2']
);

if (result.ok) {
  console.log('計時開始成功');
} else {
  console.log('計時開始失敗');
}
```

**注意事項：**
- 需要先設定 Toggl API Token
- 專案名稱會在現有專案中搜尋，如有多個匹配會使用最後一個
- 如果專案不存在，計時記錄將不會關聯到任何專案

### 專案結構
```
src/
├── main.ts              # 主要外掛邏輯
├── setting.ts           # 設定頁面
├── view.ts              # 檢視管理
├── SuggestModal.ts      # 建議對話框
├── lib/
│   ├── toggl.js         # Toggl API 整合
│   ├── store.js         # 資料儲存管理
│   └── tool.js          # 工具函式
└── view/
    ├── Timer.svelte     # 主要計時器介面
    ├── EntryMenu.svelte # 計時建議選單
    └── EntryMenuItem.svelte # 計時項目元件
```

### 建置說明
```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置生產版本
npm run build
```

## 授權條款

本專案採用 MIT 授權條款。詳細內容請參閱 LICENSE 檔案。

## 版本歷史

### v0.1.7 (最新版)
- 改善智慧建議演算法
- 修復同步問題
- 優化使用者介面

### v0.1.6
- 新增右鍵選單功能
- 支援標籤自動建議
- 改善錯誤處理

---

**作者**：Desmond Sylin
**專案首頁**：[GitHub Repository](https://github.com/DesmondSylin/smart-toggl-tracker)
