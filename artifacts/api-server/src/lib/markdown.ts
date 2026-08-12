/**
 * Strips stray markdown code-fence artifacts that sometimes leak into
 * pasted content (commonly from AI-generated drafts) and would otherwise
 * render as literal backticks in the published HTML.
 *
 * Rules (conservative — legitimate paired inline code is left untouched):
 * 1. Lines consisting solely of backticks (e.g. "``" or "```") are removed.
 * 2. Within a line, if runs of 2+ backticks cannot be paired (odd count),
 *    stray runs at the start/end of the line are stripped.
 */
export function stripMarkdownArtifacts(markdown: string): string {
  return markdown
    .split("\n")
    .filter((line) => !/^\s*`{2,}\s*$/.test(line))
    .map((line) => {
      const runs = line.match(/`{2,}/g);
      if (!runs || runs.length % 2 === 0) return line;
      let out = line.replace(/^(\s*)`{2,}/, "$1");
      if (((out.match(/`{2,}/g) ?? []).length) % 2 === 1) {
        out = out.replace(/`{2,}(\s*)$/, "$1");
      }
      return out;
    })
    .join("\n");
}
