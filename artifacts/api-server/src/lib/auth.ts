import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { eq, and, gt } from "drizzle-orm";
import { db, adminUsersTable, adminSessionsTable, type AdminUser } from "@workspace/db";
import { logger } from "./logger";

const SESSION_COOKIE = "blogadmin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const derived = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    if (expected.length !== derived.length) return false;
    return crypto.timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(adminUserId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(adminSessionsTable).values({ token: hashToken(token), adminUserId, expiresAt });
  return { token, expiresAt };
}

export async function destroySession(token: string): Promise<void> {
  await db.delete(adminSessionsTable).where(eq(adminSessionsTable.token, hashToken(token)));
}

export async function getAdminFromRequest(req: Request): Promise<AdminUser | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token || typeof token !== "string") return null;

  const rows = await db
    .select({
      user: adminUsersTable,
    })
    .from(adminSessionsTable)
    .innerJoin(adminUsersTable, eq(adminUsersTable.id, adminSessionsTable.adminUserId))
    .where(and(eq(adminSessionsTable.token, hashToken(token)), gt(adminSessionsTable.expiresAt, new Date())))
    .limit(1);

  return rows[0]?.user ?? null;
}

export interface AuthedRequest extends Request {
  admin?: AdminUser;
}

export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  req.admin = admin;
  next();
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

/**
 * Bootstrap an admin user from environment variables on startup.
 * If ADMIN_EMAIL and ADMIN_PASSWORD are set and no admin exists with that email,
 * create one. Existing admins are not modified.
 */
export async function bootstrapAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() ?? "Admin";

  if (!email || !password) {
    logger.info("ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin bootstrap");
    return;
  }

  const existing = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email)).limit(1);
  if (existing.length > 0) {
    logger.info({ email }, "Admin user already exists; skipping bootstrap");
    return;
  }

  await db.insert(adminUsersTable).values({
    email,
    name,
    passwordHash: hashPassword(password),
  });
  logger.info({ email }, "Bootstrapped admin user from environment");
}
