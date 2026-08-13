import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import zlib from "node:zlib";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  organizationJsonLd,
  webSiteJsonLd,
  breadcrumbJsonLd,
  blogPostingJsonLd,
  blogPostBreadcrumbJsonLd,
  injectJsonLd,
} from "./json-ld.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "..", "dist", "public");
const port = Number(process.env.PORT) || 18839;

// Public IndexNow site-verification key (must match INDEXNOW_KEY in the
// api-server's src/lib/indexnow.ts, which pings IndexNow on publish).
const INDEXNOW_KEY = "78a1dad70a77f16a92de95d93165c1f6";

const CANONICAL_HOST = "www.planalert.com";
const APEX_HOST = "planalert.com";

// Old/external URLs that should permanently redirect to a real page.
const REDIRECTS = {
  "/home": "/",
  "/index.html": "/",
};

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

const COMPRESSIBLE_EXT = new Set([".html", ".js", ".mjs", ".css", ".json", ".xml", ".txt", ".svg", ".map"]);

// Parse Accept-Encoding with q-values per RFC 9110 and return the encodings
// we support ("br", "gzip") that the client accepts, in our order of
// preference (br first) among acceptable codings, honoring q=0 exclusions
// and "*" wildcard.
function acceptedEncodings(req) {
  const header = req?.headers?.["accept-encoding"];
  if (header === undefined) return [];
  const q = new Map();
  for (const part of String(header).toLowerCase().split(",")) {
    const [tokenRaw, ...params] = part.split(";");
    const token = tokenRaw.trim();
    if (!token) continue;
    let weight = 1;
    for (const p of params) {
      const m = p.trim().match(/^q=([0-9.]+)$/);
      if (m) weight = parseFloat(m[1]);
    }
    q.set(token, Number.isFinite(weight) ? weight : 0);
  }
  const wildcard = q.get("*");
  const weightOf = (enc) => (q.has(enc) ? q.get(enc) : wildcard !== undefined ? wildcard : 0);
  return ["br", "gzip"]
    .map((enc) => ({ enc, w: weightOf(enc) }))
    .filter(({ w }) => w > 0)
    .sort((a, b) => b.w - a.w) // stable: br wins ties
    .map(({ enc }) => enc);
}

// Availability index of precompressed sidecar files, built once at startup
// so request handling never touches the filesystem synchronously.
const precompressed = new Set();
(function indexSidecars(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) indexSidecars(full);
    else if (full.endsWith(".br") || full.endsWith(".gz")) precompressed.add(full);
  }
})(publicDir);

