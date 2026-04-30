# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- **planalert** — Coming-soon marketing site + DB-backed blog. Pages: `/`, `/blog`, `/blog/:slug`, `/blogadmin/login`, `/blogadmin` (dashboard), `/blogadmin/editor/:id?`, `/blogadmin/waitlist`. Markdown rendered with `react-markdown` + `remark-gfm`.
- **api-server** — Express 5 backed by Drizzle/Postgres. Public routes: `/api/blog/*`, `/api/waitlist`, `/api/seo/*`. Admin routes (cookie session): `/api/admin/auth/*`, `/api/admin/blog/*`, `/api/admin/waitlist`. Bootstraps an admin user on boot from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (insert-only, never rotates).
- **mockup-sandbox** — design preview server.

## Database (lib/db)

Schemas: `admin-users`, `admin-sessions`, `blog-posts`, `waitlist-signups`. Schema is currently applied via `drizzle-kit push` (no migration files yet — see follow-up tasks).
