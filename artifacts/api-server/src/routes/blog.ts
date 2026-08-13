import { Router, type IRouter } from "express";
import { and, eq, desc, ilike, or, sql } from "drizzle-orm";
import { db, blogPostsTable } from "@workspace/db";
import { promoteScheduledPosts } from "../lib/blog";

const router: IRouter = Router();

const PUBLIC_FIELDS = {
  id: blogPostsTable.id,
  title: blogPostsTable.title,
  slug: blogPostsTable.slug,
  body: blogPostsTable.body,
  excerpt: blogPostsTable.excerpt,
  featuredImageUrl: blogPostsTable.featuredImageUrl,
  featuredImageAlt: blogPostsTable.featuredImageAlt,
  author: blogPostsTable.author,
  authorCredential: blogPostsTable.authorCredential,
  category: blogPostsTable.category,
  tags: blogPostsTable.tags,
  publishDate: blogPostsTable.publishDate,
  metaTitle: blogPostsTable.metaTitle,
  metaDescription: blogPostsTable.metaDescription,
  canonicalUrl: blogPostsTable.canonicalUrl,
  openGraphImageUrl: blogPostsTable.openGraphImageUrl,
  commentsEnabled: blogPostsTable.commentsEnabled,
  createdAt: blogPostsTable.createdAt,
  updatedAt: blogPostsTable.updatedAt,
};

router.get("/blog/posts", async (req, res) => {
  await promoteScheduledPosts().catch(() => undefined);

  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(String(req.query.pageSize ?? "12"), 10) || 12));
  const search = String(req.query.search ?? "").trim();
  const category = String(req.query.category ?? "").trim();
  const tag = String(req.query.tag ?? "").trim();

  const filters = [eq(blogPostsTable.status, "published" as const)];
  if (category) filters.push(eq(blogPostsTable.category, category));
  if (tag) filters.push(sql`${blogPostsTable.tags} @> ${JSON.stringify([tag])}::jsonb`);
  if (search) {
    const like = `%${search}%`;
    const cond = or(
      ilike(blogPostsTable.title, like),
      ilike(blogPostsTable.excerpt, like),
      ilike(blogPostsTable.body, like),
    );
    if (cond) filters.push(cond);
  }

  const where = and(...filters);

  const [items, totalRow] = await Promise.all([
    db
      .select(PUBLIC_FIELDS)
      .from(blogPostsTable)
      .where(where)
      .orderBy(desc(blogPostsTable.publishDate), desc(blogPostsTable.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(blogPostsTable).where(where),
  ]);

  res.json({
    items,
    page,
    pageSize,
    total: totalRow[0]?.count ?? 0,
  });
});

router.get("/blog/categories", async (_req, res) => {
  await promoteScheduledPosts().catch(() => undefined);
  const rows = await db
    .selectDistinct({ category: blogPostsTable.category })
    .from(blogPostsTable)
    .where(eq(blogPostsTable.status, "published" as const));
  res.json({
    categories: rows.map((r) => r.category).filter((c) => c && c.length > 0),
  });
});

router.get("/blog/posts/:slug", async (req, res) => {
  await promoteScheduledPosts().catch(() => undefined);
  const slug = req.params.slug;
  const rows = await db
    .select(PUBLIC_FIELDS)
    .from(blogPostsTable)
    .where(and(eq(blogPostsTable.slug, slug), eq(blogPostsTable.status, "published" as const)))
    .limit(1);
  if (rows.length === 0) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(rows[0]);
});

export default router;
