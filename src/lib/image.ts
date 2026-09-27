/**
 * Delivery settings for raster artwork served through next/image.
 *
 * - Small sources (logos, the preview crops from the company profile) are served as-is: resizing
 *   and re-encoding a ~300px file only adds blur and compression artefacts, and it is already
 *   smaller than any variant the optimizer could produce.
 * - Everything else goes through the pre-built responsive variants (scripts/image-variants.mjs,
 *   quality 90 — the default 75 visibly softens type and fine lines in design work).
 */
export const SMALL_SOURCE_MAX = 700;

export function artworkImageProps(width: number): { unoptimized: true } | { quality: 90 } {
  return width < SMALL_SOURCE_MAX ? { unoptimized: true } : { quality: 90 };
}
