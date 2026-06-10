# 深度研究報告：AI 時代如何創業並成功（台灣・一人/小團隊低成本路線）

> 研究日期：2026-06-10
> 用途：作為 5 分鐘創業教學影片（生動、寫實、具體可實踐）的事實基礎
> 範圍設定（經使用者確認）：台灣為主、一人/小團隊低成本起步、交付「腳本＋分鏡＋AI 生成提示詞」

---

## 研究方法

1. **拆解**：題目拆成 5 個研究角度（台灣公司設立／創業成敗統計／AI 市場剛需／消費者心理學／一人公司實戰案例）。
2. **搜尋**：5 個平行搜尋代理，共執行 25+ 次網路搜尋、抓取數十個來源原文。
3. **提取**：整理出 28 條可驗證主張（C1–C28）。
4. **對抗式查核**：3 個獨立查核代理（來源忠實度／矛盾證據／方法論質疑）對每條主張投票，**2/3 反駁即剔除**。
5. **結果**：1 條剔除、7 條修正後保留、20 條通過（其中 12 條以上經原始出處逐字核對）。

**置信度標示**：🟢 高（原文核對、多來源一致）｜🟡 中（可靠來源但屬估計/自報/相關性）｜🔴 低（估算或有複現爭議，引用須加註）

---

## 一、創業成敗的真實數據：先丟掉「90% 會失敗」

| 主張 | 置信度 | 說明 |
|---|---|---|
| 「90% 創業失敗」查無可靠原始出處 | 🟢 | 反覆溯源僅見互相轉引，無原始研究 [1][2] |
| 美國 BLS：新事業體 1 年後約 78% 存續、5 年約 51%、10 年約 35% | 🟢 | 統計單位是「事業場所（establishment）」；「不再存續」含遷移、出售、自願歇業——SBA 研究估約 1/3 關閉時仍獲利 [3][4] |
| 台灣官方：新創第 5 年存活率約 57%（98–103 年口徑）；2017 白皮書 4–5 年平均 68.7% | 🟢 | 經濟部中小企業署親自闢謠「五年剩 1%」之說 [5][6] |
| VC 型新創死因（CB Insights 2025，431 家）：70% 資金耗盡、43% 產品市場契合（PMF）不佳 | 🟡 | 自選樣本（願意公開死因者）、可複選；CB Insights 自註「沒錢是最終死因，非根因」。舊版（101 篇）「無市場需求」42% 居首——兩版方法不同，**不可並列當趨勢** [7][8] |
| 過早擴張：2011 年 3,200 家網路新創調查，70% 在驗證完成前擴張；其中 93% 月營收從未突破 10 萬美元 | 🟡 | 自報資料、相關性快照，非因果定律 [9] |
| 「科學式創業」RCT（Management Science 2020，116 家）：寫假設→低成本實驗→依證據決策的組別，更快終止壞點子、轉向更果斷；2024 年以 759 家、4 個 RCT 大規模複現 | 🟢 | 複現所驗證的是「**更快知道該不該收手**」的決策品質，而非「賺更多」——引用時勿升級 [10][11] |
| Mom Test 驗證原則：問過去的具體行為（花過多少錢、上次怎麼解決），不問「你會買嗎」；唯一可信訊號是有代價的承諾（訂金/預購/簽約） | 🟢 | 方法論共識，非統計 [12] |

**影片安全措辭**：「美國官方追蹤的是『新開業的事業體』——約一半活過五年，而且關閉不等於賠錢倒閉。創業真正該怕的不是機率，是做了沒人要的東西。」

---

## 二、AI 市場剛需地圖（2025–2026）

### 企業端（付費已被驗證）

