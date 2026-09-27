#!/usr/bin/env node
/**
 * Local preview of the static export in out/, resolving paths the way Cloudflare Pages does:
 * /about → about.html, /dir → dir/index.html, anything else → 404.html with status 404.
 *
 *   npm run build && npm start        (PORT env var, default 3000)
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const OUT = join(process.cwd(), "out");
const PORT = Number(process.env.PORT) || 3000;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const isFile = (p) => stat(p).then((s) => s.isFile(), () => false);

async function resolve(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, "");
  if (clean.startsWith("..")) return null;
  const base = join(OUT, clean);
  for (const candidate of [base, `${base}.html`, join(base, "index.html")]) {
    if (await isFile(candidate)) return candidate;
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  const file = await resolve(pathname);
  const target = file ?? join(OUT, "404.html");
  // Extensionless files (e.g. /opengraph-image) are PNGs in this project.
  const type = TYPES[extname(target)] ?? (pathname.startsWith("/opengraph-image") ? "image/png" : "application/octet-stream");
  try {
    const body = await readFile(target);
    res.writeHead(file ? 200 : 404, { "Content-Type": type });
    res.end(body);
  } catch {
    res.writeHead(500).end("out/ not found — run `npm run build` first.");
  }
}).listen(PORT, () => console.log(`Serving out/ at http://localhost:${PORT}`));
