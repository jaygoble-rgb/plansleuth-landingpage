// Precompress compressible build output (.br and .gz alongside originals)
// so the production server can serve them with Content-Encoding without
// compressing on the fly. Runs as the last build step.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const publicDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "dist",
  "public",
);

const COMPRESSIBLE = new Set([".html", ".js", ".mjs", ".css", ".json", ".xml", ".txt", ".svg", ".map"]);
const MIN_BYTES = 1024; // tiny files aren't worth the extra requests/inodes

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let count = 0;
let origTotal = 0;
let brTotal = 0;
for (const file of walk(publicDir)) {
  const ext = path.extname(file).toLowerCase();
  if (!COMPRESSIBLE.has(ext)) continue;
  const buf = fs.readFileSync(file);
  if (buf.length < MIN_BYTES) continue;
  const br = zlib.brotliCompressSync(buf, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
    },
  });
  const gz = zlib.gzipSync(buf, { level: 9 });
  fs.writeFileSync(file + ".br", br);
  fs.writeFileSync(file + ".gz", gz);
  count++;
  origTotal += buf.length;
  brTotal += br.length;
}
console.log(
  `compressed ${count} file(s): ${(origTotal / 1024).toFixed(0)}KB -> ${(brTotal / 1024).toFixed(0)}KB (brotli)`,
);
