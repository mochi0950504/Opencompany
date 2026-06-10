import {db, mapRow, mapRows} from '../db.js';
import type {PlaybookRow} from '../types.js';

export const DEFAULT_PLAYBOOK = `# OpenCompany 調研 Playbook v1

## 原則
1. 先拆解再深入：把目標拆成可並行、可驗證的子題。
2. 每個關鍵主張都要可查證：標注來源與口徑（自報／估計／相關性）。
3. 交叉批判：研究產出必須經過另一個模型的對抗式審視才能進入綜合。
4. 誠實優先：寬鬆定義、選擇偏誤、預測 vs 實際，發現就標注。

## 階段指引
- 規劃（planner）：產出 2-4 個子題，各附一個可回答的核心問題。
- 調研（researcher）：每子題列出證據點與信心等級，承認不確定。
- 批判（critic）：逐主張給 support / refute / uncertain 與一行理由。
- 綜合（synthesizer）：以批判結果為準產出報告，弱主張須降級或加註。
- 檢討（retro）：提煉可重用的教訓，提出 playbook 改進與工具需求。`;

export function ensureDefaultPlaybook(): void {
  const count = db.prepare(`SELECT COUNT(*) AS c FROM playbooks`).get() as {c: number};
  if (count.c === 0) {
    db.prepare(
      `INSERT INTO playbooks (name, version, content, rationale, active)
       VALUES ('research-default', 1, ?, '初始版本', 1)`
    ).run(DEFAULT_PLAYBOOK);
  }
}

export function activePlaybook(): PlaybookRow {
  ensureDefaultPlaybook();
  const row = db
    .prepare(`SELECT * FROM playbooks WHERE active = 1 ORDER BY id DESC LIMIT 1`)
    .get();
  return mapRow<PlaybookRow>(row);
}

export function listPlaybooks(): PlaybookRow[] {
  return mapRows<PlaybookRow>(db.prepare(`SELECT * FROM playbooks ORDER BY id DESC`).all());
}

/**
 * Strategy self-evolution: the retro stage proposes an amended playbook.
 * The new version is stored inactive by default; auto-activation is a
 * deliberate opt-in (OC_AUTO_EVOLVE=1) so growth stays auditable.
 */
export function proposePlaybook(content: string, rationale: string): PlaybookRow {
  const current = activePlaybook();
  const autoActivate = process.env.OC_AUTO_EVOLVE === '1';
  const res = db
    .prepare(
      `INSERT INTO playbooks (name, version, content, rationale, active)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(current.name, current.version + 1, content, rationale, autoActivate ? 1 : 0);
  if (autoActivate) {
    db.prepare(`UPDATE playbooks SET active = 0 WHERE id != ?`).run(Number(res.lastInsertRowid));
  }
  return mapRow<PlaybookRow>(
    db.prepare(`SELECT * FROM playbooks WHERE id = ?`).get(Number(res.lastInsertRowid))
  );
}

export function activatePlaybook(id: number): void {
  const tx = db.transaction(() => {
    db.prepare(`UPDATE playbooks SET active = 0`).run();
    db.prepare(`UPDATE playbooks SET active = 1 WHERE id = ?`).run(id);
  });
  tx();
}
