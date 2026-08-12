/**
 * Render-time defense against stray markdown code-fence artifacts
 * (e.g. unpaired "``" left over from pasted AI-generated drafts) that
 * would otherwise appear as literal backticks in the rendered HTML.
 *
 * Mirrors the save-time sanitization in the API server
 * (artifacts/api-server/src/lib/markdown.ts) so that content already
 * stored with artifacts still renders clean.
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
