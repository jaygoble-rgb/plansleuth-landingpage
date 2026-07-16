import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist", "public");
const siteOrigin = "https://planalert.com";
const defaultOgImage = `${siteOrigin}/opengraph.jpg`;

const template = readFileSync(join(distDir, "index.html"), "utf8");

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderRoute({ path, title, description, ogType = "website", ogImage = defaultOgImage }) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const url = `${siteOrigin}${path === "/" ? "/" : path}`;
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${d}" />`)
    .replace(/<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${ogType}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${t}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${d}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${escapeHtml(ogImage)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${t}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${d}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);

  const outFile =
    path === "/" ? join(distDir, "index.html") : join(distDir, path.slice(1), "index.html");
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, html);
  console.log(`prerendered ${path} -> ${outFile.replace(distDir, "")}`);
}

const staticRoutes = [
  {
    path: "/",
    title: "PlanAlert — Never overpay for household plans again",
    description:
      "Tell us about your current plan and we'll compare it against the market - then monitor it continuously so you always know when a better plan becomes available.",
  },
  {
    path: "/how-it-works",
    title: "How it works — PlanAlert",
    description:
      "See how PlanAlert helps you stop overpaying: tell us your plans, we monitor the market, and we alert you when a better deal appears.",
  },
  {
    path: "/about",
    title: "About PlanAlert — Built to close the loyalty gap",
    description:
      "PlanAlert exists to close the loyalty gap. We watch the market so households stop absorbing the loyalty tax on cellular, internet, and other everyday plans.",
  },
  {
    path: "/blog",
    title: "Blog — PlanAlert",
    description:
      "Insights, tips, and updates from PlanAlert on saving money on cell phone, internet, and household plans.",
  },
];

for (const route of staticRoutes) renderRoute(route);

function writeSitemap(blogRows) {
  const now = new Date().toISOString();
  const urls = [
    ...staticRoutes.map(
      (r) => `<url><loc>${siteOrigin}${r.path === "/" ? "/" : r.path}</loc><lastmod>${now}</lastmod></url>`,
    ),
    ...blogRows.map((row) => {
      const lastmod = new Date(row.updated_at ?? row.publish_date ?? Date.now()).toISOString();
      return `<url><loc>${siteOrigin}/blog/${row.slug}</loc><lastmod>${lastmod}</lastmod></url>`;
    }),
  ].join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`;
  writeFileSync(join(distDir, "sitemap.xml"), xml);
  console.log(`wrote sitemap.xml with ${staticRoutes.length + blogRows.length} url(s)`);
}

async function prerenderBlogPosts() {
  if (!process.env.DATABASE_URL) {
    console.warn("prerender: DATABASE_URL not set, skipping blog post prerendering");
    writeSitemap([]);
    return;
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const { rows } = await client.query(
      `SELECT slug, title, excerpt, meta_title, meta_description,
              open_graph_image_url, featured_image_url, updated_at, publish_date
         FROM blog_posts
        WHERE status = 'published' AND archived_at IS NULL`,
    );
    for (const row of rows) {
      renderRoute({
        path: `/blog/${row.slug}`,
        title: row.meta_title || `${row.title} — PlanAlert Blog`,
        description: row.meta_description || row.excerpt || "",
        ogType: "article",
        ogImage: row.open_graph_image_url || row.featured_image_url || defaultOgImage,
      });
    }
    console.log(`prerendered ${rows.length} blog post(s)`);
    writeSitemap(rows);
  } catch (err) {
    console.error(`prerender: failed to prerender blog posts (${err.message})`);
    process.exitCode = 1;
    throw err;
  } finally {
    await client.end().catch(() => {});
  }
}

await prerenderBlogPosts();