| 主張 | 置信度 | 說明 |
|---|---|---|
| 2025 年企業生成式 AI 支出約 **370 億美元**（2024 年 115 億，約 3.2 倍）；應用層占 190 億 | 🟡 | Menlo Ventures 估計（495 位美國企業決策者調查＋生態系推估；依其 2025 年版回溯口徑） [13] |
| 部門級支出排行：**程式開發工具 40 億**、IT 維運 7 億、**行銷 6.6 億、客服 6.3 億**；垂直行業 AI 35 億（醫療 15 億、法律 6.5 億，年增近 3 倍） | 🟡 | 同上 [13] |
| 76% 的企業 AI 用例改為直接採購（2024 年 53%）；成交後 47% 進入正式生產（傳統 SaaS 約 25%） | 🟡 | 企業付費意願與落地率俱高 [13] |
| McKinsey 2025-11（1,993 家受訪組織）：88% 至少一職能常態使用 AI；但僅 39% 回報任何 EBIT 貢獻 | 🟡 | 線上自填、樣本偏大企業；定義鬆（一個部門用 Copilot 即計入）。「採用廣、變現難」 [14] |
| AI agents：62% 組織在實驗、23% 已在某職能規模化；但 Menlo 實測僅 16% 部署符合「真代理」（自主規劃調適） | 🟡 | 「代理元年」名實有落差＝服務型機會 [13][14] |
| 垂直 AI 實際營收：法律 Harvey ARR 1.95 億（2025 底）、醫療 Abridge 1.17 億、客服 Sierra 七季達 1 億（按解決工單計價） | 🟡 | Sacra/BVP 數據；AI 原生垂直公司達 1 億 ARR 速度為 SaaS 史上最快 [15][16] |

### 台灣缺口（一人公司最可切入的剛需）

| 主張 | 置信度 | 說明 |
|---|---|---|
| 台灣中小企業（2025，工研院執行、1,207 家有效樣本）：**僅 7.4% 已導入或正在規劃導入 AI** | 🟢 | 連「規劃中」都算進去 [17][18] |
| 對 AI 僅粗淺了解或完全不了解者合計約 92%（完全不了解僅 6.5%） | 🟢 | ⚠️ 勿壓縮成「92% 不了解 AI」 [17][18] |
| 最大導入障礙：「尚無明確應用需求」63.9%、「對 AI 不理解」26.8%、「成本高」25.5%；**84.5% 沒有 AI 人才** | 🟢 | 「不知道用在哪」＝顧問/導入服務的剛需 [17][18] |
| OECD/G7：50–71% 未導入中小企業把「缺乏專業知識」列首要障礙；小企業僅 27% 有信心導入（中型 82%） | 🟡 | 國際同樣存在落差 [19] |

### 消費端（贏家通吃，慎入）

| 主張 | 置信度 | 說明 |
|---|---|---|
| ChatGPT 週活約 9 億（OpenAI 自報，a16z 2026-03 引述）；網頁流量為第二名 Gemini 的 2.7 倍 | 🟡 | 倍數為**網頁月流量**口徑 [20] |
| 2025 年消費者在 ChatGPT 行動 App 內消費 24.8 億美元（年增 408%） | 🟡 | Appfigures 第三方估計；僅行動內購毛額，不含網頁訂閱 [21] |
| Claude Code 公開發布約 6 個月達 10 億美元「年化營收」（2026-02 已達 25 億） | 🟡 | Anthropic 自報；年化＝當期 run-rate×12 [20][22] |
| a16z 樣本中 AI 應用新創第一年 ARR 中位數：企業端約 210 萬、消費端 420 萬美元 | 🔴 | **頂級 VC deal-flow 樣本**，選擇偏誤極大，不是一般 AI 新創水準——對普通創業者是危險錨點 [23] |

**三個低資本切入點（綜合判斷）**：
1. **中小企業 AI 導入服務**——市場 64% 「不知道用在哪」、85% 無人才：賣「用例盤點＋代建落地」，近零資本可啟動。
2. **垂直工作流自動化**——鎖定會計/法律/醫療/電商後台的文件與流程，ROI 可量化，可學 Sierra 按成果計價。
3. **行銷內容與客服的微型工具**——部門支出 6.6 億／6.3 億美元已被付費驗證。
避開：通用聊天助理與消費端大眾 App（頭部即 ChatGPT，贏家通吃）。

---

## 三、一人/小團隊真實案例（全部可查證，註明口徑）

