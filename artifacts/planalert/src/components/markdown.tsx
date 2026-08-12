import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { stripMarkdownArtifacts } from "@/lib/markdown-clean";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-secondary prose-strong:text-primary prose-img:rounded-xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {stripMarkdownArtifacts(children)}
      </ReactMarkdown>
    </div>
  );
}
