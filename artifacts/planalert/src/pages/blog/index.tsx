import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, User, Tag as TagIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { publicBlog } from "@/lib/blog-api";
import { useMeta } from "@/hooks/use-meta";
import { canonicalUrl } from "@/lib/site";

const PAGE_SIZE = 9;

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogIndex() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useMeta({
    title: "Blog — PlanAlert",
    description:
      "Insights, tips, and updates from PlanAlert on saving money on cell phone, internet, and household plans.",
    canonical: canonicalUrl("/blog"),
    ogType: "website",
  });

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => setPage(1), [search, category]);

  const postsQuery = useQuery({
    queryKey: ["blog-list", { page, search, category }],
    queryFn: () => publicBlog.list({ page, pageSize: PAGE_SIZE, search, category }),
  });
  const catsQuery = useQuery({
    queryKey: ["blog-cats"],
    queryFn: () => publicBlog.categories(),
  });

  const total = postsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = postsQuery.data?.items ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <SiteNav variant="sticky" />
      <main className="flex-1">
        <header className="relative overflow-hidden bg-[#F7F9FC] border-b border-[#E5EAF2]">
          <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#2563FF]/5 blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 md:py-24 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#2563FF] mb-4">
              Blog
            </p>
            <h1 className="font-serif text-[2.5rem] sm:text-5xl md:text-6xl font-bold leading-[1.08] sm:leading-[1.05] tracking-tight text-primary text-balance mb-5 md:mb-6">
              The PlanAlert Blog
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              Guides, updates, and practical advice for keeping your household bills in check.
            </p>
          </div>
        </header>

        <section className="max-w-7xl mx-auto px-6 md:px-12 pt-10 md:pt-12 mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search articles…"
                className="pl-9 h-11 rounded-xl bg-white border-primary/10"
                data-testid="input-blog-search"
              />
            </div>
            {catsQuery.data?.categories?.length ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={category === "" ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setCategory("")}
                  data-testid="filter-cat-all"
                >
                  All
                </Button>
                {catsQuery.data.categories.map((c) => (
                  <Button
                    key={c}
                    variant={category === c ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setCategory(c)}
                    data-testid={`filter-cat-${c}`}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
          {postsQuery.isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border border-primary/5 p-6 animate-pulse h-72" />
              ))}
            </div>
          ) : postsQuery.isError ? (
            <p className="text-muted-foreground">Could not load posts. Try again later.</p>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-serif text-primary mb-2">Nothing here yet.</p>
              <p className="text-muted-foreground">No posts published yet. Check back soon.</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col rounded-2xl bg-white border border-primary/5 shadow-sm hover:shadow-md transition-all overflow-hidden"
                    data-testid={`card-post-${post.slug}`}
                  >
                    {post.featuredImageUrl ? (
                      <div className="aspect-[16/9] overflow-hidden bg-muted">
                        <img
                          src={post.featuredImageUrl}
                          alt={post.featuredImageAlt || post.title}
                          width={1280}
                          height={720}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-gradient-to-br from-[#2563FF]/5 via-[#2563FF]/10 to-primary/10 flex items-center justify-center">
                        <Search className="w-12 h-12 text-[#2563FF]/30" />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      {post.category && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#2563FF] mb-2">
                          {post.category}
                        </span>
                      )}
                      <h2 className="font-serif text-2xl font-bold text-primary mb-3 leading-tight group-hover:text-[#2563FF] transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">{post.excerpt}</p>
                      )}
                      <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
                        {post.author && (
                          <span className="inline-flex items-center gap-1.5">
                            <User className="w-3 h-3" /> {post.author}
                          </span>
                        )}
                        {post.publishDate && (
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" /> {formatDate(post.publishDate)}
                          </span>
                        )}
                      </div>
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {post.tags.slice(0, 3).map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs font-normal">
                              <TagIcon className="w-2.5 h-2.5 mr-1" />
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    data-testid="button-next-page"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
