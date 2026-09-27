/**
 * Portfolio exhibition data.
 *
 * Nothing is invented:
 *  - every piece is titled with the brand whose name or mark appears in the artwork itself;
 *  - `clientSlug` is set only when that brand is also on the official client list (data/clients.ts);
 *  - `detail` says what the piece is, as read from the artwork;
 *  - brand identities are titled with the name written in the mark itself.
 *
 * Pieces 01–04, 06, 11, 13, 14 and the brand marks are low-resolution crops from the company
 * profile (PDF); replacing them with the original exports is the only way to make them sharper.
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

type Piece = [slug: string, file: string, width: number, height: number, brand: string, detail: string, clientSlug?: string];

const SOCIAL: Piece[] = [
  ["social-01", "javandi-luxury-event", 280, 292, "Javandi", "Luxury Pret launch event", "javandi"],
  ["social-02", "pizza-post", 298, 298, "Fired Up", "Pizza promotion"],
  ["social-03", "high-life-massage-chair", 300, 298, "High Life", "iRest massage chair promotion"],
  ["social-04", "darkside-car-care", 300, 298, "Car Vogue", "DarkSide tyre cleaner promotion"],
  ["social-05", "gauchos", 1080, 1080, "Gauchos", "“Bigger & Better” reopening", "gauchos"],
  ["social-06", "choice-of-meat", 300, 300, "Lahore Hot Pot", "Menu promotion"],
  ["social-07", "rickeys", 1080, 1080, "Ricky's", "Relocation announcement", "rickys"],
  ["social-08", "lala", 1080, 1350, "Lala", "Mahar'jan festive collection teaser", "lala"],
  ["social-09", "artisan-chocolate", 1080, 1080, "Artisan Coffee Roaster", "Chocolate dessert promotion"],
  ["social-10", "rickeys2", 1080, 1080, "Ricky's", "Delivery launch", "rickys"],
  ["social-11", "boxpark-cheeto-burger", 300, 300, "Boxpark Pica", "Cheeto slider burger promotion", "boxpark-pica"],
  ["social-12", "javandi2", 500, 500, "Javandi", "30% off sale", "javandi"],
  ["social-13", "pre-booking-collection", 295, 292, "Zamurd Collection", "Pre-booking campaign"],
  ["social-14", "high-life-big-buy", 300, 300, "High Life", "Big Buy sale"],
  ["social-15", "young-stunners", 1080, 1080, "Young Stunners × Asim Azhar", "#EatToTheBeat event artwork"],
  ["social-16", "easypaisa", 2000, 2000, "Easypaisa", "Easyverse activation"],
  ["social-17", "baskin-robins", 2400, 1599, "Baskin Robbins", "31% off roll-up standees", "baskin-robbins"],
  ["social-18", "baskin-robins2", 1600, 1308, "Baskin Robbins", "Lake City standee designs", "baskin-robbins"],
  ["social-19", "baskins-robins3", 900, 1600, "Baskin Robbins", "Marketplace 204 store opening", "baskin-robbins"],
  ["social-20", "baskin-robins4", 1672, 941, "Baskin Robbins", "App launch billboard", "baskin-robbins"],
  ["social-21", "baskin-robins5", 1672, 941, "Baskin Robbins", "App launch billboard", "baskin-robbins"],
  ["social-22", "baskin-robins6", 1600, 1200, "Baskin Robbins", "Merchandise T-shirt design", "baskin-robbins"],
  ["social-23", "lala2", 1080, 1080, "Lala", "Vintage Swiss voile pre-booking", "lala"],
  ["social-24", "rickeys3", 1080, 1080, "Ricky's", "New location opening", "rickys"],
];

/** Brand identities — [slug, file, width, height, name as written in the mark]. */
const BRANDS: [string, string, number, number, string][] = [
  ["brand-tibbi", "tibbi", 275, 88, "Tibbi"],
  ["brand-meeyaar", "meeyaar", 348, 312, "Meeyaar"],
  ["brand-abwaab", "abwaab", 212, 250, "Abwaab"],
  ["brand-vite-media", "vite-media", 350, 335, "Vitè Media"],
  ["brand-sj-closet", "sj-closet", 330, 328, "SJ Closet"],
  ["brand-gbt-graphics", "gbt-graphics", 372, 352, "GBT Graphics"],
  ["brand-dnf-industries", "dnf-industries", 372, 298, "DNF Industries"],
  ["brand-bnm-industries", "bnm-industries", 272, 170, "BNM Industries"],
  ["brand-perplexion", "perplexion", 348, 345, "Perplexion"],
  ["brand-sentimental-extracts", "sentimental-extracts", 345, 348, "Sentimental Extracts"],
];

export const portfolio: PortfolioProject[] = [
  ...SOCIAL.map(([slug, file, width, height, brand, detail, clientSlug]): PortfolioProject => {
    const media = { src: `/portfolio/${slug}/${file}.webp`, width, height, alt: `${brand} — ${detail}, designed by GFX-T` };
    return { slug, title: brand, detail, clientSlug, category: "social", services: [], cover: media, media: [media] };
  }),
  ...BRANDS.map(([slug, file, width, height, name]): PortfolioProject => {
    const media = { src: `/portfolio/${slug}/${file}.webp`, width, height, alt: `${name} logo designed by GFX-T` };
    return { slug, title: name, detail: "Brand identity", category: "branding", services: ["Branding & Design"], cover: media, media: [media] };
  }),
];
