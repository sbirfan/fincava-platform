#!/usr/bin/env node
/**
 * Fail-fast guard against a stale or missing @fincava/shared build.
 *
 * This has crashed the app twice in production: shared/dist lagging behind
 * shared/src causes a cryptic native `SyntaxError: does not provide an
 * export named '...'` at module-link time, which happens before ANY
 * application code runs — so it can't be caught from inside the server
 * process itself. This script runs as a separate pre-flight step (wired
 * via npm's `predev`/`prestart` lifecycle hooks in package.json) so it can
 * fail loudly, with a clear and specific message, before the real server
 * process ever starts.
 *
 * Deliberately does NOT auto-rebuild and continue: a missing/stale export
 * is a real integrity risk (client and server could silently disagree on
 * validation or pricing logic), so masking it and continuing in a
 * degraded state would be worse than the current loud crash — just
 * quieter. This exits non-zero and serves nothing until it's fixed.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sharedRoot = path.resolve(__dirname, '../../shared');
const sharedSrcDir = path.join(sharedRoot, 'src');
const sharedDistDir = path.join(sharedRoot, 'dist');
const REBUILD_HINT = 'run `npm run build --workspace shared` (from the repo root), then retry.';

function fail(message) {
  console.error(`\nFATAL: ${message}\n`);
  process.exit(1);
}

// Newest mtime among all files with the given extension under dir, recursively.
function newestMtime(dir, ext) {
  if (!existsSync(dir)) return 0;
  let newest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      newest = Math.max(newest, newestMtime(full, ext));
    } else if (entry.name.endsWith(ext)) {
      newest = Math.max(newest, statSync(full).mtimeMs);
    }
  }
  return newest;
}

if (!existsSync(path.join(sharedDistDir, 'index.js'))) {
  fail(`@fincava/shared has never been built (shared/dist/index.js is missing) — ${REBUILD_HINT}`);
}

const srcNewest = newestMtime(sharedSrcDir, '.ts');
const distNewest = newestMtime(sharedDistDir, '.js');

if (srcNewest > distNewest) {
  fail(
    `@fincava/shared build is stale — shared/src has changes not reflected in shared/dist — ${REBUILD_HINT}`,
  );
}

// Freshness (mtime) alone doesn't catch every failure mode (e.g. dist
// present and "fresh" by timestamp but genuinely broken) — actually load
// the package as the final check.
try {
  await import('@fincava/shared');
} catch (err) {
  const detail = err instanceof Error ? err.message : String(err);
  fail(`@fincava/shared failed to load (${detail}) — ${REBUILD_HINT}`);
}

console.log('✓ @fincava/shared build is present and up to date.');