| 案例 | 事實（已查核） | 置信度 |
|---|---|---|
| **base44**（Maor Shlomo，以色列） | 2024-12 創立、**獨資、零外部融資**；AI 建站工具；2025-06-18 被 Wix 以 **8,000 萬美元現金**收購（另有達標後 9,000 萬 earn-out，見 Wix Q4 財報）；**出售時 8 名員工**（分得 2,500 萬留任金）、25 萬用戶；2025-05 單月淨利自報 18.9 萬美元 | 🟢（淨利為自報） [24][25] |
| **Cal AI**（Zach Yadegari 等 4 位共同創辦人） | **17 歲高中生創辦**（2024-05 上線，被收購報導時 19 歲）；拍照算卡路里 App，技術用現成模型＋RAG，非自研；下載逾 1,500 萬；營收口徑：TechCrunch 保守寫「年營收逾 3,000 萬美元」、創辦人自稱收購前 ARR 破 5,000 萬；2025-12 售予 MyFitnessPal（金額未披露）、7 人團隊全留任 | 🟢（營收為自報/媒體轉述） [26][27] |
| **Pieter Levels** | 零員工（有用承包商）、公開儀表板自報：高峰期（2024）全組合約 300 萬美元/年；2025-11 回落至約 13.8 萬美元/月（Photo AI 為最大來源） | 🔴 全自報、未稽核、時間點波動大 [28] |
| **Sam Altman 引言**（Fortune 2024-02-04） | 「我的科技 CEO 群組裡有個賭盤：第一家**一人十億美元公司**出現在哪一年——沒有 AI 難以想像，如今將會發生。」 | 🟢 引言屬實；但屬願景非數據，截至 2026 年中尚未發生 [29] |
| **AI 工具鏈月成本** | 入門約 100 美元/月（Cursor＋Claude＋雜項訂閱）；認真做產品約 250–350 美元/月 | 🔴 **作者估算**（2026 年中行情），非統計 [30] |

**敘事誠實線**：base44 是「獨資」（100% 股權）≠「一個人營運」（有 8 名員工）；影片不可包裝成「一個人六個月賺八千萬」。最快變現的常見路徑：先接案/服務（數週到數月可有現金流）→ 再產品化（純 SaaS 通常 12–18 個月才有像樣 MRR，社群經驗值）。

---

## 四、在台灣把公司開起來（2025–2026 現況，已核對政府原文)

### 何時需要開（判斷順序）
1. **驗證期**：個人接案／小規模行號即可。2025-01-01 起小規模營業人**起徵點**：銷售貨物月銷 10 萬、勞務 5 萬元以下**免課營業稅**（仍須稅籍登記）[31]。
2. **轉折訊號**：企業客戶要統一發票、營收與獲利穩定上升、出現賠償/債務風險（行號是**無限清償責任**）、要投標案或融資 → 開有限公司。

### 設立有限公司（一人可設）
- 法源：公司法第 98 條「有限公司由一人以上股東組成」；2009 年已廢除最低資本額（資本仍須足敷開辦成本並經會計師查核）[32]。
- 流程（約 **1–2 週**，可全程在經濟部一站式網站 onestop.nat.gov.tw 線上辦）：名稱預查 → 開籌備戶存資本 → 會計師驗資 → 設立登記（取統編）→ 稅籍登記 [33][34]。
- 費用：名稱預查線上 150 元；設立登記費線上 700 元（按資本額每 4,000 元收 1 元、最低 1,000、線上減 300——資本額 400 萬以下即適用最低額）；會計師驗資行情約 2,000–4,000 元；刻章約 1,500–4,500 元。自辦合計約數千元；全程委託代辦行情約 5,000–20,000 元 [33][34]。
- 資本額：無下限，實務常見建議 10 萬元以上（影響銀行往來與信用）[34]。

### 稅怎麼算（記三個數字）
| 型態 | 所得稅 | 營業稅 |
|---|---|---|
| 個人/小規模行號（月銷 20 萬以下、免用發票） | 盈餘併入個人綜所稅 5–40% | 1% 按季查定；起徵點以下免徵（2025 起：貨物 10 萬/勞務 5 萬） |
| 行號（開發票） | 同上 | 5%（加值型，進項可扣抵） |
| 有限公司 | 營所稅 **20%**（課稅所得 12 萬以下免徵；12–20 萬有半數公式緩衝；未分配盈餘加徵 5%） | 5%（加值型，進項可扣抵） |

[31][35][36]
**經驗法則**：獲利低→行號/個人較省；獲利升高（個人邊際稅率超過 20%）或需要發票與有限責任→公司較有利。

---

