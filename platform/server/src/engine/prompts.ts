import type {TaskConfig} from '../types.js';

export function basePreamble(opts: {
  memberName: string;
  role: string;
  playbook: string;
  memoryBlock: string;
  config: TaskConfig;
}): string {
  const parts = [
    `你是 OpenCompany 多模型調研小組的成員「${opts.memberName}」，目前角色：${opts.role}。`,
    `小組由最多 4 個不同的 AI 模型組成，彼此的產出會被其他模型批判與引用——請輸出可被同儕檢驗的內容，標注不確定性。`,
    `# 工作守則（Playbook）\n${opts.playbook}`,
  ];
  if (opts.memoryBlock) parts.push(opts.memoryBlock);
  if (opts.config.instructions) parts.push(`# 使用者額外指示\n${opts.config.instructions}`);
  return parts.join('\n\n');
}

export function plannerPrompt(goal: string, breadth: number): string {
  return [
    `調研目標：\n${goal}`,
    ``,
    `請把目標拆解為 ${breadth} 個可並行調研的子題（subtopics），每個子題附一個核心問題。`,
    `同時用一段話說明整體調研方法（approach）。`,
    `只輸出 JSON 物件：{"subtopics":[{"title":"...","question":"..."}],"approach":"..."}`,
  ].join('\n');
}

export function researcherPrompt(goal: string, subtopic: {title: string; question: string}): string {
  return [
    `總目標：${goal}`,
    `你負責的子題：${subtopic.title}`,
    `核心問題：${subtopic.question}`,
    ``,
    `請進行調研並輸出：`,
    `1. 證據點清單（每點標注來源或推理依據，與信心等級 高/中/低）`,
    `2. 主要結論（2-3 句）`,
    `3. 未解的疑問`,
    `可以使用提供的工具（搜尋知識庫、抓取網頁、存入發現）。先搜知識庫避免重工。`,
  ].join('\n');
}

export function criticPrompt(goal: string, researchOutputs: {title: string; content: string}[]): string {
  const blocks = researchOutputs
    .map((r, i) => `### 子題 ${i + 1}：${r.title}\n${r.content}`)
    .join('\n\n');
  return [
    `總目標：${goal}`,
    ``,
    `以下是其他模型的調研產出，請對抗式批判：找出最關鍵的主張，逐條判定。`,
    blocks,
    ``,
    `只輸出 JSON 物件：`,
    `{"verdicts":[{"claim":"...","verdict":"support|refute|uncertain","note":"一行理由"}],"overall":"整體評語，指出必須修正或降級的部分"}`,
  ].join('\n');
}

export function synthesizerPrompt(
  goal: string,
  researchOutputs: {title: string; content: string}[],
  critique: string
): string {
  const blocks = researchOutputs
    .map((r, i) => `### 子題 ${i + 1}：${r.title}\n${r.content}`)
    .join('\n\n');
  return [
    `總目標：${goal}`,
    ``,
    `## 調研產出`,
    blocks,
    ``,
    `## 批判結果（必須遵守：被 refute 的主張不得採用，uncertain 的須加註）`,
    critique,
    ``,
    `請產出最終調研報告（Markdown）：含主要發現（附信心標注）、反方觀點、建議下一步。`,
    `報告開頭用一段 TL;DR。誠實呈現不確定性。`,
  ].join('\n');
}

export function retroPrompt(goal: string, report: string): string {
  return [
    `任務目標：${goal}`,
    ``,
    `最終報告：\n${report.slice(0, 6000)}`,
    ``,
    `請做任務檢討（retro），輸出 JSON 物件：`,
    `{`,
    `  "lessons": [{"title":"...","content":"可重用的教訓或發現"}],`,
    `  "playbook_suggestion": "對工作守則的具體改進建議（沒有就給 null）",`,
    `  "tool_proposal": {"name":"snake_case名","description":"...","parameters":{JSON Schema},"code":"async JS 函式本體，可用 fetch 與 memory.search/save，return 字串"} 或 null`,
    `}`,
    `教訓要具體到能幫助下一次任務；不要泛泛而談。`,
  ].join('\n');
}
