import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { stripMarkdownArtifacts } from "@/lib/markdown-clean";

// Extends the default (GitHub-style) sanitize schema to also allow the
// inline <svg> charts and <figure> blocks used in blog posts. Anything not
// listed here (e.g. <script>, <iframe>, event handlers like onclick) is
// stripped. Note: <style> inside SVGs is allowed for chart theming — it's
// a CSS-injection vector, so keep authorship trusted (admin-only).
const schema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "figure",
    "figcaption",
    "svg",
    "title",
    "desc",
    "style",
    "g",
    "rect",
    "circle",
    "ellipse",
    "line",
    "polyline",
    "polygon",
    "path",
    "text",
    "tspan",
    "defs",
    "linearGradient",
    "stop",
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": [
      ...(defaultSchema.attributes?.["*"] ?? []),
      "className",
      "role",
      "ariaLabelledBy",
      "ariaHidden",
    ],
    svg: ["viewBox", "xmlns", "width", "height", "fill", "stroke", "preserveAspectRatio"],
    g: ["fill", "stroke", "transform"],
    rect: ["x", "y", "width", "height", "rx", "ry", "fill", "stroke", "strokeWidth", "transform"],
    circle: ["cx", "cy", "r", "fill", "stroke", "strokeWidth"],
    ellipse: ["cx", "cy", "rx", "ry", "fill", "stroke"],
    line: ["x1", "y1", "x2", "y2", "stroke", "strokeWidth", "strokeDasharray"],
    polyline: ["points", "fill", "stroke", "strokeWidth"],
    polygon: ["points", "fill", "stroke"],
    path: ["d", "fill", "stroke", "strokeWidth", "strokeLinecap", "strokeLinejoin", "transform"],
    text: ["x", "y", "dx", "dy", "fill", "textAnchor", "fontSize", "fontWeight", "transform"],
    tspan: ["x", "y", "dx", "dy", "fill"],
    linearGradient: ["x1", "y1", "x2", "y2", "gradientUnits"],
    stop: ["offset", "stopColor", "stopOpacity"],
  },
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-secondary prose-strong:text-primary prose-img:rounded-xl">
      {/* rehype-raw parses raw HTML embedded in the markdown (e.g. inline
          <svg> charts) instead of escaping it; rehype-sanitize then strips
          anything outside the allowlisted schema above. Order matters:
          sanitize must run after raw. */}
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}>
        {stripMarkdownArtifacts(children)}
      </ReactMarkdown>
    </div>
  );
}
