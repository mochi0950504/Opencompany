# OpenCompany Platform

多模型協調・長時自主調研・會成長的開放平台。

挑選你喜歡的 AI 模型（**上限 4 個、必須互不相同**）組成編隊，丟給它一個調研目標，
它會自己規劃、並行調研、互相批判、綜合報告——任務以步驟級檢查點落盤，
**進程被殺、機器重開都能從斷點續跑**，因此可以安心跑數小時甚至數天。
每完成一個任務，平台會把教訓寫進記憶庫、提出工作守則（playbook）修訂、
甚至提案新工具——**越用越聰明**。

```
┌─────────────────────────────────────────────────────────────┐
│  Web 儀表板（React）        SSE 即時事件流                      │
├─────────────────────────────────────────────────────────────┤
│  Fastify API                                                 │
├──────────────┬──────────────────────────┬───────────────────┤
│  Runner      │  Orchestrator            │  Growth            │
│  併發/恢復    │  plan → research(並行)    │  記憶庫 (FTS5)      │
│  暫停/取消    │  → critique → synthesize │  Playbook 演化      │
│              │  → retro，步驟級檢查點     │  工具自擴充(沙箱+審核)│
├──────────────┴──────────────────────────┴───────────────────┤
│  Provider Registry：openrouter / anthropic / openai /        │
│  google / ollama / mock —— 一個 chat 介面，重試與退避內建      │
├─────────────────────────────────────────────────────────────┤
│  SQLite（WAL）：tasks / steps / events / artifacts /          │
│  memories / playbooks / tools                                │
└─────────────────────────────────────────────────────────────┘
```

## 快速開始

```bash
cd platform
npm install

# 設定你有的金鑰（有哪個設哪個；一個都沒有也能用 mock 模型體驗全流程）
export OPENROUTER_API_KEY=...   # 一把金鑰任選上百模型（推薦先設這個）
export ANTHROPIC_API_KEY=...
export OPENAI_API_KEY=...
export GEMINI_API_KEY=...
export OLLAMA_BASE_URL=http://localhost:11434   # 本地模型（預設值）

npm run build      # 建置儀表板 + 型別檢查
npm start          # http://localhost:4400
```

打開儀表板 → 新任務 → 「一鍵示範編隊」（4 個離線 mock 模型）→ 送出，
就能看到完整管線跑完。接上真實金鑰後，同一個流程即是真調研。

## 編隊與管線

每位成員 = 一個模型 + 一組角色：

| 角色 | 職責 |
|---|---|
| planner | 把目標拆成可並行的子題 |
| researcher | 子題調研（可用工具：搜知識庫、抓網頁、存發現） |
| critic | 對抗式批判：逐主張 support / refute / uncertain |
| synthesizer | 以批判結果為準寫最終報告（refute 不得採用） |
| retro | 任務檢討：產出教訓、playbook 修訂提案、工具提案 |

讓**不同廠牌的模型互相批判**是設計核心——單一模型的盲點，
換一個模型當 critic 常常一眼看穿。

## 長時執行的三道保險

1. **檢查點**：每個步驟的輸入/輸出/token 即時落盤 SQLite；重啟後 `running` 任務自動重新入列，中斷的步驟重跑。
2. **預算護欄**：`maxSteps` / `maxMinutes` / `maxTokens` 任一超標即跳過剩餘調研、強制進入綜合——永遠拿得到報告，不會燒乾錢包。
3. **失敗重試**：步驟失敗自動重試（上限 2 次），連續失敗過多任務標記 failed。

## 自主成長（全部可審計）

| 機制 | 行為 | 控制 |
|---|---|---|
| 記憶庫 | retro 教訓 + researcher 的 `memory_save` 存入 FTS5；之後每個任務的 prompt 自動帶入相關記憶 | `/growth` 可瀏覽搜尋 |
| Playbook 演化 | retro 提出守則修訂 → 存為新版本（預設**不自動啟用**） | UI 一鍵啟用；`OC_AUTO_EVOLVE=1` 開自動演化 |
| 工具自擴充 | retro 提案新工具（JS）→ `pending` 待審 → 人工核准後載入 **node:vm 沙箱**（只有 fetch + memory，無 fs/process/require，30s 逾時） | UI 核准/拒絕/停用 |

## API 速覽

```
GET  /api/providers                 供應商狀態 + 模型清單
POST /api/tasks                     {goal, crew[≤4], budget?, breadth?, instructions?}
GET  /api/tasks/:id                 任務 + 步驟 + 成果
POST /api/tasks/:id/pause|resume|cancel
GET  /api/tasks/:id/events?after=   SSE 即時事件（含重播）
GET  /api/memories?q=               知識庫搜尋
GET  /api/playbooks                 守則版本；POST /:id/activate
GET  /api/tools                     工具生態；POST /:id/status {status}
```

## 環境變數

| 變數 | 預設 | 說明 |
|---|---|---|
| `OC_PORT` | 4400 | 服務埠 |
| `OC_DB_PATH` | `platform/data/opencompany.db` | SQLite 路徑 |
| `OC_MAX_CONCURRENT` | 3 | 同時執行的任務數 |
| `OC_AUTO_EVOLVE` | 0 | 1 = playbook 修訂自動啟用 |
| `OC_MOCK_DELAY_MS` | 0 | mock 模型每次呼叫延遲（演示/測試用） |

## 測試

```bash
npm test -w server
# ✓ 4 模型 mock 編隊完整管線（含成長副作用）
# ✓ 編隊驗證（互不相同、上限 4）
# ✓ 暫停/恢復
# ✓ 工具生命週期：pending → approved → 沙箱執行（含逃逸測試）
```

## 開放生態

- [x] **MCP 連接器**：掛載任意 stdio MCP server（成長中心 → MCP 連接器，或 `POST /api/mcp`），其工具自動加入編隊工具箱（命名 `mcp__名稱__工具`），伺服器崩潰自動懶重連。注意：新增 MCP server 等同在本機執行該指令，只加入你信任的來源。
- [x] **任務範本**：任務詳情「匯出範本」⇄ 建立任務「匯入範本」，編隊＋預算＋指示一鍵重用
- [x] 多編隊知識共享：任務間的發現透過記憶庫互相餵養
- [ ] Provider 插件目錄：第三方以 npm 套件提供新模型供應商
- [ ] 範本市集：playbook + 編隊配置線上分享
