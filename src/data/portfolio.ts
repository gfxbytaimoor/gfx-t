/**
 * Portfolio exhibition data.
 *
 * Nothing is invented:
 *  - every piece is titled with the brand whose name or mark appears in the artwork itself;
 *  - `clientSlug` is set only when that brand is also on the official client list (data/clients.ts);
 *  - `detail` says what the piece is, as read from the artwork;
 *  - brand identities are titled with the name written in the mark itself.
 *
 * Everything is the client's original export. Low-resolution crops from the company profile
 * (PDF) were removed; add them back only from original files.
 *
 * To add or upgrade work: put originals in `assets-src/portfolio/<slug>/`, run `npm run images`,
 * and add/update the entry below (width/height as printed by the script).
 */

export type PortfolioCategory = "social" | "campaign" | "branding" | "print";

export type PortfolioMedia = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** CSS object-position for square crops (e.g. "top" keeps a logo at the top of a tall post in view). */
  position?: string;
  /** Brand cards only: the file is a square artboard with its own background, shown edge to edge. */
  bleed?: boolean;
};

export type PortfolioProject = {
  slug: string;
  /** The brand named in the work. */
  title: string;
  /** What the piece is — shown under the brand name. */
  detail: string;
  /** Must match a client slug from `clients.ts` when the work is for a listed client. */
  clientSlug?: string;
  category: PortfolioCategory;
  services: string[];
  cover: PortfolioMedia;
  media: PortfolioMedia[];
};

export const portfolioCategories: { id: PortfolioCategory; label: string }[] = [
  { id: "social", label: "Social Media" },
  { id: "campaign", label: "Campaigns" },
  { id: "branding", label: "Branding" },
  { id: "print", label: "Print" },
];

export const portfolioNote = "Complete portfolio will be provided on client's request.";

/** Page lead — the content document's portfolio description, phrased for visitors. */
export const portfolioIntro =
  "A selection of our past creative work: social media posts, campaign ads and branding visuals, along with the brand and project logos we have designed.";

type Piece = [slug: string, file: string, width: number, height: number, brand: string, detail: string, clientSlug?: string, position?: string];

// Order: the twelve pieces the home page shows (in this sequence), then the rest of the wall —
// ordered so the portfolio columns finish level at 2, 3 and 4 columns — and the two billboards last.
const SOCIAL: Piece[] = [
  ["social-05", "gauchos", 1080, 1080, "Gauchos", "“Bigger & Better” reopening", "gauchos"],
  ["social-11", "boxpark-cheeto-burger", 2000, 2000, "Boxpark Pica", "Cheeto slider burger promotion", "boxpark-pica"],
  ["social-08", "lala", 1080, 1350, "Lala", "Mahar'jan festive collection teaser", "lala", "top"],
  ["social-09", "artisan-chocolate", 1080, 1080, "Artisan Coffee Roaster", "Chocolate dessert promotion"],
  ["social-10", "rickeys2", 1080, 1080, "Ricky's", "Delivery launch", "rickys"],
  ["social-15", "young-stunners", 1080, 1080, "Young Stunners × Asim Azhar", "#EatToTheBeat event artwork"],
  ["social-16", "easypaisa", 2000, 2000, "Easypaisa", "Easyverse activation"],
  ["social-25", "baskin-robbins-flavour-roll-call", 692, 858, "Baskin Robbins", "Flavour Roll Call giveaway", "baskin-robbins", "top"],
  ["social-07", "rickeys", 1080, 1080, "Ricky's", "Relocation announcement", "rickys"],
  ["social-23", "lala2", 1080, 1080, "Lala", "Vintage Swiss voile pre-booking", "lala"],
  ["social-24", "rickeys3", 1080, 1080, "Ricky's", "New location opening", "rickys"],
  ["social-12", "javandi2", 500, 500, "Javandi", "30% off sale", "javandi"],
  ["social-19", "baskins-robins3", 900, 1600, "Baskin Robbins", "Marketplace 204 store opening", "baskin-robbins"],
  ["social-04", "darkside-car-care", 2000, 2000, "Car Vogue", "DarkSide tyre cleaner promotion"],
  ["social-26", "javandi-luxury-event2", 2400, 2400, "Javandi", "Luxury Pret launch event", "javandi"],
  ["social-03", "high-life-massage-chair", 2400, 2400, "High Life", "iRest massage chair promotion"],
  ["social-14", "high-life-big-buy", 1080, 1080, "High Life", "Big Buy sale"],
  ["social-01", "javandi-luxury-event", 2400, 2400, "Javandi", "Luxury Pret launch event", "javandi"],
  ["social-27", "artisan-coffee", 1080, 1080, "Artisan Coffee Roaster", "Coffee promotion"],
  ["social-17", "baskin-robins", 2400, 1599, "Baskin Robbins", "31% off roll-up standees", "baskin-robbins"],
  ["social-22", "baskin-robins6", 1600, 1200, "Baskin Robbins", "Merchandise T-shirt design", "baskin-robbins"],
  ["social-18", "baskin-robins2", 1600, 1308, "Baskin Robbins", "Lake City standee designs", "baskin-robbins"],
  ["social-20", "baskin-robins4", 1672, 941, "Baskin Robbins", "App launch billboard", "baskin-robbins"],
  ["social-21", "baskin-robins5", 1672, 941, "Baskin Robbins", "App launch billboard", "baskin-robbins"],
];

