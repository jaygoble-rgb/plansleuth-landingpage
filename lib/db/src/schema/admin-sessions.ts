import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { adminUsersTable } from "./admin-users";

export const adminSessionsTable = pgTable(
  "admin_sessions",
  {
    token: text("token").primaryKey(),
    adminUserId: uuid("admin_user_id")
      .notNull()
      .references(() => adminUsersTable.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("admin_sessions_user_idx").on(t.adminUserId)],
);

export type AdminSession = typeof adminSessionsTable.$inferSelect;
