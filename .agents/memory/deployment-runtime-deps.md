---
name: Deployment runtime dependencies
description: Production deploys don't ship workspace node_modules; servers must be bundled or dependency-free
---

The rule: any production `run` process in this monorepo must not rely on workspace `node_modules` at runtime — either bundle it (esbuild, like api-server) or write it dependency-free (node builtins only, like planalert's static server).

**Why:** An Express-based production server for planalert crash-looped silently on deploy (`import express` failed, no stderr in deployment logs, healthchecks 500'd, port never bound) because the deployment image doesn't include installed workspace packages. Rewriting it with only `node:http` fixed it.

**How to apply:** When adding/changing a production `run` command in an artifact.toml, check every runtime import resolves without node_modules. Also launch with `node` directly rather than `pnpm --filter ... run ...` — pnpm adds seconds to autoscale cold starts, causing healthcheck 500 windows that look like stale/broken content.
