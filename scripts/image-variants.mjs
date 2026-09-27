#!/usr/bin/env node
/**
 * Pre-built responsive images for the static export (see src/lib/image-loader.ts).
 *
 *   node scripts/image-variants.mjs            generate public/_img/** (runs before dev and build)
 *   node scripts/image-variants.mjs --verify   check every /_img/ URL in out/ exists (after build)
 *
 * Each raster in the SOURCES folders is written once per width in image-widths.json as
 * `public/_img/<path.ext>-<width>.webp`, quality 90 with full-resolution colour, never upscaled
 * (widths above the source reuse the full-size file). Generation is incremental: unchanged
 * sources are skipped. public/_img is git-ignored and rebuilt on every deploy.
 */
import { copyFile, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");
const OUT_DIR = join(PUBLIC, "_img");
const SOURCES = ["brand", "team", "portfolio"];
const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const { deviceSizes, imageSizes } = JSON.parse(await readFile(join(ROOT, "scripts/image-widths.json"), "utf8"));
const WIDTHS = [...new Set([...imageSizes, ...deviceSizes])].sort((a, b) => a - b);

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const mtime = (p) => stat(p).then((s) => s.mtimeMs, () => 0);

async function generate() {
  if (process.argv.includes("--clean")) await rm(OUT_DIR, { recursive: true, force: true });
  let written = 0;
  let skipped = 0;
  for (const folder of SOURCES) {
    for await (const file of walk(join(PUBLIC, folder))) {
      if (!RASTER.has(extname(file).toLowerCase())) continue;
      const rel = relative(PUBLIC, file); // keeps the extension: logo.png and logo.webp stay distinct
      const srcTime = await mtime(file);
      const targets = WIDTHS.map((w) => ({ w, path: join(OUT_DIR, `${rel}-${w}.webp`) }));
      const times = await Promise.all(targets.map((t) => mtime(t.path)));
      if (times.every((t) => t >= srcTime)) {
        skipped++;
        continue;
      }
      await mkdir(dirname(targets[0].path), { recursive: true });
      const { width: srcWidth } = await sharp(file).metadata();
      let full = null; // first target at or above the source width holds the full-size file
      for (const t of targets) {
        if (t.w >= srcWidth && full) {
          await copyFile(full, t.path);
          continue;
        }
        await sharp(file)
          .rotate()
          .resize({ width: t.w, withoutEnlargement: true })
          .webp({ quality: 90, alphaQuality: 100, smartSubsample: true })
          .toFile(t.path);
        if (t.w >= srcWidth) full = t.path;
      }
      written++;
    }
  }
  console.log(`image variants: ${written} source(s) written, ${skipped} unchanged (${WIDTHS.length} widths each)`);
}

async function verify() {
  const out = join(ROOT, "out");
  const refs = new Set();
  for await (const file of walk(out)) {
    if (!/\.(html|txt|js|css)$/.test(file)) continue;
    const text = await readFile(file, "utf8");
    for (const m of text.matchAll(/\/_img\/[^"'\s,)\\]+?-\d+\.webp/g)) refs.add(m[0]);
  }
  const missing = [];
  for (const url of refs) if (!(await mtime(join(out, url)))) missing.push(url);
  if (missing.length) {
    console.error(`image variants: ${missing.length} referenced file(s) missing from out/:\n  ${missing.slice(0, 20).join("\n  ")}`);
    process.exit(1);
  }
  if (refs.size === 0) {
    console.error("image variants: no /_img/ references found in out/ — is the custom loader active?");
    process.exit(1);
  }
  console.log(`image variants: all ${refs.size} referenced files present in out/`);
}

if (process.argv.includes("--verify")) await verify();
else await generate();

