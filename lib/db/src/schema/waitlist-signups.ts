import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

export const waitlistSignupsTable = pgTable(
  "waitlist_signups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    source: text("source").notNull().default("home"),
    referrer: text("referrer").notNull().default(""),
    userAgent: text("user_agent").notNull().default(""),
    ipAddress: text("ip_address").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    createdAtIdx: index("waitlist_signups_created_at_idx").on(table.createdAt),
  }),
);

export type WaitlistSignup = typeof waitlistSignupsTable.$inferSelect;
