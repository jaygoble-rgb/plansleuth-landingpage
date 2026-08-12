/**
 * Render-time defense against stray markdown code-fence artifacts
 * (e.g. unpaired "``" left over from pasted AI-generated drafts) that
 * would otherwise appear as literal backticks in the rendered HTML.
 *
 * Mirrors the save-time sanitization in the API server
 * (artifacts/api-server/src/lib/markdown.ts) so that content already
 * stored with artifacts still renders clean. Matched fenced code blocks
 * and paired inline code spans are preserved verbatim.
 */
const FENCE_RE = /^\s*`{3,}[^`]*$/;
const STRAY_DOUBLE_RE = /^\s*`{2}\s*$/;

export function stripMarkdownArtifacts(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (STRAY_DOUBLE_RE.test(line)) {
      i++;
      continue;
    }
    if (FENCE_RE.test(line)) {
      let close = -1;
      for (let j = i + 1; j < lines.length; j++) {
        if (/^\s*`{3,}\s*$/.test(lines[j])) {
          close = j;
          break;
        }
      }
      if (close !== -1) {
        for (let j = i; j <= close; j++) out.push(lines[j]);
        i = close + 1;
      } else {
        i++;
      }
      continue;
    }
    const runs = line.match(/`{2,}/g);
    if (!runs || runs.length % 2 === 0) {
      out.push(line);
    } else {
      let cleaned = line.replace(/^(\s*)`{2,}/, "$1");
      if (((cleaned.match(/`{2,}/g) ?? []).length) % 2 === 1) {
        cleaned = cleaned.replace(/`{2,}(\s*)$/, "$1");
      }
      out.push(cleaned);
    }
    i++;
  }
  return out.join("\n");
}
