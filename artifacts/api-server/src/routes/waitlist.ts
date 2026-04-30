import { Router, type IRouter, type Request } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, waitlistSignupsTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clientIp(req: Request): string {
  const fwdHeader = req.headers["x-forwarded-for"];
  const fwd = Array.isArray(fwdHeader) ? fwdHeader[0] : fwdHeader ?? "";
  return fwd.split(",")[0]?.trim() || req.ip || "";
}

router.post("/waitlist", async (req, res) => {
  try {
    const body: Record<string, unknown> =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? (req.body as Record<string, unknown>)
        : {};
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email) || email.length > 320) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }
    const source = String(body.source ?? "home").slice(0, 64);
    const referrer = String(req.headers["referer"] ?? "").slice(0, 512);
    const userAgent = String(req.headers["user-agent"] ?? "").slice(0, 512);
    const ipAddress = clientIp(req).slice(0, 64);

    await db
      .insert(waitlistSignupsTable)
      .values({ email, source, referrer, userAgent, ipAddress })
      .onConflictDoNothing({ target: waitlistSignupsTable.email });

    res.status(201).json({ ok: true });
  } catch (err) {
    logger.error(
      { err: err instanceof Error ? err.message : String(err) },
      "waitlist signup failed",
    );
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.get("/admin/waitlist", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(waitlistSignupsTable)
    .orderBy(desc(waitlistSignupsTable.createdAt))
    .limit(1000);
  const totalRow = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(waitlistSignupsTable);
  res.json({ items: rows, total: totalRow[0]?.count ?? 0 });
});

router.get("/admin/waitlist.csv", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(waitlistSignupsTable)
    .orderBy(desc(waitlistSignupsTable.createdAt));
  const csvEscape = (v: unknown) => {
    let s = v == null ? "" : String(v);
    // Defuse spreadsheet formula injection: prefix any cell starting with =, +, -, @, tab, or CR
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["email", "source", "referrer", "user_agent", "ip_address", "created_at"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [r.email, r.source, r.referrer, r.userAgent, r.ipAddress, new Date(r.createdAt).toISOString()]
        .map(csvEscape)
        .join(","),
    );
  }
  res
    .set("content-type", "text/csv; charset=utf-8")
    .set("content-disposition", `attachment; filename="waitlist-${new Date().toISOString().slice(0, 10)}.csv"`)
    .send(lines.join("\n"));
});

router.delete("/admin/waitlist/:id", requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  await db.delete(waitlistSignupsTable).where(eq(waitlistSignupsTable.id, id));
  res.json({ ok: true });
});

export default router;
