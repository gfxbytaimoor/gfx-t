import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No on-screen Next.js badge in development (it sat in the hero's bottom-left corner).
  devIndicators: false,
  images: {
    // AVIF first (smallest), WebP fallback. Portfolio and portraits are served through next/image.
    formats: ["image/avif", "image/webp"],
    // 90 is used for artwork and portraits (see src/lib/image.ts); 75 stays the default elsewhere.
    qualities: [75, 85, 90],
  },
};

export default nextConfig;
