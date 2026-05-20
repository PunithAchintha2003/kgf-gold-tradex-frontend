#!/usr/bin/env node
/**
 * Copy MediaPipe Tasks Vision WASM bundle from the installed npm package
 * into `public/mediapipe/wasm` so Vite serves them from our own origin.
 *
 * We do NOT rely on jsDelivr's `@mediapipe/tasks-vision@<version>/wasm` URL
 * because:
 *   - Pinning a version that doesn't exist on npm returns 404.
 *   - The actual runtime version must match the JS bundle we install; the
 *     two are released as a matched pair.
 *
 * This script runs automatically on `postinstall`, `predev`, and `prebuild`.
 */

import { mkdirSync, copyFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');
const src = resolve(projectRoot, 'node_modules/@mediapipe/tasks-vision/wasm');
const dest = resolve(projectRoot, 'public/mediapipe/wasm');

if (!existsSync(src)) {
  console.warn(
    '[mediapipe] WARN: @mediapipe/tasks-vision is not installed yet. Skipping WASM copy.'
  );
  process.exit(0);
}

if (existsSync(dest)) {
  rmSync(dest, { recursive: true, force: true });
}
mkdirSync(dest, { recursive: true });

const files = readdirSync(src);
let copied = 0;
for (const f of files) {
  if (!/\.(js|wasm)$/i.test(f)) continue;
  copyFileSync(join(src, f), join(dest, f));
  copied += 1;
}

console.log(`[mediapipe] Copied ${copied} WASM/JS asset(s) → public/mediapipe/wasm/`);
