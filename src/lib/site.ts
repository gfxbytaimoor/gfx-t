/**
 * Site-wide configuration. Content source of truth: "GFX-T_Website Content" Word document.
 *
 * Production domain: https://gfx-t.com (apex, no www). NEXT_PUBLIC_SITE_URL can override it, e.g.
 * for a staging deploy; canonical URLs, the sitemap, robots.txt and Open Graph tags all use it.
 */
export const site = {
  name: "GFX-T",
  legalName: "GFX-T Creative Agency",
  descriptor: "Creative Agency",
  // `||` not `??`: an env var that is set but empty must fall back too, or `new URL("")` breaks the build.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://gfx-t.com",
  founded: 2020,
  tagline:
    "At GFX-T, we craft unforgettable experiences, blending creativity, strategy, and innovation to elevate brands and create lasting impressions.",
  heroHeading: ["We Create.", "We Strategize.", "We Elevate."] as const,
  locale: "en_PK",
} as const;

export type Phone = { display: string; href: string; label?: string };

export const contact = {
  email: "info@gfx-t.com",
  phones: [
    { display: "+92 321 4006247", href: "tel:+923214006247" },
    { display: "+92 324 0321027", href: "tel:+923240321027" },
    { display: "+92 300 9453725", href: "tel:+923009453725", label: "CEO & Founder direct line" },
  ] satisfies Phone[],
  /**
   * Social profiles. `href: null` renders the icon without a link until the handle is supplied —
   * then set the full profile URL here and every icon on the site becomes a link.
   */
  social: [
    { name: "Instagram", href: "https://www.instagram.com/gfx.t_/" },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/gfx-t/" },
    { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61594761962092" },
  ] as { name: "Instagram" | "LinkedIn" | "Facebook"; href: string | null }[],
  /** The number the Word doc names for "book a call directly with our CEO". */
  ceoPhone: { display: "+92 300 9453725", href: "tel:+923009453725" } satisfies Phone,
  address: {
    street: "677-B, Faisal Town",
    city: "Lahore",
    country: "Pakistan",
    countryCode: "PK",
    full: "677-B, Faisal Town, Lahore, Pakistan",
  },
} as const;

export const mailto = (subject?: string) =>
  `mailto:${contact.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
