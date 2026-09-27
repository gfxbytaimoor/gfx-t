/**
 * next/image loader for the static export (Cloudflare Pages has no image optimisation server).
 *
 * `npm run build` / `npm run dev` first run scripts/image-variants.mjs, which writes every source
 * image in public/brand, public/team and public/portfolio as
 * `/_img/<path.ext>-<width>.webp` for each width in scripts/image-widths.json (quality 90, never
 * upscaled). This loader only has to point at those files. Images marked `unoptimized` bypass it.
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith("/")) return src;
  return `/_img${src}-${width}.webp`;
}
