/**
 * Client roster from the Word document, grouped by industry.
 *
 * Adding a logo: put the original at `assets-src/clients/<category>/<slug>.svg|png`, run
 * `npm run images`, and add its size to LOGOS below (SVG preferred, else a transparent PNG).
 * Entries without a logo render as a typographic wordmark, never a fake image.
 */

export type ClientCategory = "fashion" | "food" | "beauty" | "others";

export type ClientLogo = {
  src: string;
  width: number;
  height: number;
  /** Logos drawn dark-on-light need inverting on dark surfaces. */
  tone?: "dark" | "light" | "color";
};

export type Client = {
  slug: string;
  name: string;
  category: ClientCategory;
  logo?: ClientLogo;
};

export const clientCategories: { id: ClientCategory; label: string }[] = [
  { id: "fashion", label: "Fashion" },
  { id: "food", label: "Food" },
  { id: "beauty", label: "Beauty" },
  { id: "others", label: "Others" },
];

/**
 * Logos on file — the client's original artwork (trimmed to the mark; white-only marks recoloured
 * to ink so they read on paper). Saadi's Enterprises is still the crop from the company profile.
 * To replace one, re-run `npm run images` with the same file name; only width/height here change.
 */
const LOGOS: Record<string, [number, number]> = {
  "bellezza-salon": [680, 260],
  "rosmatic": [424, 420],
  "stylo": [442, 156],
  "suhairas-beauty-hub": [275, 109],
  "al-nasser": [362, 298],
  "divinely-crafted": [573, 420],
  "futbolux": [680, 164],
  "javandi": [400, 420],
  "lala": [416, 420],
  "munib-nawaz": [374, 244],
  "baskin-robbins": [680, 170],
  "boxpark-pica": [369, 127],
  "gauchos": [357, 91],
  "meet-me-in-paris": [680, 171],
  "rickys": [460, 246],
  "wild-wings": [398, 299],
  "fuego-events-pr": [450, 420],
  "gosaas-labs": [680, 309],
  "mb-marketing": [512, 420],
  "poepa": [233, 238],
  "saadis-enterprises": [222, 276],
  "tower-9-luxury-living": [213, 420],
};

const group = (category: ClientCategory, names: string[]): Client[] =>
  names.map((name) => {
    const slug = name
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const size = LOGOS[slug];
    return {
      name,
      category,
      slug,
      logo: size ? { src: `/clients/${category}/${slug}.webp`, width: size[0], height: size[1], tone: "color" } : undefined,
    };
  });

export const clients: Client[] = [
  ...group("fashion", ["Lala", "Munib Nawaz", "Javandi", "Al Nasser", "Futbolux", "Divinely Crafted"]),
  ...group("food", ["Baskin Robbins", "Gauchos", "Wild Wings", "Boxpark Pica", "Ricky's", "Meet Me in Paris"]),
  ...group("beauty", ["Bellezza Salon", "Stylo", "Suhaira's Beauty Hub", "Rosmatic"]),
  ...group("others", ["POEPA", "MB Marketing", "Saadi's Enterprises", "Tower 9 Luxury Living", "Fuego Events PR", "GoSaaS Labs"]),
];
