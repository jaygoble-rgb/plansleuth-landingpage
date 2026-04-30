import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { getAllPosts } from "@/data/posts";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <SiteNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-16 md:py-24">
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary mb-3">
            From the editors
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary">
            Blog
          </h1>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col bg-white border border-primary/8 rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="p-8 flex flex-col flex-1">
                <div className="mb-4">
                  <span className="inline-block text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>

                <h2 className="font-serif text-xl font-bold text-primary mb-3 leading-snug group-hover:text-primary/80 transition-colors">
                  {post.title}
                </h2>

                <p className="text-sm text-muted-foreground mb-2">
                  {post.date} &middot; {post.author}
                </p>

                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  {post.excerpt}
                </p>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:gap-3 transition-all"
                >
                  Read more
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
