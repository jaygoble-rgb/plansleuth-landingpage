import { and, eq, lte, ne, sql } from "drizzle-orm";
import { db, blogPostsTable } from "@workspace/db";
import { logger } from "./logger";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "post";
}

/**
 * Promote any "scheduled" posts whose scheduledPublishAt has passed
 * to "published". Called on a timer and on each public list/detail request.
 */
export async function promoteScheduledPosts(): Promise<number> {
  const now = new Date();
  const result = await db
    .update(blogPostsTable)
    .set({
      status: "published",
      publishDate: sql`COALESCE(${blogPostsTable.publishDate}, ${blogPostsTable.scheduledPublishAt}, ${now})`,
      updatedAt: now,
    })
    .where(
      and(
        eq(blogPostsTable.status, "scheduled"),
        lte(blogPostsTable.scheduledPublishAt, now),
      ),
    )
    .returning({ id: blogPostsTable.id });

  if (result.length > 0) {
    logger.info({ count: result.length }, "Promoted scheduled posts to published");
  }
  return result.length;
}

let timer: NodeJS.Timeout | null = null;
export function startScheduler(intervalMs = 30_000): void {
  if (timer) return;
  // Run once on start
  promoteScheduledPosts().catch((err) => logger.error({ err }, "scheduler initial run failed"));
  timer = setInterval(() => {
    promoteScheduledPosts().catch((err) =>
      logger.error({ err }, "scheduler tick failed"),
    );
  }, intervalMs);
  // Don't keep the process alive solely on this timer
  timer.unref?.();
}

/**
 * Ensure slug is unique. If `excludeId` is provided, that row is excluded
 * from the conflict check (used during updates).
 */
export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  const conditions = excludeId
    ? and(eq(blogPostsTable.slug, slug), ne(blogPostsTable.id, excludeId))
    : eq(blogPostsTable.slug, slug);
  const rows = await db.select({ id: blogPostsTable.id }).from(blogPostsTable).where(conditions).limit(1);
  return rows.length === 0;
}
