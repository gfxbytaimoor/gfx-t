import type { MetadataRoute } from "next";
import { navigation } from "@/data/navigation";
import { site } from "@/lib/site";

// Generated once at build time (required by the static export).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return navigation.map((item) => ({
    url: new URL(item.href, site.url).toString(),
    changeFrequency: "monthly",
    priority: item.href === "/" ? 1 : 0.7,
  }));
}
