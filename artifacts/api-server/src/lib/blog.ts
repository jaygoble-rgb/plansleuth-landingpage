import { and, eq, lte, ne, sql } from "drizzle-orm";
import { db, blogPostsTable, type InsertBlogPost } from "@workspace/db";
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
 * Idempotently insert a single post by slug. If a row with the same slug
 * already exists, this is a no-op. Used by `seedFirstPost` to recreate the
 * initial "cheapest-wireless-carrier" article on a fresh environment.
 */
export async function ensurePostBySlug(post: InsertBlogPost): Promise<"inserted" | "exists"> {
  const existing = await db
    .select({ id: blogPostsTable.id })
    .from(blogPostsTable)
    .where(eq(blogPostsTable.slug, post.slug))
    .limit(1);
  if (existing.length > 0) return "exists";
  await db.insert(blogPostsTable).values(post);
  return "inserted";
}

const CHEAPEST_WIRELESS_CARRIER_BODY = `If you are searching for the cheapest wireless carrier, you are probably trying to lower your monthly bill without losing the coverage and data you need. The good news is that low-cost wireless has never been better. MVNOs — carriers that lease network capacity from the big three — now offer plans that run on the same towers as Verizon, AT&T, and T-Mobile, often at a fraction of the price.

The bad news is that navigating the options is genuinely confusing. Prices change constantly, promotional rates expire, and the fine print around data throttling, hotspot limits, and taxes can turn a $25 plan into a $40 bill. This guide breaks down what actually matters when comparing wireless carriers so you can make a smart switch — and keep saving.

## 1. Monthly Price

The advertised monthly price is where most people start, and it is a reasonable place to begin — but it is rarely the whole story. Budget carriers like Mint Mobile, Visible, Cricket Wireless, and Boost Mobile routinely offer single-line plans in the $15–$35 range for a meaningful amount of data. Mint, for example, has historically advertised plans as low as $15/month when you prepay for a full year.

The key question is whether you are comparing prepaid vs. postpaid, promotional vs. standard, and individual vs. family pricing. A plan that looks cheapest for one person may not be cheapest when you add a second line. Always check both the introductory and standard renewal rates.

## 2. Data Limits

Most low-cost carriers offer "unlimited" data, but there is a catch: almost all of them throttle speeds after a certain threshold. Visible's single-line plan, for instance, is unlimited but deprioritized at all times — meaning you may see slower speeds when the network is busy. Mint and Cricket throttle to 2G speeds after you hit your high-speed data cap.

For light users who mostly text and check email, throttled data is barely noticeable. For people who stream video or work remotely on a hotspot, it can be a dealbreaker. Understand how much high-speed data you actually need before choosing a plan. A 10GB plan may be plenty; an "unlimited" plan may still leave you frustrated.

- Check the high-speed data cap, not just the "unlimited" label
- Look at hotspot data separately — many plans cap it at 5–15GB
- Understand what speed you get after the cap (2G vs. 3G makes a real difference)
- Review network priority and deprioritization policies

## 3. Coverage Quality

MVNOs run on one of the three major networks: Verizon, AT&T, or T-Mobile. The coverage map you use matters a lot. Visible runs on Verizon, which tends to have strong rural coverage. Mint Mobile runs on T-Mobile, which has excellent urban and suburban coverage but thinner rural reach. Cricket runs on AT&T.

Before switching, look up your home address and the places you travel most frequently on each carrier's coverage map. Pay attention to the difference between "extended" or "partner" coverage and native coverage — the former can have strict data limits or no roaming privileges at all. If you live in a rural area, Verizon-based MVNOs are generally the safer bet.

## 4. Hidden Fees and Taxes

This is where many budget carrier plans quietly get expensive. The advertised price almost never includes taxes, regulatory fees, and carrier surcharges. Depending on your state and city, these additions can add $3–$10 per line per month. Some carriers, like Visible, advertise an all-in price that genuinely includes all taxes and fees — others do not.

Watch out for these common add-on costs:

- State and local taxes (can vary significantly by location)
- Federal Universal Service Fund surcharges
- Regulatory recovery fees
- Activation fees on new lines
- SIM card and shipping costs for new subscribers
- International calling add-ons that are easy to accidentally trigger

## 5. Extra Benefits

At similar price points, the differentiating factor often comes down to included extras. Some carriers bundle streaming services — T-Mobile customers on certain plans get Netflix included. Others offer international roaming, Wi-Fi calling, visual voicemail, or mobile hotspot at no additional charge.

If you frequently travel internationally, the value of free roaming data can be significant. If you rely on your phone as a Wi-Fi hotspot for a laptop, the hotspot allowance becomes one of the most important specs to check. Make a list of the features you actually use before comparing plans — it is easy to overlook a benefit that is worth $10 a month on its own.

## Final Thoughts

The cheapest wireless carrier for you depends on your usage patterns, your location, and whether you are paying for features you actually need. The average American overpays on their wireless plan by more than $300 a year simply because they never checked whether a better option existed.

Switching wireless carriers is easier than most people expect. Most phones are now unlocked, number porting takes a few hours, and most MVNOs ship a free SIM card. The biggest barrier is simply knowing when a better deal has appeared — which is exactly what PlanAlert is built to tell you.

## FAQ

### Will I lose my phone number if I switch carriers?

No. Number porting is a legal right in the United States, and your current carrier is required to release your number. The process typically takes a few hours and is initiated by your new carrier. Keep your existing account active until the port is confirmed complete.

### Is my phone compatible with a budget carrier?

Most modern smartphones are unlocked and compatible with multiple networks. The key is matching the phone's supported LTE and 5G bands to the bands used by your new carrier's underlying network. Your new carrier's website will have a compatibility checker — enter your phone's IMEI number to confirm before switching.

### How often do wireless plan prices change?

More often than most people realize. Carriers adjust pricing, add new promotional tiers, and quietly retire old plans on a rolling basis. Prices on popular budget plans can shift by $5–$15 within a single quarter. This is why monitoring matters — a plan that was not competitive six months ago may now be the best deal available.`;

/**
 * Recreate the original "Cheapest Wireless Carrier" post in the new
 * DB-backed blog system on a fresh environment. Idempotent: if the slug
 * already exists, no changes are made.
 */
export async function seedFirstPost(): Promise<void> {
  const result = await ensurePostBySlug({
    title: "Cheapest Wireless Carrier: How to Find the Best Low-Cost Phone Plan",
    slug: "cheapest-wireless-carrier",
    body: CHEAPEST_WIRELESS_CARRIER_BODY,
    excerpt:
      "If you are searching for the cheapest wireless carrier, you are probably trying to lower your monthly bill without losing the coverage and data you need.",
    author: "PlanAlert Team",
    category: "WIRELESS",
    tags: ["wireless", "phone plans", "savings", "carriers"],
    status: "published",
    publishDate: new Date("2026-04-23T00:00:00Z"),
    metaTitle:
      "Cheapest Wireless Carrier: How to Find the Best Low-Cost Phone Plan | PlanAlert",
    metaDescription:
      "Learn how to find the cheapest wireless carrier without sacrificing coverage or data. Compare MVNOs, hidden fees, and data limits to stop overpaying on your phone bill.",
    createdBy: "seed",
    updatedBy: "seed",
  });
  if (result === "inserted") {
    logger.info({ slug: "cheapest-wireless-carrier" }, "Seeded initial blog post");
  }
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
