import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { getPostBySlug, type ContentBlock } from "@/data/posts";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case "p":
      return (
        <p key={index} className="text-lg text-foreground leading-relaxed mb-6">
          {block.text}
        </p>
      );
    case "h2":
      return (
        <h2
          key={index}
          className="font-serif text-2xl md:text-3xl font-bold text-primary mt-12 mb-4"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3
          key={index}
          className="font-serif text-xl font-bold text-primary mt-8 mb-3"
        >
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul key={index} className="mb-6 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-lg text-foreground leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={index} className="mb-6 space-y-2 list-decimal list-inside">
          {block.items.map((item, i) => (
            <li key={i} className="text-lg text-foreground leading-relaxed pl-2">
              {item}
            </li>
          ))}
        </ol>
      );
    case "faq":
      return (
        <div key={index} className="mb-6 p-6 bg-primary/4 border border-primary/10 rounded-xl">
          <p className="font-semibold text-primary mb-2">{block.q}</p>
          <p className="text-muted-foreground leading-relaxed">{block.a}</p>
        </div>
      );
    default:
      return null;
  }
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug ?? "");

  useEffect(() => {
    if (post) {
      document.title = post.metaTitle;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        (metaDesc as HTMLMetaElement).name = "description";
        document.head.appendChild(metaDesc);
      }
      (metaDesc as HTMLMetaElement).content = post.metaDescription;
    }
    return () => {
      document.title = "PlanAlert";
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
        <SiteNav />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-4">404</p>
            <h1 className="font-serif text-4xl font-bold text-primary mb-4">Post not found</h1>
            <p className="text-muted-foreground mb-8">
              This article doesn't exist or may have moved.
            </p>
            <Link href="/blog" className="inline-flex items-center gap-2 text-secondary font-semibold hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Back to all posts
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <SiteNav />

      <main className="flex-1 w-full">
        {/* Article header */}
        <div className="max-w-3xl mx-auto px-6 md:px-12 pt-10 pb-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all posts
          </Link>

          <div className="mb-5">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
              {post.category}
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-10 pb-10 border-b border-primary/10">
            <span className="font-medium text-primary">{post.author}</span>
            <span>&middot;</span>
            <span>{post.date}</span>
          </div>
        </div>

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-6 md:px-12 pb-20">
          {post.content.map((block, i) => renderBlock(block, i))}

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-primary/10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