## 五、消費者心理學：佈置商品/服務的實證技巧（含證據分級）

### 🟢 證據較強，可放心用（仍須註明脈絡）
| 技巧 | 原始證據 | 實務應用 |
|---|---|---|
| **免費鉤子（零價格效應）** | Shampanier, Mazar & Ariely 2007：Hershey's 1¢ vs Lindt 15¢ 時 27% 選 Hershey's；改為免費 vs 14¢ 後跳到 69%（強迫二選一版；含「不買」選項的真實購買版方向相同、幅度較小：15%→34%） [37] | 滿額免運、買就送、免費試用當入口；比等值折扣更有吸引力 |
| **三層定價（妥協效應）** | Simonson & Tversky 1992 相機實驗：兩款各 50/50；加入高階第三款後 22/57/21——中間檔成多數（紙上選擇、學生樣本） [38] | 把想賣的方案放中間；高階方案的存在本身就是銷售工具 |
| **尾數 9 定價** | Anderson & Simester 2003：3 個真實郵購型錄現場實驗，$9 結尾均提升銷量（約 7–8%；新品最強；與「Sale」標並用時減弱）——本清單中方法最強的定價證據 [39] | 非促銷期、新品、難比價的品項用 9 結尾 |
| **損失趨避（方向）** | λ 原始估計 2.25（T&K 1992）；2024 兩個後設分析：1.955（607 筆估計）與 1.31（限風險選擇）——方向穩健、倍數因情境而異 [40][41] | 文案講「不行動會失去什麼」（免運門檻、即將調價）；勿宣稱固定倍數 |

### 🟡 可用但必須誠實註明
| 技巧 | 證據與限制 | 安全用法 |
|---|---|---|
| **誘餌效應** | Economist 訂閱實驗（100 名 MIT 學生課堂假設選擇）：$59 網路 16%／$125 純印刷 0%／$125 合訂 84%；移除誘餌後 68/32。但 Frederick et al. 2014：91 次嘗試僅 11 次在真實商品重現 [42][43] | 在主推方案旁放「同價但明顯較差」的對照項；當設計直覺，別預期實驗室幅度 |
| **社會證明（評論）** | Spiegel/Northwestern × PowerReviews 觀察數據：5 則評論商品購買可能性為零評論的近 4 倍（+270%）；星等 4.0–4.7 區間最佳（趨近 5 反而降）；高價品受益更大（+380%）。**相關非因果**、研究方有商業利益 [44] | 優先催出前 5 則評論；高價品更要放見證；不必追求滿分；勿承諾幅度 |
| **稀缺/急迫** | 2022 J. of Retailing 後設分析（131 研究）：限時限量顯著提高**購買意願**（多非實際銷售）；假稀缺被識破會反噬信任 [45] | 只用真實的限量/期限；網傳「轉換 +35%」等數字無源，勿引用 |

### 🔴 已被複現研究打臉，影片應反向使用
| 迷思 | 真相 |
|---|---|
| 「選擇越少越好」（果醬研究：24 種 60% 停留/3% 購買 vs 6 種 40%/30%） | Scheibehenne et al. 2010 後設分析（50 實驗）：平均效果量趨近零；Chernev et al. 2015 找出條件（選項複雜、無明顯優勢選項、時間壓力、無既定偏好）。**正確版本：別砍選項，降低「比較難度」——清楚分類＋預設推薦款** [46][47] |
| 錨定的零售實驗（「限購 12 罐」3.3→7.0 罐） | 第一作者 Wansink 因學術不端離開康乃爾、多篇撤稿；此實驗勿引用。錨定本身（T&K 1974 輪盤實驗）成立，用「原價對比」即可 [48] |

---

## 已剔除與已修正的主張（透明紀錄）

