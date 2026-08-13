import { logger } from "./logger";

/**
 * IndexNow publish pings (https://www.indexnow.org/documentation).
 *
 * The key is deliberately public — search engines verify site ownership by
 * fetching https://www.planalert.com/{key}.txt, which the planalert static
 * server hosts (must match INDEXNOW_KEY in artifacts/planalert/server/index.mjs).
 *
 * Pings are fire-and-forget: failures are logged, never thrown, and never
 * block or fail the admin request that triggered them. Only active in
 * production so dev/test publishes don't ping search engines with URLs
 * that don't exist publicly.
 */
const INDEXNOW_KEY = "78a1dad70a77f16a92de95d93165c1f6";
const SITE_HOST = "www.planalert.com";
const SITE_ORIGIN = `https://${SITE_HOST}`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export function pingIndexNowForSlugs(slugs: string[]): void {
  const urlList = slugs
    .filter((s) => typeof s === "string" && s.length > 0)
    .map((slug) => `${SITE_ORIGIN}/blog/${encodeURIComponent(slug)}`);
  if (urlList.length === 0) return;
  if (process.env.NODE_ENV !== "production") {
    logger.info({ urlList }, "IndexNow ping skipped (not production)");
    return;
  }
  void fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  })
    .then((res) => {
      if (res.ok) {
        logger.info({ urlList, status: res.status }, "IndexNow ping sent");
      } else {
        logger.warn({ urlList, status: res.status }, "IndexNow ping rejected");
      }
    })
    .catch((err: unknown) => {
      logger.warn({ err, urlList }, "IndexNow ping failed");
    });
}
