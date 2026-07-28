---
name: Shared package rebuild
description: The @fincava/shared package must be rebuilt after every merge/pull, or the server crashes with "does not provide an export named '...'" errors.
---

# Shared package must be rebuilt after every merge

**Rule:** After any `git pull`, merge, or new dependency install, always run `npm run build --workspace shared` before starting or restarting the server.

**Why:** `@fincava/shared` is a compiled TypeScript workspace (`dist/index.js` is the entry point). If the source gains a new export (e.g. `getPricingDisplay` added in Phase 1) but `dist/` is stale from a prior build, the server crashes at import time with `SyntaxError: The requested module '@fincava/shared' does not provide an export named '...'`.

**How to apply:** The post-merge script at `scripts/post-merge.sh` already handles this automatically. If you ever start the server manually after pulling, run `npm run build --workspace shared` first.
