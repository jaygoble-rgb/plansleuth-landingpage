import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db, blogPostsTable, type InsertBlogPost } from "@workspace/db";
import { requireAdmin, type AuthedRequest } from "../lib/auth";
import { isSlugAvailable, slugify } from "../lib/blog";
import { stripMarkdownArtifacts } from "../lib/markdown";

const router: IRouter = Router();

router.use("/admin/blog", requireAdmin);

const STATUSES = ["draft", "published", "scheduled", "archived"] as const;
type Status = (typeof STATUSES)[number];

type PostFields = Partial<Omit<InsertBlogPost, "id" | "createdAt" | "updatedAt">>;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function errorMessage(err: unknown, fallback = "bad request"): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

function parseDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

const STRING_FIELDS = [
  "title",
  "body",
  "excerpt",
  "featuredImageUrl",
  "featuredImageAlt",
  "author",
  "authorCredential",
  "category",
  "metaTitle",
  "metaDescription",
  "canonicalUrl",
  "openGraphImageUrl",
] as const satisfies readonly (keyof PostFields)[];

function pickFields(rawBody: unknown, isCreate: boolean): PostFields {
  const body: Record<string, unknown> = isRecord(rawBody) ? rawBody : {};
  const out: PostFields = {};
  for (const f of STRING_FIELDS) {
    if (body[f] !== undefined) {
      out[f] = String(body[f] ?? "");
    }
  }
  if (out.body !== undefined) {
    out.body = stripMarkdownArtifacts(out.body);
  }
  if (body.tags !== undefined) {
    out.tags = Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim()).filter(Boolean)
      : [];
  }
  if (body.commentsEnabled !== undefined) {
    out.commentsEnabled = Boolean(body.commentsEnabled);
  }
  if (body.status !== undefined) {
    const s = String(body.status);
    if (!STATUSES.includes(s as Status)) throw new Error("invalid status");
    out.status = s as Status;
  }
  if (body.publishDate !== undefined) out.publishDate = parseDate(body.publishDate);
  if (body.scheduledPublishAt !== undefined) {
    out.scheduledPublishAt = parseDate(body.scheduledPublishAt);
  }
  if (out.status === "scheduled" && !out.scheduledPublishAt) {
    throw new Error("scheduledPublishAt is required when status is 'scheduled'");
  }
  if (isCreate && typeof body.title === "string" && !body.slug) {
    out.slug = slugify(body.title);
  }
  if (body.slug !== undefined) {
    const s = slugify(String(body.slug));
    if (!s) throw new Error("invalid slug");
    out.slug = s;
  }
  return out;
}

router.get("/admin/blog/posts", async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "25"), 10) || 25));
  const status = String(req.query.status ?? "").trim();
  const search = String(req.query.search ?? "").trim();
  const author = String(req.query.author ?? "").trim();
  const category = String(req.query.category ?? "").trim();

  const filters: SQL[] = [];
  if (status && STATUSES.includes(status as Status)) {
    filters.push(eq(blogPostsTable.status, status as Status));
  }
  if (author) filters.push(eq(blogPostsTable.author, author));
  if (category) filters.push(eq(blogPostsTable.category, category));
  if (search) {
    const like = `%${search}%`;
    const cond = or(
      ilike(blogPostsTable.title, like),
      ilike(blogPostsTable.slug, like),
      ilike(blogPostsTable.excerpt, like),
    );
    if (cond) filters.push(cond);
  }

  const where: SQL | undefined = filters.length > 0 ? and(...filters) : undefined;

  const [items, totalRow] = await Promise.all([
    db
      .select()
      .from(blogPostsTable)
      .where(where)
      .orderBy(desc(blogPostsTable.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(blogPostsTable).where(where),
  ]);

  res.json({ items, page, pageSize, total: totalRow[0]?.count ?? 0 });
});

router.get("/admin/blog/posts/:id", async (req, res) => {
  const id = String(req.params.id);
  const rows = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
  if (rows.length === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(rows[0]);
});

router.post("/admin/blog/posts", async (req: AuthedRequest, res) => {
  try {
    const body: Record<string, unknown> = isRecord(req.body) ? req.body : {};
    if (typeof body.title !== "string" || !body.title) {
      res.status(400).json({ error: "title is required" });
      return;
    }
    const title = body.title;
    const fields = pickFields(body, true);
    const slug = fields.slug ?? slugify(title);
    if (!(await isSlugAvailable(slug))) {
      res.status(409).json({ error: "slug already in use", field: "slug" });
      return;
    }
    if (fields.status === "archived" && !fields.archivedAt) fields.archivedAt = new Date();
    if (fields.status === "published" && !fields.publishDate) fields.publishDate = new Date();

    const insertValues: InsertBlogPost = {
      ...fields,
      title,
      slug,
      createdBy: req.admin?.email ?? null,
      updatedBy: req.admin?.email ?? null,
    };
    const inserted = await db.insert(blogPostsTable).values(insertValues).returning();
    res.status(201).json(inserted[0]);
  } catch (err) {
    res.status(400).json({ error: errorMessage(err) });
  }
});

router.patch("/admin/blog/posts/:id", async (req: AuthedRequest, res) => {
  try {
    const id = String(req.params.id);
    const existing = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: "not found" });
      return;
    }
    const fields = pickFields(req.body, false);
    if (fields.slug && !(await isSlugAvailable(fields.slug, id))) {
      res.status(409).json({ error: "slug already in use", field: "slug" });
      return;
    }
    if (fields.status === "archived" && !existing[0].archivedAt) {
      fields.archivedAt = new Date();
    }
    if (fields.status && fields.status !== "archived") {
      fields.archivedAt = null;
    }
    if (fields.status === "published" && !existing[0].publishDate && !fields.publishDate) {
      fields.publishDate = new Date();
    }

    const updated = await db
      .update(blogPostsTable)
      .set({
        ...fields,
        updatedBy: req.admin?.email ?? null,
        updatedAt: new Date(),
      })
      .where(eq(blogPostsTable.id, id))
      .returning();
    res.json(updated[0]);
  } catch (err) {
    res.status(400).json({ error: errorMessage(err) });
  }
});

router.delete("/admin/blog/posts/:id", async (req, res) => {
  await db.delete(blogPostsTable).where(eq(blogPostsTable.id, String(req.params.id)));
  res.json({ ok: true });
});

router.get("/admin/blog/slug-check", async (req, res) => {
  const slug = slugify(String(req.query.slug ?? ""));
  const excludeId = req.query.excludeId ? String(req.query.excludeId) : undefined;
  if (!slug) {
    res.json({ available: false, slug });
    return;
  }
  const available = await isSlugAvailable(slug, excludeId);
  res.json({ available, slug });
});

export default router;
