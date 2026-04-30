import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import {
  verifyPassword,
  createSession,
  destroySession,
  setSessionCookie,
  clearSessionCookie,
  getAdminFromRequest,
  requireAdmin,
  type AuthedRequest,
} from "../lib/auth";

const router: IRouter = Router();

router.post("/admin/auth/login", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!email || !password) {
    res.status(400).json({ error: "email and password required" });
    return;
  }
  const rows = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "invalid credentials" });
    return;
  }
  const { token, expiresAt } = await createSession(user.id);
  setSessionCookie(res, token, expiresAt);
  res.json({ id: user.id, email: user.email, name: user.name });
});

router.post("/admin/auth/logout", async (req, res) => {
  const token = req.cookies?.blogadmin_session;
  if (token) await destroySession(token);
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get("/admin/auth/me", async (req, res) => {
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  res.json({ id: admin.id, email: admin.email, name: admin.name });
});

// touchpoint kept for symmetry; not strictly needed
router.get("/admin/auth/check", requireAdmin, (req: AuthedRequest, res) => {
  res.json({ id: req.admin!.id, email: req.admin!.email, name: req.admin!.name });
});

export default router;
