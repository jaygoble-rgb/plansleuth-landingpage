import { pgTable, uuid, text, timestamp, boolean, pgEnum, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const postStatusEnum = pgEnum("blog_post_status", [
  "draft",
  "published",
  "scheduled",
  "archived",
]);

export const blogPostsTable = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    body: text("body").notNull().default(""),
    excerpt: text("excerpt").notNull().default(""),
    featuredImageUrl: text("featured_image_url").notNull().default(""),
    featuredImageAlt: text("featured_image_alt").notNull().default(""),
    author: text("author").notNull().default(""),
    category: text("category").notNull().default(""),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    status: postStatusEnum("status").notNull().default("draft"),
    publishDate: timestamp("publish_date", { withTimezone: true }),
    scheduledPublishAt: timestamp("scheduled_publish_at", { withTimezone: true }),
    metaTitle: text("meta_title").notNull().default(""),
    metaDescription: text("meta_description").notNull().default(""),
    canonicalUrl: text("canonical_url").notNull().default(""),
    openGraphImageUrl: text("open_graph_image_url").notNull().default(""),
    commentsEnabled: boolean("comments_enabled").notNull().default(false),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("blog_posts_slug_idx").on(t.slug),
    index("blog_posts_status_idx").on(t.status),
    index("blog_posts_publish_date_idx").on(t.publishDate),
  ],
);

export const insertBlogPostSchema = createInsertSchema(blogPostsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type BlogPost = typeof blogPostsTable.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
