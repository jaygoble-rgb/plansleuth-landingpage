import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "..", "dist", "public");
const port = Number(process.env.PORT) || 18839;

const CANONICAL_HOST = "www.planalert.com";
const APEX_HOST = "planalert.com";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".webmanifest": "application/manifest+json",
  ".map": "application/json",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

const indexHtml = path.join(publicDir, "index.html");
if (!fs.existsSync(indexHtml)) {
  console.error(`Missing build output: ${indexHtml}. Run the build first.`);
  process.exit(1);
}

function sendFile(res, filePath, status = 200, headOnly = false) {
  const ext = path.extname(filePath).toLowerCase();
  const isAsset = filePath.includes(`${path.sep}assets${path.sep}`);
  res.writeHead(status, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": isAsset
      ? "public, max-age=31536000, immutable"
      : "no-cache",
  });
  if (headOnly) {
    res.end();
    return;
  }
  const stream = fs.createReadStream(filePath);
  stream.on("error", (err) => {
    console.error(`sendFile: read failed for ${filePath} (${err.message})`);
    res.destroy();
  });
  stream.pipe(res);
}

const SITE_ORIGIN = `https://${CANONICAL_HOST}`;
const API_ORIGIN = process.env.API_ORIGIN || "http://127.0.0.1:8080";

// Pristine SPA shell (empty #root) written by the prerender step. The
// built index.html itself now contains the prerendered home page body, so
// it can no longer serve as a neutral template for other routes.
const templatePath = path.resolve(__dirname, "..", "dist", "template.html");
const indexTemplate = fs.existsSync(templatePath)
  ? fs.readFileSync(templatePath, "utf8")
  : fs.readFileSync(indexHtml, "utf8");

// Self-contained SSR bundle (all deps inlined at build time) used to
// render full page bodies for routes without a prerendered file — e.g.
// blog posts published after the last deploy.
const ssrEntry = path.resolve(__dirname, "..", "dist", "server", "entry-server.js");
let ssrRenderPromise = null;
function loadSsrRender() {
  if (!ssrRenderPromise) {
    ssrRenderPromise = import(pathToFileURL(ssrEntry).href)
      .then((m) => m.render)
      .catch((err) => {
        console.error(`ssr: failed to load entry-server (${err.message})`);
        return null;
      });
  }
  return ssrRenderPromise;
}

function injectBody(html, appHtml) {
  if (!appHtml) return html;
  return html.replace('<div id="root"></div>', () => `<div id="root">${appHtml}</div>`);
}

