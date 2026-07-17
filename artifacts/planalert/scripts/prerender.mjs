import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist", "public");
const siteOrigin = "https://www.planalert.com";
const defaultOgImage = `${siteOrigin}/opengraph.jpg`;
const BLOG_PAGE_SIZE = 9;

const template = readFileSync(join(distDir, "index.html"), "utf8");

// Keep a pristine copy of the SPA shell (empty #root) outside the public
// dir so the production server can use it for unknown-route fallbacks.
writeFileSync(join(distDir, "..", "template.html"), template);

const { render } = await import(
  pathToFileURL(join(__dirname, "..", "dist", "server", "entry-server.js")).href
);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderRoute({ path, title, description, ogType = "website", ogImage = defaultOgImage, ssrData }) {
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

  // Server-render the page body so the full visible content (not just meta
  // tags) is present in the raw HTML for crawlers that don't execute JS.
  const appHtml = render(path, ssrData ?? {});
  if (!appHtml || appHtml.length === 0) {
    throw new Error(`SSR produced empty output for ${path}`);
  }
  const marker = '<div id="root"></div>';
  if (!html.includes(marker)) {
    throw new Error(`Template is missing the ${marker} marker`);
  }
  html = html.replace(marker, () => `<div id="root">${appHtml}</div>`);

  const outFile =
    path === "/" ? join(distDir, "index.html") : join(distDir, path.slice(1), "index.html");
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, html);
  console.log(`prerendered ${path} -> ${outFile.replace(distDir, "")} (${appHtml.length} bytes of body HTML)`);
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
];

const blogIndexRoute = {
  path: "/blog",
  title: "Blog — PlanAlert",
  description:
    "Insights, tips, and updates from PlanAlert on saving money on cell phone, internet, and household plans.",
};

function writeSitemap(blogRows) {
  const now = new Date().toISOString();
  const allStatic = [...staticRoutes, blogIndexRoute];
  const urls = [
    ...allStatic.map(
      (r) => `<url><loc>${siteOrigin}${r.path === "/" ? "/" : r.path}</loc><lastmod>${now}</lastmod></url>`,
    ),
    ...blogRows.map((row) => {
      const lastmod = new Date(row.updatedAt ?? row.publishDate ?? Date.now()).toISOString();
      return `<url><loc>${siteOrigin}/blog/${row.slug}</loc><lastmod>${lastmod}</lastmod></url>`;
    }),
  ].join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`;
  writeFileSync(join(distDir, "sitemap.xml"), xml);
  console.log(`wrote sitemap.xml with ${allStatic.length + blogRows.length} url(s)`);
}

async function fetchPublishedPosts() {
  if (!process.env.DATABASE_URL) return null;
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    // Field aliases mirror the public API response shape so the SSR pages
    // receive exactly the data the client-side fetch would have produced.
    const { rows } = await client.query(
      `SELECT id, title, slug, body, excerpt,
              featured_image_url AS "featuredImageUrl",
              featured_image_alt AS "featuredImageAlt",
              author, category, tags,
              publish_date AS "publishDate",
              meta_title AS "metaTitle",
              meta_description AS "metaDescription",
              canonical_url AS "canonicalUrl",
              open_graph_image_url AS "openGraphImageUrl",
              comments_enabled AS "commentsEnabled",
              created_at AS "createdAt",
              updated_at AS "updatedAt"
         FROM blog_posts
        WHERE status = 'published' AND archived_at IS NULL
        ORDER BY publish_date DESC NULLS LAST, created_at DESC`,
    );
    return rows;
  } finally {
    await client.end().catch(() => {});
  }
}

async function main() {
  let posts = null;
  try {
    posts = await fetchPublishedPosts();
  } catch (err) {
    console.error(`prerender: failed to load blog posts (${err.message})`);
    process.exitCode = 1;
    throw err;
  }

  for (const route of staticRoutes) renderRoute(route);

  if (posts === null) {
    console.warn("prerender: DATABASE_URL not set, prerendering blog without posts");
    posts = [];
  }

  renderRoute({
    ...blogIndexRoute,
    ssrData: {
      list: {
        items: posts.slice(0, BLOG_PAGE_SIZE),
        page: 1,
        pageSize: BLOG_PAGE_SIZE,
        total: posts.length,
      },
      categories: [...new Set(posts.map((p) => p.category).filter(Boolean))],
    },
  });

  for (const post of posts) {
    renderRoute({
      path: `/blog/${post.slug}`,
      title: post.metaTitle || `${post.title} — PlanAlert Blog`,
      description: post.metaDescription || post.excerpt || "",
      ogType: "article",
      ogImage: post.openGraphImageUrl || post.featuredImageUrl || defaultOgImage,
      ssrData: { post },
    });
  }
  console.log(`prerendered ${posts.length} blog post(s)`);
  writeSitemap(posts);
}

await main();
