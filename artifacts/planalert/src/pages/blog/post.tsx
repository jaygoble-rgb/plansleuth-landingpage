import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, Tag as TagIcon } from "lucide-react";
import { PostByline } from "@/components/post-byline";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { publicBlog } from "@/lib/blog-api";
import { Markdown } from "@/components/markdown";
import { useMeta } from "@/hooks/use-meta";
import { canonicalUrl } from "@/lib/site";
import { blogPostingJsonLd, blogPostBreadcrumbJsonLd } from "@/lib/json-ld";

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const slug = params.slug;
  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => publicBlog.get(slug),
    retry: false,
  });

  const url = post ? canonicalUrl(`/blog/${post.slug}`) : undefined;

  useMeta({
    title: post ? (post.metaTitle || `${post.title} — PlanAlert Blog`) : "Loading…",
    description: post?.metaDescription || post?.excerpt || undefined,
    canonical: post?.canonicalUrl || url,
    ogTitle: post?.metaTitle || post?.title,
    ogDescription: post?.metaDescription || post?.excerpt,
    ogImage: post?.openGraphImageUrl || post?.featuredImageUrl || undefined,
    ogType: "article",
    jsonLd: post ? [blogPostingJsonLd(post), blogPostBreadcrumbJsonLd(post)] : null,
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <SiteNav variant="sticky" />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 md:px-12 pt-10 pb-20">
          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
            data-testid="button-back-to-blog"
          >
            <ChevronLeft className="w-4 h-4" /> Back to all posts
          </button>

          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-12 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="aspect-[16/9] bg-muted rounded-2xl" />
            </div>
          )}

          {isError && (
            <div className="text-center py-20">
              <h1 className="font-serif text-4xl text-primary mb-4">Post not found</h1>
              <p className="text-muted-foreground mb-6">
                {(error as Error)?.message || "We couldn't find this post."}
              </p>
              <Link href="/blog" className="text-[#2563FF] font-medium hover:underline">
                Back to all posts
              </Link>
            </div>
          )}

          {post && (
            <article>
              <header className="mb-10">
                {post.category && (
                  <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#2563FF] mb-4">
                    {post.category}
                  </span>
                )}
                <h1 className="font-serif text-[2.5rem] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-[1.08] sm:leading-tight tracking-tight text-balance mb-6">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <PostByline author={post.author} credential={post.authorCredential} />
                  {post.publishDate && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> {formatDate(post.publishDate)}
                    </span>
                  )}
                </div>
              </header>

              {post.featuredImageUrl && (
                <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-muted">
                  <img
                    src={post.featuredImageUrl}
                    alt={post.featuredImageAlt || post.title}
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {post.body ? (
                <Markdown>{post.body}</Markdown>
              ) : (
                <p className="text-muted-foreground italic">This post has no content yet.</p>
              )}

              {post.tags?.length > 0 && (
                <div className="mt-12 pt-8 border-t border-primary/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground mr-2">Tags:</span>
                    {post.tags.map((t) => (
                      <Badge key={t} variant="secondary">
                        <TagIcon className="w-3 h-3 mr-1" />
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
