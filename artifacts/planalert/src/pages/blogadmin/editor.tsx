import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Eye,
  ArrowLeft,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  Quote,
  Code,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AdminShell, AdminGuard } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Markdown } from "@/components/markdown";
import { adminBlog, type BlogPost } from "@/lib/blog-api";

type Editable = Partial<BlogPost> & { title: string };

const EMPTY: Editable = {
  title: "",
  slug: "",
  body: "",
  excerpt: "",
  featuredImageUrl: "",
  featuredImageAlt: "",
  author: "",
  category: "",
  tags: [],
  status: "draft",
  publishDate: null,
  scheduledPublishAt: null,
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  openGraphImageUrl: "",
  commentsEnabled: false,
};

function toLocalInput(d: string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  const tz = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tz).toISOString().slice(0, 16);
}
function fromLocalInput(s: string): string | null {
  if (!s) return null;
  return new Date(s).toISOString();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function EditorInner() {
  const params = useParams<{ id?: string }>();
  const [location, navigate] = useLocation();
  const qc = useQueryClient();
  const isNew = !params.id;
  const id = params.id;

  const [post, setPost] = useState<Editable>(EMPTY);
  const [savedPost, setSavedPost] = useState<Editable | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const existingQuery = useQuery({
    queryKey: ["admin-post", id],
    queryFn: () => adminBlog.get(id!),
    enabled: !isNew,
    retry: false,
  });

  useEffect(() => {
    if (existingQuery.data) {
      setPost(existingQuery.data);
      setSavedPost(existingQuery.data);
      setTagsInput((existingQuery.data.tags ?? []).join(", "));
      setSlugTouched(true);
    }
  }, [existingQuery.data]);

  // Auto-slug from title for new posts
  useEffect(() => {
    if (isNew && !slugTouched && post.title) {
      setPost((p) => ({ ...p, slug: slugify(p.title) }));
    }
  }, [post.title, isNew, slugTouched]);

  const createMut = useMutation({
    mutationFn: (data: Partial<BlogPost>) => adminBlog.create(data),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["admin-blog-list"] });
      qc.setQueryData(["admin-post", created.id], created);
      setSavedPost(created);
      setPost(created);
      setAutosaveState("saved");
      navigate(`/blogadmin/edit/${created.id}`, { replace: true });
    },
    onError: (e: unknown) => {
      setAutosaveState("error");
      setErrorMsg(e instanceof Error ? e.message : "Save failed");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogPost> }) => adminBlog.update(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["admin-blog-list"] });
      qc.setQueryData(["admin-post", updated.id], updated);
      setSavedPost(updated);
      setAutosaveState("saved");
      setErrorMsg(null);
    },
    onError: (e: unknown) => {
      setAutosaveState("error");
      setErrorMsg(e instanceof Error ? e.message : "Save failed");
    },
  });

  // Build payload for save
  function buildPayload(): Partial<BlogPost> {
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    return {
      title: post.title,
      slug: post.slug || slugify(post.title || ""),
      body: post.body ?? "",
      excerpt: post.excerpt ?? "",
      featuredImageUrl: post.featuredImageUrl ?? "",
      featuredImageAlt: post.featuredImageAlt ?? "",
      author: post.author ?? "",
      category: post.category ?? "",
      tags,
      status: post.status,
      publishDate: post.publishDate ?? null,
      scheduledPublishAt: post.scheduledPublishAt ?? null,
      metaTitle: post.metaTitle ?? "",
      metaDescription: post.metaDescription ?? "",
      canonicalUrl: post.canonicalUrl ?? "",
      openGraphImageUrl: post.openGraphImageUrl ?? "",
      commentsEnabled: !!post.commentsEnabled,
    } as Partial<BlogPost>;
  }

  // Autosave (only for existing posts; require a title).
  // Compare only the editable payload fields so server-managed fields like
  // updatedAt/updatedBy don't trip the dirty check into an autosave loop.
  const isDirty = useMemo(() => {
    if (!savedPost) return !!(post.title || post.body);
    const editableKeys: (keyof BlogPost)[] = [
      "title",
      "slug",
      "body",
      "excerpt",
      "featuredImageUrl",
      "featuredImageAlt",
      "author",
      "category",
      "status",
      "publishDate",
      "scheduledPublishAt",
      "metaTitle",
      "metaDescription",
      "canonicalUrl",
      "openGraphImageUrl",
      "commentsEnabled",
    ];
    const norm = (p: Editable, tags: string[]) => {
      const o: Record<string, unknown> = { tags };
      for (const k of editableKeys) {
        const val = (p as Partial<BlogPost>)[k];
        o[k as string] = val ?? (typeof val === "boolean" ? false : "");
      }
      return JSON.stringify(o);
    };
    const liveTags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    return norm(post, liveTags) !== norm(savedPost, savedPost.tags ?? []);
  }, [post, savedPost, tagsInput]);

  useEffect(() => {
    if (isNew) return;
    if (!id) return;
    if (!isDirty) return;
    if (!post.title) return;
    setAutosaveState("saving");
    const t = setTimeout(() => {
      updateMut.mutate({ id, data: buildPayload() });
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, tagsInput, isDirty, id, isNew]);

  function handleSave() {
    if (!post.title.trim()) {
      setErrorMsg("Title is required");
      setAutosaveState("error");
      return;
    }
    setErrorMsg(null);
    setAutosaveState("saving");
    if (isNew) {
      createMut.mutate(buildPayload());
    } else if (id) {
      updateMut.mutate({ id, data: buildPayload() });
    }
  }

  function handleStatusAction(newStatus: BlogPost["status"]) {
    setPost((p) => ({ ...p, status: newStatus }));
    // trigger save shortly
    setTimeout(() => {
      const payload = { ...buildPayload(), status: newStatus };
      if (isNew) createMut.mutate(payload);
      else if (id) updateMut.mutate({ id, data: payload });
    }, 50);
  }

  function insertMd(before: string, after = "") {
    const ta = bodyRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const value = post.body ?? "";
    const selected = value.slice(start, end);
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    setPost((p) => ({ ...p, body: newValue }));
    requestAnimationFrame(() => {
      ta.focus();
      const cursor = start + before.length + selected.length + after.length;
      ta.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <AdminShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/blogadmin"><ArrowLeft className="w-4 h-4 mr-1.5" /> Back</Link>
          </Button>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary truncate max-w-md">
            {post.title || (isNew ? "New post" : "Untitled")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5 mr-2" data-testid="text-autosave">
            {autosaveState === "saving" && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>}
            {autosaveState === "saved" && <><CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> Saved</>}
            {autosaveState === "error" && <><AlertCircle className="w-3.5 h-3.5 text-destructive" /> {errorMsg || "Error"}</>}
          </span>
          {!isNew && post.status === "published" && (
            <Button asChild variant="outline" size="sm">
              <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" data-testid="button-view-live">
                <Eye className="w-4 h-4 mr-1.5" /> View live
              </a>
            </Button>
          )}
          <Button onClick={handleSave} className="rounded-xl" data-testid="button-save">
            <Save className="w-4 h-4 mr-1.5" /> Save
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-primary/10 rounded-2xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-secondary mb-4">Content</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={post.title}
                  onChange={(e) => setPost((p) => ({ ...p, title: e.target.value }))}
                  className="mt-1.5 text-lg"
                  data-testid="input-title"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <div className="flex gap-2 items-center mt-1.5">
                  <span className="text-sm text-muted-foreground">/blog/</span>
                  <Input
                    id="slug"
                    value={post.slug ?? ""}
                    onChange={(e) => { setSlugTouched(true); setPost((p) => ({ ...p, slug: e.target.value })); }}
                    onBlur={(e) => setPost((p) => ({ ...p, slug: slugify(e.target.value) }))}
                    data-testid="input-slug"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={post.excerpt ?? ""}
                  onChange={(e) => setPost((p) => ({ ...p, excerpt: e.target.value }))}
                  rows={2}
                  className="mt-1.5"
                  data-testid="input-excerpt"
                />
              </div>

              <div>
                <Label>Body</Label>
                <Tabs defaultValue="write" className="mt-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <TabsList>
                      <TabsTrigger value="write">Write</TabsTrigger>
                      <TabsTrigger value="preview" data-testid="tab-preview">Preview</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-1 border border-input rounded-md p-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertMd("**", "**")} title="Bold"><Bold className="w-3.5 h-3.5" /></Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertMd("*", "*")} title="Italic"><Italic className="w-3.5 h-3.5" /></Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertMd("\n# ", "")} title="H1"><Heading1 className="w-3.5 h-3.5" /></Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertMd("\n## ", "")} title="H2"><Heading2 className="w-3.5 h-3.5" /></Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertMd("[", "](https://)")} title="Link"><LinkIcon className="w-3.5 h-3.5" /></Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertMd("![alt](", ")")} title="Image"><ImageIcon className="w-3.5 h-3.5" /></Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertMd("\n- ", "")} title="List"><List className="w-3.5 h-3.5" /></Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertMd("\n> ", "")} title="Quote"><Quote className="w-3.5 h-3.5" /></Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => insertMd("`", "`")} title="Code"><Code className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  <TabsContent value="write" className="mt-3">
                    <Textarea
                      ref={bodyRef}
                      value={post.body ?? ""}
                      onChange={(e) => setPost((p) => ({ ...p, body: e.target.value }))}
                      rows={20}
                      className="font-mono text-sm"
                      placeholder="Write your post in markdown…"
                      data-testid="input-body"
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-3 min-h-[200px] border border-primary/10 rounded-xl p-6 bg-white">
                    <Markdown>{post.body || "_Nothing to preview yet._"}</Markdown>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </section>

          <section className="bg-white border border-primary/10 rounded-2xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-secondary mb-4">SEO</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input id="metaTitle" value={post.metaTitle ?? ""} onChange={(e) => setPost((p) => ({ ...p, metaTitle: e.target.value }))} className="mt-1.5" data-testid="input-meta-title" />
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea id="metaDescription" value={post.metaDescription ?? ""} onChange={(e) => setPost((p) => ({ ...p, metaDescription: e.target.value }))} rows={2} className="mt-1.5" data-testid="input-meta-desc" />
              </div>
              <div>
                <Label htmlFor="canonical">Canonical URL</Label>
                <Input id="canonical" value={post.canonicalUrl ?? ""} onChange={(e) => setPost((p) => ({ ...p, canonicalUrl: e.target.value }))} className="mt-1.5" placeholder="https://…" data-testid="input-canonical" />
              </div>
              <div>
                <Label htmlFor="ogImage">Open Graph Image URL</Label>
                <Input id="ogImage" value={post.openGraphImageUrl ?? ""} onChange={(e) => setPost((p) => ({ ...p, openGraphImageUrl: e.target.value }))} className="mt-1.5" placeholder="https://…" data-testid="input-og-image" />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="bg-white border border-primary/10 rounded-2xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-secondary mb-4">Publishing</h2>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={post.status} onValueChange={(v) => setPost((p) => ({ ...p, status: v as BlogPost["status"] }))}>
                  <SelectTrigger className="mt-1.5" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {post.status === "scheduled" && (
                <div>
                  <Label htmlFor="schedAt">Publish at</Label>
                  <Input
                    id="schedAt"
                    type="datetime-local"
                    value={toLocalInput(post.scheduledPublishAt)}
                    onChange={(e) => setPost((p) => ({ ...p, scheduledPublishAt: fromLocalInput(e.target.value) }))}
                    className="mt-1.5"
                    data-testid="input-scheduled-at"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Will go live automatically.</p>
                </div>
              )}
              {post.status === "published" && (
                <div>
                  <Label htmlFor="pubDate">Publish date</Label>
                  <Input
                    id="pubDate"
                    type="datetime-local"
                    value={toLocalInput(post.publishDate)}
                    onChange={(e) => setPost((p) => ({ ...p, publishDate: fromLocalInput(e.target.value) }))}
                    className="mt-1.5"
                    data-testid="input-publish-date"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {post.status !== "published" && (
                  <Button onClick={() => handleStatusAction("published")} className="w-full" data-testid="button-publish">Publish now</Button>
                )}
                {post.status === "published" && (
                  <Button onClick={() => handleStatusAction("archived")} variant="outline" className="w-full" data-testid="button-archive">Archive</Button>
                )}
                {post.status !== "draft" && (
                  <Button onClick={() => handleStatusAction("draft")} variant="ghost" className="w-full" data-testid="button-unpublish">Move to draft</Button>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                <Label htmlFor="commentsEnabled" className="text-sm">Comments enabled</Label>
                <Switch
                  id="commentsEnabled"
                  checked={!!post.commentsEnabled}
                  onCheckedChange={(v) => setPost((p) => ({ ...p, commentsEnabled: v }))}
                  data-testid="switch-comments"
                />
              </div>

              {!isNew && (
                <div className="text-xs text-muted-foreground pt-2 border-t border-primary/5 space-y-1">
                  <div>Created: {savedPost?.createdAt ? new Date(savedPost.createdAt).toLocaleString() : "—"}</div>
                  <div>Updated: {savedPost?.updatedAt ? new Date(savedPost.updatedAt).toLocaleString() : "—"}</div>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white border border-primary/10 rounded-2xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-secondary mb-4">Media</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="featured">Featured Image URL</Label>
                <Input id="featured" value={post.featuredImageUrl ?? ""} onChange={(e) => setPost((p) => ({ ...p, featuredImageUrl: e.target.value }))} className="mt-1.5" placeholder="https://…" data-testid="input-featured-image" />
                {post.featuredImageUrl && (
                  <img src={post.featuredImageUrl} alt="" className="mt-2 w-full aspect-[16/9] object-cover rounded-lg border border-primary/10" />
                )}
              </div>
              <div>
                <Label htmlFor="featuredAlt">Alt Text</Label>
                <Input id="featuredAlt" value={post.featuredImageAlt ?? ""} onChange={(e) => setPost((p) => ({ ...p, featuredImageAlt: e.target.value }))} className="mt-1.5" data-testid="input-featured-alt" />
              </div>
            </div>
          </section>

          <section className="bg-white border border-primary/10 rounded-2xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-secondary mb-4">Metadata</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={post.author ?? ""} onChange={(e) => setPost((p) => ({ ...p, author: e.target.value }))} className="mt-1.5" data-testid="input-author" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={post.category ?? ""} onChange={(e) => setPost((p) => ({ ...p, category: e.target.value }))} className="mt-1.5" data-testid="input-category" />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="mt-1.5" placeholder="tips, savings, internet" data-testid="input-tags" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

export default function BlogAdminEditor() {
  return (
    <AdminGuard>
      <EditorInner />
    </AdminGuard>
  );
}
