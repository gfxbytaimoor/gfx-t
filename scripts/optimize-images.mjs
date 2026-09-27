#!/usr/bin/env node
/**
 * Prepares client-supplied images for the site.
 *
 *   assets-src/portfolio/<project-slug>/*.{jpg,png,webp,tif}  →  public/portfolio/<project-slug>/*.webp
 *   assets-src/clients/<category>/<client-slug>.{png,webp}     →  public/clients/<category>/<client-slug>.webp
 *   (SVG logos are copied unchanged.)
 *
 * Originals stay in assets-src/ (git-ignored). Output is resized to a sensible maximum and
 * re-encoded; next/image then serves AVIF/WebP at the right size per device. The script prints
 * the width/height of every file so entries in src/data/*.ts can be filled in directly.
 *
 * Usage: npm run images
 */
import { mkdir, readdir, copyFile, stat } from "node:fs/promises";
import { join, parse, relative } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = join(ROOT, "assets-src");
const OUT = join(ROOT, "public");
const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".avif"]);
const MAX_WIDTH = { portfolio: 2400, clients: 800 };

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(SRC))) {
  console.log("No assets-src/ folder yet. Put originals in assets-src/portfolio/ or assets-src/clients/.");
  process.exit(0);
}

for await (const file of walk(SRC)) {
  const rel = relative(SRC, file);
  const kind = rel.split(/[\\/]/)[0];
  if (!(kind in MAX_WIDTH)) continue;
  const { dir, name, ext } = parse(rel);
  await mkdir(join(OUT, dir), { recursive: true });

  if (ext.toLowerCase() === ".svg") {
    await copyFile(file, join(OUT, dir, name + ext));
    console.log(`copied  /${join(dir, name + ext).replaceAll("\\", "/")}`);
    continue;
  }
  if (!RASTER.has(ext.toLowerCase())) continue;

  const target = join(OUT, dir, `${name}.webp`);
  const info = await sharp(file)
    .rotate()
    .resize({ width: MAX_WIDTH[kind], withoutEnlargement: true })
    // High quality + full-resolution colour: edges of type and logos in design work stay crisp.
    .webp({ quality: kind === "clients" ? 90 : 92, alphaQuality: 100, smartSubsample: true })
    .toFile(target);
  console.log(`wrote   /${relative(OUT, target).replaceAll("\\", "/")}  { width: ${info.width}, height: ${info.height} }`);
}
