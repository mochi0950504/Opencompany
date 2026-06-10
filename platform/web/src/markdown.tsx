/** 極簡 Markdown 轉換器：標題 / 粗體 / 行內程式碼 / 清單 / 程式碼區塊 / 段落。 */

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

export function markdownToHtml(md: string): string {
  const out: string[] = [];
  const lines = md.split('\n');
  let list: 'ul' | 'ol' | null = null;
  let code = false;
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  for (const raw of lines) {
    if (raw.trimStart().startsWith('```')) {
      closeList();
      out.push(code ? '</code></pre>' : '<pre><code>');
      code = !code;
      continue;
    }
    if (code) {
      out.push(`${escapeHtml(raw)}\n`);
      continue;
    }
    const h = raw.match(/^(#{1,4})\s+(.*)$/);
    const li = raw.match(/^\s*[-*]\s+(.*)$/);
    const ol = raw.match(/^\s*\d+[.)]\s+(.*)$/);
    if (h) {
      closeList();
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
    } else if (li || ol) {
      const kind = li ? 'ul' : 'ol';
      if (list !== kind) {
        closeList();
        out.push(`<${kind}>`);
        list = kind;
      }
      out.push(`<li>${inline((li ?? ol)![1])}</li>`);
    } else if (raw.trim() === '') {
      closeList();
    } else {
      closeList();
      out.push(`<p>${inline(raw)}</p>`);
    }
  }
  if (code) out.push('</code></pre>');
  closeList();
  return out.join('');
}

export function Markdown({source}: {source: string}) {
  return <div className="markdown" dangerouslySetInnerHTML={{__html: markdownToHtml(source)}} />;
}
