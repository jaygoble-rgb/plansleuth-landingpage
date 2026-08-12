/**
 * Strips stray markdown code-fence artifacts that sometimes leak into
 * pasted content (commonly from AI-generated drafts) and would otherwise
 * render as literal backticks in the published HTML.
 *
 * Rules (conservative — legitimate markdown is left untouched):
 * 1. Matched fenced code blocks (``` / ~~~-style, optionally with a
 *    language tag) are preserved verbatim, contents included.
 * 2. An unmatched fence delimiter line, or a line consisting solely of
 *    exactly two backticks (never valid markdown), is removed.
 * 3. Within an ordinary line, runs of 2+ backticks that cannot be paired
 *    (odd count) have stray runs at the start/end of the line stripped.
 *    Paired inline code spans are untouched.
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
      // Look for a closing fence; if found, keep the whole block verbatim.
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
        // Unmatched fence delimiter — stray artifact, drop it.
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
