import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "..", "dist", "public");
const port = Number(process.env.PORT) || 18839;

const CANONICAL_HOST = "www.planalert.com";
const APEX_HOST = "planalert.com";

const app = express();
app.disable("x-powered-by");

app.use((req, res, next) => {
  const forwarded = req.headers["x-forwarded-host"];
  const rawHost = (Array.isArray(forwarded) ? forwarded[0] : forwarded) || req.headers.host || "";
  const host = rawHost.split(",")[0].trim().split(":")[0].toLowerCase();
  if (host === APEX_HOST) {
    return res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
  }
  next();
});

app.use(
  express.static(publicDir, {
    redirect: false,
    setHeaders(res, filePath) {
      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  }),
);

const indexHtml = path.join(publicDir, "index.html");

app.get("*splat", (req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  const cleanPath = req.path.replace(/\/+$/, "");
  const candidate = path.join(publicDir, cleanPath, "index.html");
  if (
    candidate.startsWith(publicDir) &&
    cleanPath !== "" &&
    fs.existsSync(candidate)
  ) {
    return res.sendFile(candidate);
  }
  res.sendFile(indexHtml);
});

if (!fs.existsSync(indexHtml)) {
  console.error(`Missing build output: ${indexHtml}. Run the build first.`);
  process.exit(1);
}

app.listen(port, "0.0.0.0", () => {
  console.log(`planalert static server listening on ${port}`);
});
