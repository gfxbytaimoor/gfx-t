#!/usr/bin/env node
/**
 * Works around a Windows-only bug in Next's static export (next/dist/export/index.js): per-segment
 * prefetch files are named by replacing "/" with "." in the segment path, but on Windows the path
 * holds "\" instead, so `about/__next.about.__PAGE__.txt` is written as
 * `about/__next.about/__PAGE__.txt`. The browser requests the dotted name, gets a 404, and link
 * prefetching silently fails.
 *
 * This flattens any such `__next.*` folder back into dotted file names. On Linux/macOS (including
 * the Cloudflare Pages build) Next writes the correct names and this finds nothing to do.
 */
import { readdir, rename, rm } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const OUT = join(process.cwd(), "out");

async function* files(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* files(p);
    else yield p;
  }
}

async function* segmentDirs(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = join(dir, e.name);
    if (e.name.startsWith("__next.")) yield p;
    else yield* segmentDirs(p);
  }
}

let moved = 0;
const dirs = [];
for await (const d of segmentDirs(OUT)) dirs.push(d);
for (const d of dirs) {
  for await (const f of files(d)) {
    const flat = `${d}.${relative(d, f).split(sep).join(".")}`;
    await rename(f, flat);
    moved++;
  }
  await rm(d, { recursive: true });
}
console.log(moved ? `export segments: renamed ${moved} prefetch file(s) (Windows path fix)` : "export segments: names already correct");