| 編號 | 原主張 | 裁決（3 票制） | 處理 |
|---|---|---|---|
| C12 部分 | 「72% 組織使用 GenAI」 | ❌ 2/3 反駁（波次混用；A 查為 79%/2025-11、B 查為 71%/2025-03） | **剔除**，只用同波次的 88%/39%/62%/23% |
| C17 | 「Cal AI 由 18 歲高中生創辦、年營收逾 3,000 萬」 | 修正 | 創辦時 **17 歲**；營收標明雙口徑（媒體 3,000 萬/自稱 5,000 萬 ARR） |
| C19 | Levels「年營收 300 萬（月 13.8 萬）」 | 修正（內部矛盾） | 拆開時間點與產品範圍，標明全自報 |
| C5 | 「BLS：新創 1 年倒閉 22%」 | 修正（單位錯置） | 改稱「新事業體不再存續」，註明含遷移/出售 |
| C10 | 「RCT 複現證實績效較佳」 | 修正（過度概括） | 複現證實的是「更快終止壞點子」 |
| C13 | 「92% 不了解 AI」 | 修正（壓縮失真） | 「僅粗淺了解＋完全不了解合計約 92%（完全不了解僅 6.5%）」 |
| C24 | 「加 5 則評論購買率 +270%」 | 修正（相關當因果） | 改為「觀察到的購買可能性差距」 |
| C28 | 工具鏈月成本 100–350 美元 | 降級 | 標明「作者估算、2026 年中行情」 |

---

## 來源清單

**創業統計**
[1] Failory — Startup Failure Rate: https://www.failory.com/blog/startup-failure-rate
[2] NanoGlobals — Startup failure rate myths: https://nanoglobals.com/startup-failure-rate-myths-origin/
[3] U.S. BLS Business Employment Dynamics — Establishment age & survival: https://www.bls.gov/bdm/bdmage.htm
[4] LendingTree（BLS 數據分析，2025）: https://www.lendingtree.com/business/small/failure-rate/
[5] 經濟部中小企業署「創業免驚」真相說明: https://www.sme.gov.tw/article-tw-2823-152
[6] 格外農品 Podcast EP8（核對 2017 中小企業白皮書）: https://www.goodwillfoods.com/blogs/podcast/goodwillfoods-podcast-ep8
[7] CB Insights — Why Startups Fail（2025 版）: https://www.cbinsights.com/research/report/startup-failure-reasons-top/
[8] CB Insights — Top 20 Reasons Startups Fail（101 篇 post-mortems）: https://s3-us-west-2.amazonaws.com/cbi-content/research-reports/The-20-Reasons-Startups-Fail.pdf
[9] Startup Genome Report 2011 — Premature Scaling: https://s3.amazonaws.com/startupcompass-public/StartupGenomeReport2_Why_Startups_Fail_v2.pdf
[10] Camuffo et al. 2020, Management Science 66(2): https://pubsonline.informs.org/doi/10.1287/mnsc.2018.3249
[11] Camuffo et al. 2024, Strategic Management Journal（759 家複現）: https://sms.onlinelibrary.wiley.com/doi/full/10.1002/smj.3580
[12] Rob Fitzpatrick — The Mom Test（2013）三原則摘要: https://www.atlantaventures.com/blog/the-3-rules-to-customer-interviews-from-the-mom-test

**AI 市場**
[13] Menlo Ventures — 2025 State of Generative AI in the Enterprise: https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/
[14] McKinsey — The State of AI（2025-11，1,993 受訪）: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai
[15] Sacra — Harvey revenue & valuation: https://sacra.com/c/harvey/
[16] Bessemer — State of AI 2025: https://www.bvp.com/atlas/the-state-of-ai-2025
[17] 工商時報 — 2025 中小企業 AI 運用調查（中小企業署委託工研院）: https://turnnewsapp.com/livenews/finance/20251226003117-260410
[18] TeSA — 2025 中小企業白皮書 AI 段落: https://www.tesa.center/blog/posts/20251227
[19] OECD — AI adoption by SMEs（2025-12）: https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/12/ai-adoption-by-small-and-medium-sized-enterprises_9c48eae6/426399c1-en.pdf
[20] a16z — Top 100 Gen AI Consumer Apps 第 6 版（2026-03）: https://a16z.com/100-gen-ai-apps-6/
[21] TechCrunch — ChatGPT mobile $3B（Appfigures，2025-12-18）: https://techcrunch.com/2025/12/18/chatgpts-mobile-app-hits-new-milestone-of-3b-in-consumer-spending/
[22] Anthropic — Claude Code $1B milestone: https://www.anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone
[23] a16z — Revenue benchmarks for AI apps: https://a16z.com/revenue-benchmarks-ai-apps/

