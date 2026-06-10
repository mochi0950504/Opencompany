import type {ChatRequest, ChatResponse, ModelInfo} from '../types.js';
import type {Provider} from './base.js';

/**
 * Deterministic offline provider so the whole platform can be exercised
 * end-to-end without any API key. Each persona produces plausible,
 * structured output for the stage it is asked to perform.
 */
const PERSONAS = ['alpha', 'beta', 'gamma', 'delta'];

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export class MockProvider implements Provider {
  readonly kind = 'mock' as const;

  available(): boolean {
    return true;
  }

  async listModels(): Promise<ModelInfo[]> {
    return PERSONAS.map((id) => ({
      ref: `mock/${id}`,
      provider: 'mock',
      id,
      label: `mock-${id} (offline)`,
      available: true,
    }));
  }

  async chat(modelId: string, req: ChatRequest): Promise<ChatResponse> {
    await new Promise((r) => setTimeout(r, 150 + Math.random() * 350));
    const lastUser = [...req.messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    const input = req.messages.map((m) => m.content).join('\n');

    let content: string;
    if (req.json && lastUser.includes('"subtopics"')) {
      content = JSON.stringify({
        subtopics: [
          {title: '市場規模與付費驗證', question: '這個領域目前實際付費的市場有多大？'},
          {title: '競品與替代方案', question: '現有玩家是誰？使用者現在怎麼解決？'},
          {title: '技術可行性與成本', question: '實作的關鍵障礙與成本結構是什麼？'},
        ].slice(0, 3),
        approach: `mock-${modelId} 規劃：拆解為三個可並行子題，各自蒐集證據後交叉批判。`,
      });
    } else if (req.json && lastUser.includes('"verdicts"')) {
      content = JSON.stringify({
        verdicts: [
          {claim: '主張 1', verdict: 'support', note: '與多個來源一致'},
          {claim: '主張 2', verdict: 'uncertain', note: '僅單一來源，建議標注'},
        ],
        overall: `mock-${modelId} 批判：整體可信，但兩處需要加註資料口徑。`,
      });
    } else if (req.json && lastUser.includes('"lessons"')) {
      content = JSON.stringify({
        lessons: [
          {
            title: '並行子題以 3 個為宜',
            content: 'mock 環境下更多子題沒有增益，徒增 token。真實任務應依預算調整 breadth。',
          },
        ],
        playbook_suggestion: '在批判階段加入「資料口徑檢查」清單（自報/估計/相關性逐一確認）。',
        tool_proposal: {
          name: 'text_stats',
          description: '計算文字的長度與行數，協助控制輸出篇幅。',
          parameters: {
            type: 'object',
            properties: {text: {type: 'string'}},
            required: ['text'],
          },
          code: "const t = String(args.text ?? ''); return `chars=${t.length} lines=${t.split('\\n').length}`;",
        },
      });
    } else if (/最終調研報告|綜合最終/.test(lastUser)) {
      content = [
        `# 調研綜合報告（mock-${modelId}）`,
        '',
        `## 任務`,
        lastUser.slice(0, 200),
        '',
        '## 主要發現',
        '1. （離線示範輸出）市場存在明確付費需求，但集中於少數垂直場景。',
        '2. 競品多為單模型方案，多模型交叉驗證是差異化機會。',
        '3. 成本主要落在長時推理；以檢查點與預算護欄控制。',
        '',
        '## 建議下一步',
        '- 接上真實模型金鑰後重跑本任務以取得實質內容。',
      ].join('\n');
    } else {
      content = [
        `（mock-${modelId} 調研輸出）針對「${lastUser.slice(0, 120)}」：`,
        '- 證據 A：示範性發現，標注為離線生成。',
        '- 證據 B：第二條示範性發現。',
        '- 信心：中。建議以真實模型覆核。',
      ].join('\n');
    }

    return {
      content,
      toolCalls: [],
      usage: {inputTokens: estimateTokens(input), outputTokens: estimateTokens(content)},
    };
  }
}
