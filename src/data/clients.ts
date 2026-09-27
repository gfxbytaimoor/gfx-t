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
 * Logos currently on file — cropped from the "Our Prestigious Clients" page of the GFX-T company
 * profile (PDF), so they are low-resolution. Replace each with the client's original artwork by
 * re-running `npm run images` with the same file name; only width/height here may change.
 */
const LOGOS: Record<string, [number, number]> = {
  "bellezza-salon": [381, 120],
  "rosmatic": [258, 252],
  "stylo": [189, 222],
  "suhairas-beauty-hub": [318, 120],
  "al-nasser": [252, 213],
  "divinely-crafted": [456, 201],
  "futbolux": [477, 96],
  "javandi": [249, 258],
  "lala": [225, 261],
  "munib-nawaz": [318, 207],
  "baskin-robbins": [384, 87],
  "boxpark-pica": [375, 129],
  "gauchos": [303, 54],
  "meet-me-in-paris": [588, 126],
  "rickys": [285, 150],
  "wild-wings": [294, 219],
  "fuego-events-pr": [252, 237],
  "gosaas-labs": [336, 186],
  "mb-marketing": [273, 225],
  "poepa": [288, 297],
  "saadis-enterprises": [222, 276],
  "tower-9-luxury-living": [150, 294],
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