**案例**
[24] TechCrunch — base44 sells to Wix for $80M（2025-06-18）: https://techcrunch.com/2025/06/18/6-month-old-solo-owned-vibe-coder-base44-sells-to-wix-for-80m-cash/
[25] CTech/Calcalist — Shlomo $90M earn-out: https://www.calcalistech.com/ctechnews/article/hjm11dastwl
[26] TechCrunch — Cal AI built by teenagers（2025-03-16）: https://techcrunch.com/2025/03/16/photo-calorie-app-cal-ai-downloaded-over-a-million-times-was-built-by-two-teenagers/
[27] TechCrunch — MyFitnessPal acquires Cal AI（2026-03-02）: https://techcrunch.com/2026/03/02/myfitnesspal-has-acquired-cal-ai-the-viral-calorie-app-built-by-teens/
[28] Indie Hackers/FastSaaS — Pieter Levels 自報數據彙整: https://www.fast-saas.com/blog/pieter-levels-success-story/
[29] Fortune — Altman one-person unicorn（2024-02-04）: https://fortune.com/2024/02/04/sam-altman-one-person-unicorn-silicon-valley-founder-myth/
[30] AI Shortcut Lab — AI tools cost for solo founders（估算）: https://aishortcutlab.com/articles/solo-founders/ai-basics/ai-tools-cost-solo-founders

**台灣公司設立**
[31] 財政部 — 114 年起調高小規模營業人起徵點: https://www.mof.gov.tw/singlehtml/384fb3077bb349ea973e7fc6f13b6974?cntId=4e040848cb7044ce8d2c8540bd628f5f
[32] 公司法（全國法規資料庫）: https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0080001
[33] 經濟部 — 公司與商業及有限合夥一站式線上申請: https://onestop.nat.gov.tw/
[34] WensCo — 2025 有限公司設立 9 步驟（規費/時程/行情）: https://www.meetingtw.com/有限公司設立/
[35] 財報雲 — 2026 公司報稅懶人包: https://blog.statementcloud.tw/corp-tax-guide/
[36] 通人會計師事務所 — 公司行號差別: https://tongrencpa.com/business-registration/proprietorships-and-company

**消費者心理學**
[37] Shampanier, Mazar & Ariely 2007 — Zero as a Special Price: https://web.mit.edu/ariely/www/MIT/Papers/zero.pdf
[38] Simonson & Tversky 1992 — Choice in Context（JMR）: https://cognition.aau.at/bg/BA/Simon%20&%20tversky,%201992.pdf
[39] Anderson & Simester 2003 — $9 Endings（QME 1:93–110）: https://link.springer.com/article/10.1023/A:1023581927405
[40] Brown et al. 2024 — Meta-analysis of loss aversion（JEL，607 筆）: https://www.aeaweb.org/articles?id=10.1257%2Fjel.20221698
[41] Walasek, Mullett & Stewart 2024（JoEP）: https://www.sciencedirect.com/science/article/pii/S0167487024000485
[42] Dan Ariely — Predictably Irrational（Economist 實驗）/ Decoy effect 概述: https://theconversation.com/the-decoy-effect-how-you-are-influenced-to-choose-without-really-knowing-it-111259
[43] Frederick, Lee & Baskin 2014 — The Limits of Attraction（JMR）: https://journals.sagepub.com/doi/abs/10.1509/jmr.12.0061
[44] Spiegel Research Center（Northwestern）— How Online Reviews Influence Sales: https://spiegel.medill.northwestern.edu/how-online-reviews-influence-sales/
[45] Barton, Zlatevska & Oppewal 2022 — Scarcity meta-analysis（J. of Retailing）: https://www.sciencedirect.com/science/article/pii/S0022435922000434
[46] Scheibehenne, Greifeneder & Todd 2010 — Can There Ever Be Too Many Options?: https://academic.oup.com/jcr/article-abstract/37/3/409/1827647
[47] Chernev, Böckenholt & Goodman 2015 — Choice overload meta-analysis: https://myscp.onlinelibrary.wiley.com/doi/abs/10.1016/j.jcps.2014.08.002
[48] NPR — Cornell food researcher's downfall（Wansink）: https://www.npr.org/sections/thesalt/2018/09/26/651849441/cornell-food-researchers-downfall-raises-larger-questions-for-science
