import type { NextConfig } from "next";
import imageWidths from "./scripts/image-widths.json";

const nextConfig: NextConfig = {
  // Static site: `next build` writes plain files to out/, served by Cloudflare Pages (free plan,
  // no server). Every route is prerendered; nothing here needs a Node.js runtime.
  output: "export",
  // No on-screen Next.js badge in development (it sat in the hero's bottom-left corner).
  devIndicators: false,
  images: {
    // No optimisation server on a static host: sizes are pre-built by scripts/image-variants.mjs
    // (quality 90 WebP) and src/lib/image-loader.ts points next/image at them.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: imageWidths.deviceSizes,
    imageSizes: imageWidths.imageSizes,
    // Accepted `quality` values (see src/lib/image.ts); variants are always encoded at 90.
    qualities: [75, 85, 90],
  },
};

export default nextConfig;