const STATIC_META = {
  "/about": {
    title: "About PlanAlert — Built to close the loyalty gap",
    description:
      "PlanAlert exists to close the loyalty gap. We watch the market so households stop absorbing the loyalty tax on cellular, internet, and other everyday plans.",
  },
  "/how-it-works": {
    title: "How it works — PlanAlert",
    description:
      "See how PlanAlert helps you stop overpaying: tell us your plans, we monitor the market, and we alert you when a better deal appears.",
  },
  "/blog": {
    title: "Blog — PlanAlert",
    description:
      "Insights, tips, and updates from PlanAlert on saving money on cell phone, internet, and household plans.",
  },
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function injectMeta(html, meta) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description || "");
  const canonical = escapeHtml(meta.canonical);
  let out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(
      /(<link rel="canonical" href=")[^"]*(")/,
      `$1${canonical}$2`,
    )
    .replace(
      /(<meta property="og:title" content=")[^"]*(")/,
      `$1${title}$2`,
    )
    .replace(
      /(<meta property="og:url" content=")[^"]*(")/,
      `$1${canonical}$2`,
    );
  if (description) {
    out = out
      .replace(
        /(<meta name="description" content=")[^"]*(")/,
        `$1${description}$2`,
      )
      .replace(
        /(<meta property="og:description" content=")[^"]*(")/,
        `$1${description}$2`,
      )
      .replace(
        /(<meta name="twitter:description" content=")[^"]*(")/,
        `$1${description}$2`,
      );
  }
  return out.replace(
    /(<meta name="twitter:title" content=")[^"]*(")/,
    `$1${title}$2`,
  );
}

const CACHE_MS = 60_000;
const responseCache = new Map();

function cacheGet(key) {
  const entry = responseCache.get(key);
  return entry && entry.expires > Date.now() ? entry : undefined;
}

function cacheSet(key, value) {
  responseCache.set(key, { value, expires: Date.now() + CACHE_MS });
  return value;
}

async function apiGet(pathname, timeoutMs = 2000) {
  const resp = await fetch(`${API_ORIGIN}${pathname}`, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!resp.ok) return null;
  return resp.json();
}

async function fetchPost(slug) {
  const cached = cacheGet(`post:${slug}`);
  if (cached) return cached.value;
  let value = null;
  try {
    const post = await apiGet(`/api/blog/posts/${encodeURIComponent(slug)}`);
    if (post) {
      value = {
        post,
        meta: {
          title: post.metaTitle || `${post.title} — PlanAlert Blog`,
          description: post.metaDescription || post.excerpt || "",
          canonical: post.canonicalUrl || `${SITE_ORIGIN}/blog/${post.slug}`,
        },
      };
    }
  } catch {
    // API unavailable or timed out — fall back to default meta
  }
  return cacheSet(`post:${slug}`, value);
}

// Runtime-rendered blog index so posts published after the last deploy
// appear in the raw HTML without a rebuild.
async function renderBlogIndexHtml() {
  const cached = cacheGet("blog-index");
  if (cached) return cached.value;
  let value = null;
  try {
    const [list, cats, render] = await Promise.all([
      apiGet("/api/blog/posts?page=1&pageSize=9"),
      apiGet("/api/blog/categories"),
      loadSsrRender(),
    ]);
    if (list && render) {
      const appHtml = render("/blog", {
        list,
        categories: cats?.categories ?? [],
      });
      const meta = { ...STATIC_META["/blog"], canonical: `${SITE_ORIGIN}/blog` };
      value = injectBody(injectMeta(indexTemplate, meta), appHtml);
    }
  } catch (err) {
    console.error(`ssr: blog index render failed (${err.message})`);
  }
  return cacheSet("blog-index", value);
}

// Runtime-generated sitemap so new posts are discoverable without a rebuild.
const SITEMAP_STATIC_PATHS = ["/", "/how-it-works", "/about", "/blog"];

async function renderSitemapXml() {
  const cached = cacheGet("sitemap");
  if (cached) return cached.value;
  let value = null;
  try {
    const posts = [];
    let page = 1;
    for (;;) {
      const list = await apiGet(`/api/blog/posts?page=${page}&pageSize=50`);
      if (!list || !Array.isArray(list.items)) throw new Error("bad list response");
      posts.push(...list.items);
      if (posts.length >= (list.total ?? 0) || list.items.length === 0 || page >= 20) break;
      page += 1;
    }
    const now = new Date().toISOString();
    const urls = [
      ...SITEMAP_STATIC_PATHS.map(
        (p) => `<url><loc>${SITE_ORIGIN}${p === "/" ? "/" : p}</loc><lastmod>${now}</lastmod></url>`,
      ),
      ...posts.map((post) => {
        const lastmod = new Date(post.updatedAt ?? post.publishDate ?? Date.now()).toISOString();
        return `<url><loc>${SITE_ORIGIN}/blog/${encodeURIComponent(post.slug)}</loc><lastmod>${lastmod}</lastmod></url>`;
      }),
    ].join("");
    value = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`;
  } catch (err) {
    console.error(`sitemap: runtime generation failed (${err.message})`);
  }
  return cacheSet("sitemap", value);
}

function sendHtml(res, html, headOnly, contentType = "text/html; charset=utf-8") {
  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": "no-cache",
  });
  res.end(headOnly ? undefined : html);
}

async function sendSpaFallback(res, pathname, headOnly) {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  if (STATIC_META[cleanPath]) {
    const meta = {
      ...STATIC_META[cleanPath],
      canonical: `${SITE_ORIGIN}${cleanPath}`,
    };
    sendHtml(res, injectMeta(indexTemplate, meta), headOnly);
    return;
  }
  const blogMatch = cleanPath.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const data = await fetchPost(blogMatch[1]);
    if (data) {
      let html = injectMeta(indexTemplate, data.meta);
      // Render the full article body so the content is in the raw HTML
      // even for posts published after the last build.
      const render = await loadSsrRender();
      if (render) {
        try {
          html = injectBody(html, render(cleanPath, { post: data.post }));
        } catch (err) {
          console.error(`ssr: render failed for ${cleanPath} (${err.message})`);
        }
      }
      sendHtml(res, html, headOnly);
      return;
    }
  }
  sendHtml(res, indexTemplate, headOnly);
}

const server = http.createServer((req, res) => {
  const method = req.method || "GET";
  if (method !== "GET" && method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  const headOnly = method === "HEAD";

  const forwarded = req.headers["x-forwarded-host"];
  const rawHost =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded) ||
    req.headers.host ||
    "";
  const host = rawHost.split(",")[0].trim().split(":")[0].toLowerCase();
  if (host === APEX_HOST) {
    res
      .writeHead(301, {
        Location: `https://${CANONICAL_HOST}${req.url || "/"}`,
        "Cache-Control": "no-cache",
      })
      .end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(req.url || "/", "http://localhost").pathname,
    );
  } catch {
    res.writeHead(400).end("Bad Request");
    return;
  }

  const resolved = path.normalize(path.join(publicDir, pathname));
  if (!resolved.startsWith(publicDir + path.sep) && resolved !== publicDir) {
    sendHtml(res, indexTemplate, headOnly);
    return;
  }

  // Fresh content routes: serve from the live API (60s cache) so posts
  // published after the last build appear without a redeploy. Falls back
  // to the build-time static output on any failure.
  if (pathname === "/sitemap.xml") {
    renderSitemapXml()
      .then((xml) => {
        if (xml) sendHtml(res, xml, headOnly, "application/xml; charset=utf-8");
        else sendFile(res, resolved, 200, headOnly);
      })
      .catch(() => sendFile(res, resolved, 200, headOnly));
    return;
  }
  if (pathname.replace(/\/+$/, "") === "/blog") {
    renderBlogIndexHtml()
      .then((html) => {
        if (html) {
          sendHtml(res, html, headOnly);
        } else {
          const staticBlog = path.join(publicDir, "blog", "index.html");
          if (fs.existsSync(staticBlog)) sendFile(res, staticBlog, 200, headOnly);
          else sendHtml(res, indexTemplate, headOnly);
        }
      })
      .catch(() => sendHtml(res, indexTemplate, headOnly));
    return;
  }

  // Exact file (e.g. /robots.txt, /assets/app-abc.js)
  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    sendFile(res, resolved, 200, headOnly);
    return;
  }

  // Prerendered route (e.g. /about -> /about/index.html)
  const candidate = path.join(
    resolved.replace(/[\\/]+$/, ""),
    "index.html",
  );
  if (
    candidate.startsWith(publicDir + path.sep) &&
    fs.existsSync(candidate)
  ) {
    sendFile(res, candidate, 200, headOnly);
    return;
  }

  // SPA fallback with per-route meta injection
  sendSpaFallback(res, pathname, headOnly).catch(() => {
    if (!res.headersSent) {
      sendHtml(res, indexTemplate, headOnly);
    } else {
      res.end();
    }
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`planalert static server listening on ${port}`);
});
