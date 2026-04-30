import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, blogPostsTable } from "@workspace/db";
import { promoteScheduledPosts } from "../lib/blog";

const router: IRouter = Router();

function siteOrigin(req: any): string {
  const envOrigin = process.env.PUBLIC_SITE_ORIGIN?.replace(/\/$/, "");
  if (envOrigin) return envOrigin;
  if (process.env.NODE_ENV === "production") {
    // In production, require an explicit origin to avoid host-header poisoning.
    return "";
  }
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
  const host = (req.headers["x-forwarded-host"] as string) || req.get("host") || "localhost";
  // Only allow safe characters in host to prevent header injection.
  if (!/^[A-Za-z0-9.\-:]+$/.test(host)) return "";
  return `${proto}://${host}`;
}

router.get("/blog/sitemap.xml", async (req, res) => {
  await promoteScheduledPosts().catch(() => undefined);
  const origin = siteOrigin(req);
  const rows = await db
    .select({
      slug: blogPostsTable.slug,
      updatedAt: blogPostsTable.updatedAt,
      publishDate: blogPostsTable.publishDate,
    })
    .from(blogPostsTable)
    .where(eq(blogPostsTable.status, "published" as const));

  const urls = [
    `<url><loc>${origin}/blog</loc></url>`,
    ...rows.map((r) => {
      const lastmod = (r.updatedAt ?? r.publishDate ?? new Date()).toISOString();
      return `<url><loc>${origin}/blog/${r.slug}</loc><lastmod>${lastmod}</lastmod></url>`;
    }),
  ].join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  res.set("content-type", "application/xml").send(xml);
});

router.get("/blog/robots.txt", (req, res) => {
  const origin = siteOrigin(req);
  res
    .set("content-type", "text/plain")
    .send(`User-agent: *\nAllow: /blog\nDisallow: /blogadmin\nSitemap: ${origin}/api/blog/sitemap.xml\n`);
});

export default router;
