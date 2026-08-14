import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { stripMarkdownArtifacts } from "@/lib/markdown-clean";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-secondary prose-strong:text-primary prose-img:rounded-xl">
      {/* rehype-raw parses raw HTML embedded in the markdown (e.g. inline
          <svg> illustrations) instead of escaping it. Blog content is
          admin-authored only; if untrusted authors are ever added, pair
          this with rehype-sanitize. */}
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {stripMarkdownArtifacts(children)}
      </ReactMarkdown>
    </div>
  );
}
