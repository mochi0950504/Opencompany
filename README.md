# OpenCompany

**Everyone can build your company** — 用一支由你挑選的 AI 模型編隊，開一間會自己調研、自己成長的公司。

## 這個倉庫有什麼

| 目錄 | 內容 |
|---|---|
| [`platform/`](platform/) | **OpenCompany 平台**：多模型協調自主調研平台。挑最多 4 個不同模型組編隊（OpenRouter／Anthropic／OpenAI／Google／Ollama 本地模型），跑「規劃→並行調研→交叉批判→綜合→檢討」管線；步驟級檢查點讓任務可跑數小時到數天、殺進程也能續跑；記憶庫＋playbook 演化＋工具自擴充讓平台越用越聰明。 |
| [`research/`](research/) | 深度調研產出範例：「AI 時代如何創業」研究報告（28 條主張、3 票對抗式查核）＋ 5 分鐘影片成品 |
| [`video/`](video/) | 用 Remotion（React）程式化渲染影片的完整專案 |

## 平台 30 秒上手

```bash
cd platform && npm install && npm run build && npm start
# 打開 http://localhost:4400 → 新任務 → 一鍵示範編隊 → 送出
```

沒有任何 API 金鑰也能用內建 mock 模型體驗完整流程；設定 `OPENROUTER_API_KEY`
等環境變數後即可用真實模型。詳見 [platform/README.md](platform/README.md)。
