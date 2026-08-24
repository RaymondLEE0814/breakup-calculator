import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/**
 * Removes ./dist and ./.wrangler before a build or deploy.
 *
 * Both tools clear these directories themselves, and on Windows both do it
 * with the synchronous `fs.rmSync(..., { recursive: true })`. On this
 * project's path — which contains non-ASCII characters — that call aborts the
 * Node process outright: exit code 127, no error, no stack.
 *
 * The symptoms differ but the cause is the same:
 *   - `astro build` dies before bundling, so every build after the first fails.
 *   - `wrangler deploy` dies before uploading anything, printing only its
 *     banner, so the deploy silently does nothing.
 *
 * The asynchronous `fs.rm` is unaffected, so we clear both directories here
 * first and neither tool finds anything left to remove.
 *
 * Note that `wrangler deploy` still exits 127 while tearing down, *after* it
 * has uploaded and registered routes. Its exit code is therefore not a
 * reliable success signal on this machine — read its output, or check the
 * live URL. Cloudflare's own Linux builders are unaffected.
 *
 * A running `wrangler dev` also holds ./dist open; stop it before building.
 */
const here = (p) => fileURLToPath(new URL(p, import.meta.url));

await Promise.all([
  rm(here('../dist'), { recursive: true, force: true }),
  rm(here('../.wrangler'), { recursive: true, force: true }),
]);