/**
 * Brand identities — [slug, file, width, height, name as written in the mark, full-bleed card?].
 * Full-bleed files are square artboards with their own background; the rest sit on a white card.
 */
const BRANDS: [string, string, number, number, string, boolean][] = [
  ["brand-seven-media", "seven-media", 640, 640, "Seven Media", true],
  ["brand-cruffles", "cruffles", 640, 640, "Cruffles", true],
  ["brand-abwaab", "abwaab", 462, 513, "Abwaab", false],
  ["brand-fuego-events", "fuego-events", 1080, 1080, "Fuego Events PR", true],
  ["brand-meeyaar", "meeyaar", 1080, 1080, "Meeyaar", true],
  ["brand-meet-me-in-paris", "meet-me-in-paris", 640, 640, "Meet Me in Paris", true],
  ["brand-zh-marketers", "zh-marketers", 1080, 1080, "ZH Marketers", true],
  ["brand-carne", "carne", 1080, 1080, "Carné Steakhouse", true],
  ["brand-vite-media", "vite-media", 1080, 1080, "Vitè Media", true],
  ["brand-bnm-industries", "bnm-industries", 1080, 1080, "BNM Industries", true],
  ["brand-tibbi", "tibbi", 447, 447, "Tibbi", false],
  ["brand-sentimental-extracts", "sentimental-extracts", 1080, 1080, "Sentimental Extracts", true],
  ["brand-aesthetics-lab", "aesthetics-lab", 1080, 1080, "Aesthetics Lab", true],
  ["brand-crust-culture", "crust-culture", 1080, 1080, "Crust Culture", true],
  ["brand-redwood", "redwood", 1080, 1080, "Redwood", true],
  ["brand-moxie", "moxie", 1080, 1080, "Moxie", true],
  ["brand-russos", "russos", 1080, 1080, "Russo's", true],
  ["brand-the-crown", "the-crown", 1080, 1080, "The Crown", true],
];

export const portfolio: PortfolioProject[] = [
  ...SOCIAL.map(([slug, file, width, height, brand, detail, clientSlug, position]): PortfolioProject => {
    const media = { src: `/portfolio/${slug}/${file}.webp`, width, height, alt: `${brand} — ${detail}, designed by GFX-T`, position };
    return { slug, title: brand, detail, clientSlug, category: "social", services: [], cover: media, media: [media] };
  }),
  ...BRANDS.map(([slug, file, width, height, name, bleed]): PortfolioProject => {
    const media = { src: `/portfolio/${slug}/${file}.webp`, width, height, alt: `${name} logo designed by GFX-T`, bleed };
    return { slug, title: name, detail: "Brand identity", category: "branding", services: ["Branding & Design"], cover: media, media: [media] };
  }),
];