function sendFile(res, filePath, status = 200, headOnly = false) {
  const ext = path.extname(filePath).toLowerCase();
  const isAsset = filePath.includes(`${path.sep}assets${path.sep}`);
  const headers = {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": isAsset
      ? "public, max-age=31536000, immutable"
      : "no-cache",
  };

  // Serve a precompressed variant (written at build time) when available.
  // Range requests bypass compression: we don't implement 206 responses,
  // and ignoring Range (serving a full 200) is permitted, but the bytes
  // must then be the identity representation.
  let servePath = filePath;
  const req = res.req;
  const hasRange = Boolean(req?.headers?.range);
  if (COMPRESSIBLE_EXT.has(ext)) {
    headers["Vary"] = "Accept-Encoding";
    if (!hasRange) {
      for (const enc of acceptedEncodings(req)) {
        const suffix = enc === "br" ? ".br" : ".gz";
        if (precompressed.has(filePath + suffix)) {
          servePath = filePath + suffix;
          headers["Content-Encoding"] = enc;
          break;
        }
      }
    }
  }

  res.writeHead(status, headers);
  if (headOnly) {
    res.end();
    return;
  }
  const stream = fs.createReadStream(servePath);
  stream.on("error", (err) => {
    console.error(`sendFile: read failed for ${servePath} (${err.message})`);
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

// React 19's renderToString auto-emits an image preload for rendered <img>
// elements. The nav bell logo is a tiny decorative asset — strip only its
// hint so it doesn't compete with the real LCP resources (hero font),
// while keeping preloads for meaningful content images (e.g. blog
// featured images).
function stripImagePreloads(appHtml) {
  return appHtml.replace(
    /<link rel="preload" as="image"[^>]*bell-logo[^>]*\/?>/g,
    "",
  );
}

function injectBody(html, appHtml) {
  if (!appHtml) return html;
  appHtml = stripImagePreloads(appHtml);
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
  "/privacy": {
    title: "Privacy Policy — PlanAlert",
    description: "How PlanAlert collects, uses, and protects your information.",
  },
  "/terms": {
    title: "Terms of Service — PlanAlert",
    description: "The terms that govern your use of PlanAlert.",
  },
  "/contact": {
    title: "Contact — PlanAlert",
    description:
      "Questions about PlanAlert, your account, or plan monitoring? Get in touch with the PlanAlert team.",
  },
};

// Route-level JSON-LD for pages served through the runtime SPA fallback.
// Prerendered files get the same blocks at build time (scripts/prerender.mjs).
function routeJsonLd(cleanPath) {
  if (cleanPath === "/") return [organizationJsonLd(), webSiteJsonLd()];
  if (cleanPath === "/about") {
    return [
      breadcrumbJsonLd([
        { name: "Home", url: `${SITE_ORIGIN}/` },
        { name: "About", url: `${SITE_ORIGIN}/about` },
      ]),
    ];
  }
  return null;
}

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

const API_NOT_FOUND = Symbol("api-not-found");

async function apiGet(pathname, timeoutMs = 2000) {
  const resp = await fetch(`${API_ORIGIN}${pathname}`, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (resp.status === 404) return API_NOT_FOUND;
  if (!resp.ok) throw new Error(`api responded ${resp.status}`);
  return resp.json();
}

// Returns { post, meta } when found, null when the API confirms the post
// does not exist (cached), or { unavailable: true } when the API is
// unreachable (not cached, so recovery is immediate).
async function fetchPost(slug) {
  const cached = cacheGet(`post:${slug}`);
  if (cached) return cached.value;
  try {
    const post = await apiGet(`/api/blog/posts/${encodeURIComponent(slug)}`);
    if (post === API_NOT_FOUND || !post) {
      return cacheSet(`post:${slug}`, null);
    }
    return cacheSet(`post:${slug}`, {
      post,
      meta: {
        title: post.metaTitle || `${post.title} — PlanAlert Blog`,
        description: post.metaDescription || post.excerpt || "",
        canonical: post.canonicalUrl || `${SITE_ORIGIN}/blog/${post.slug}`,
      },
    });
  } catch {
    // API unavailable or timed out — caller may fall back to the
    // build-time prerendered file. Not cached.
    return { unavailable: true };
  }
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

// Real last-modified dates for static pages, written by the build's
// prerender step (from git history). Sits in dist/ (not dist/public) so
// it is never served. Missing file → lastmod omitted for static pages.
let STATIC_LASTMOD = {};
try {
  STATIC_LASTMOD = JSON.parse(
    fs.readFileSync(path.resolve(publicDir, "..", "static-lastmod.json"), "utf8"),
  );
} catch {
  /* optional file — sitemap simply omits static lastmod */
}

// Runtime-generated sitemap so new posts are discoverable without a rebuild.
// Prefer the build manifest's route list (keys of static-lastmod.json,
// written by scripts/prerender.mjs from its route table) so runtime and
// build sitemaps can't drift; the literal list is only a fallback.
const SITEMAP_STATIC_PATHS_FALLBACK = [
  "/",
  "/how-it-works",
  "/medicare",
  "/cellular",
  "/internet",
  "/about",
  "/blog",
  "/privacy",
  "/terms",
  "/contact",
];
const SITEMAP_STATIC_PATHS =
  Object.keys(STATIC_LASTMOD).length > 0
    ? Object.keys(STATIC_LASTMOD)
    : SITEMAP_STATIC_PATHS_FALLBACK;

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
    // /blog also changes when a post is published or updated after build.
    const newestPost = posts
      .map((p) => Date.parse(p.updatedAt ?? p.publishDate ?? ""))
      .filter((t) => Number.isFinite(t))
      .sort((a, b) => b - a)[0];
    const urls = [
      ...SITEMAP_STATIC_PATHS.map((p) => {
        let lastmod = STATIC_LASTMOD[p];
        if (p === "/blog" && newestPost && (!lastmod || newestPost > Date.parse(lastmod))) {
          lastmod = new Date(newestPost).toISOString();
        }
        // Omit <lastmod> when no accurate date is known — never request time.
        return `<url><loc>${SITE_ORIGIN}${p === "/" ? "/" : p}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;
      }),
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

function sendHtml(res, html, headOnly, contentType = "text/html; charset=utf-8", status = 200) {
  const headers = {
    "Content-Type": contentType,
    "Cache-Control": "no-cache",
    "Vary": "Accept-Encoding",
  };
  // Select the representation before handling HEAD so HEAD and GET
  // describe the same response.
  let body = Buffer.from(html);
  const enc = acceptedEncodings(res.req)[0];
  if (enc === "br") {
    body = zlib.brotliCompressSync(body, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 },
    });
    headers["Content-Encoding"] = "br";
  } else if (enc === "gzip") {
    body = zlib.gzipSync(body, { level: 6 });
    headers["Content-Encoding"] = "gzip";
  }
  res.writeHead(status, headers);
  res.end(headOnly ? undefined : body);
}

async function sendSpaFallback(res, pathname, headOnly, fallbackFile = null) {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  if (STATIC_META[cleanPath]) {
    const meta = {
      ...STATIC_META[cleanPath],
      canonical: `${SITE_ORIGIN}${cleanPath}`,
    };
    sendHtml(
      res,
      injectJsonLd(injectMeta(indexTemplate, meta), routeJsonLd(cleanPath)),
      headOnly,
    );
    return;
  }
  const blogMatch = cleanPath.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const data = await fetchPost(blogMatch[1]);
    if (data && !data.unavailable) {
      let html = injectJsonLd(injectMeta(indexTemplate, data.meta), [
        blogPostingJsonLd(data.post),
        blogPostBreadcrumbJsonLd(data.post),
      ]);
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
    // Live render unavailable (API down/erroring) — fall back to the
    // build-time prerendered file if one exists. A confirmed-missing
    // post (data === null) falls through to the 404 response instead.
    if (data && data.unavailable && fallbackFile && fs.existsSync(fallbackFile)) {
      sendFile(res, fallbackFile, 200, headOnly);
      return;
    }
  }
  // Client-only routes (e.g. the blog admin) are valid pages that simply
  // aren't prerendered — serve them with 200. Anything else is an unknown
  // URL: serve the SPA shell (which renders the Not Found page) with a
  // real 404 status so crawlers don't record soft 404s.
  const isClientRoute = cleanPath === "/" || cleanPath.startsWith("/blogadmin");
  sendHtml(
    res,
    injectJsonLd(indexTemplate, routeJsonLd(cleanPath)),
    headOnly,
    "text/html; charset=utf-8",
    isClientRoute ? 200 : 404,
  );
}

// Security headers on every response. HSTS is already handled upstream —
// do not add it here. CSP starts in Report-Only mode so would-be
// violations can be reviewed before enforcing; keep the policy in sync
// with what the site actually loads (GA/gtag, Google Fonts, Scribe embed,
// the app.planalert.com signup flow).
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  // gtag bootstraps via an inline snippet in index.html.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.google-analytics.com",
  // Tailwind/React inject inline styles; Google Fonts stylesheet.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Blog images are editor-supplied URLs; keep img-src permissive for now.
  "img-src 'self' data: https:",
  // www.google.com is needed because GA4 region-routes some /g/collect
  // beacons there (observed as a report-only violation in testing).
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://www.google.com https://app.planalert.com",
  // The how-it-works walkthrough embeds a Scribe viewer.
  "frame-src https://scribehow.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://app.planalert.com",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy-Report-Only": CSP_REPORT_ONLY,
};

const server = http.createServer((req, res) => {
  // setHeader-set headers are sent alongside any later writeHead(status,
  // headers) call, so every response path below inherits these.
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(name, value);
  }
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

  let rawPathname;
  try {
    rawPathname = new URL(req.url || "/", "http://localhost").pathname;
  } catch {
    res.writeHead(400).end("Bad Request");
    return;
  }
  // Legacy/external links to /home should land on the canonical homepage.
  if (REDIRECTS[rawPathname.replace(/\/+$/, "") || "/"]) {
    res
      .writeHead(301, {
        Location: `https://${CANONICAL_HOST}${REDIRECTS[rawPathname.replace(/\/+$/, "") || "/"]}`,
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
  // IndexNow key file (https://www.indexnow.org/documentation). The key is
  // deliberately public — the protocol verifies site ownership by fetching
  // this file. The api-server pings IndexNow with this key on publish.
  if (pathname === `/${INDEXNOW_KEY}.txt`) {
    sendHtml(res, INDEXNOW_KEY, headOnly, "text/plain; charset=utf-8");
    return;
  }

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

  // Blog posts must render from the live API (60s cache) rather than the
  // build-time prerendered file, so edits published after the last deploy
  // appear without a rebuild. The prerendered file is only a fallback.
  const blogSlugMatch = pathname
    .replace(/\/+$/, "")
    .match(/^\/blog\/([^/]+)$/);
  if (blogSlugMatch) {
    const prerenderedFile = path.join(
      publicDir,
      "blog",
      blogSlugMatch[1],
      "index.html",
    );
    sendSpaFallback(res, pathname, headOnly, prerenderedFile).catch(() => {
      if (!res.headersSent) {
        sendHtml(res, indexTemplate, headOnly);
      } else {
        res.end();
      }
    });
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
