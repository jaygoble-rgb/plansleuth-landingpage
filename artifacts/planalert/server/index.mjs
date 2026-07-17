import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

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
  fs.createReadStream(filePath).pipe(res);
}

const SITE_ORIGIN = `https://${CANONICAL_HOST}`;
const API_ORIGIN = process.env.API_ORIGIN || "http://127.0.0.1:8080";
const indexTemplate = fs.readFileSync(indexHtml, "utf8");

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

const postMetaCache = new Map();
const POST_CACHE_MS = 60_000;

async function fetchPostMeta(slug) {
  const cached = postMetaCache.get(slug);
  if (cached && cached.expires > Date.now()) return cached.value;
  let value = null;
  try {
    const resp = await fetch(
      `${API_ORIGIN}/api/blog/posts/${encodeURIComponent(slug)}`,
      { signal: AbortSignal.timeout(2000) },
    );
    if (resp.ok) {
      const post = await resp.json();
      value = {
        title: post.metaTitle || `${post.title} — PlanAlert Blog`,
        description: post.metaDescription || post.excerpt || "",
        canonical: post.canonicalUrl || `${SITE_ORIGIN}/blog/${post.slug}`,
      };
    }
  } catch {
    // API unavailable or timed out — fall back to default meta
  }
  postMetaCache.set(slug, { value, expires: Date.now() + POST_CACHE_MS });
  return value;
}

function sendHtml(res, html, headOnly) {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache",
  });
  res.end(headOnly ? undefined : html);
}

async function sendSpaFallback(res, pathname, headOnly) {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  let meta = null;
  if (STATIC_META[cleanPath]) {
    meta = {
      ...STATIC_META[cleanPath],
      canonical: `${SITE_ORIGIN}${cleanPath}`,
    };
  } else {
    const blogMatch = cleanPath.match(/^\/blog\/([^/]+)$/);
    if (blogMatch) {
      meta = await fetchPostMeta(blogMatch[1]);
    }
  }
  if (meta) {
    sendHtml(res, injectMeta(indexTemplate, meta), headOnly);
  } else {
    sendFile(res, indexHtml, 200, headOnly);
  }
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
    sendFile(res, indexHtml, 200, headOnly);
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
      sendFile(res, indexHtml, 200, headOnly);
    } else {
      res.end();
    }
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`planalert static server listening on ${port}`);
});
