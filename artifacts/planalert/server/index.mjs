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

  // SPA fallback
  sendFile(res, indexHtml, 200, headOnly);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`planalert static server listening on ${port}`);
});
