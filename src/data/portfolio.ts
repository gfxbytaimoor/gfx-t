/**
 * Portfolio exhibition data.
 *
 * Current pieces are the samples on the "Our Portfolio" page of the GFX-T company profile (PDF).
 * They are low-resolution crops, so the UI shows them at thumbnail scale. Nothing is invented:
 *  - a post names a client only when that client's wordmark is visible in the artwork AND the
 *    client is on the official list (data/clients.ts); otherwise no client is shown;
 *  - brand identities are titled with the name written in the mark itself.
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
  title: string;
  /** Must match a client slug from `clients.ts` when the work is for a listed client. */
  clientSlug?: string;
  /** Only when the client is identifiable from the work itself. */
  clientName?: string;
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

type Piece = [slug: string, file: string, width: number, height: number, client?: [slug: string, name: string]];

const SOCIAL: Piece[] = [
  ["social-01", "javandi-luxury-event", 280, 292, ["javandi", "Javandi"]],
  ["social-02", "pizza-post", 298, 298],
  ["social-03", "high-life-massage-chair", 300, 298],
  ["social-04", "darkside-car-care", 300, 298],
  ["social-05", "gauchos-bigger-better", 300, 300, ["gauchos", "Gauchos"]],
  ["social-06", "choice-of-meat", 300, 300],
  ["social-07", "rickys-fasting-nights", 298, 300, ["rickys", "Ricky's"]],
  ["social-08", "lala-vintage", 300, 300, ["lala", "Lala"]],
  ["social-09", "artisan-chocolate", 298, 300],
  ["social-10", "rickys-relocated", 298, 300, ["rickys", "Ricky's"]],
  ["social-11", "boxpark-cheeto-burger", 300, 300, ["boxpark-pica", "Boxpark Pica"]],
  ["social-12", "javandi-sale", 300, 300, ["javandi", "Javandi"]],
  ["social-13", "pre-booking-collection", 295, 292],
  ["social-14", "high-life-big-buy", 300, 300],
  ["social-15", "young-stunners", 298, 300],
  ["social-16", "easypaisa-easyverse", 300, 300],
  ["social-17", "baskin-robins", 2560, 1706],
  ["social-18", "baskin-robins2", 25000, 25000],
  ["social-19", "baskins-robins3", 300, 400],
  ["social-20", "baskin-robins4", 300, 300],
  ["social-21", "baskin-robins5", 300, 300],
  ["social-22", "baskin-robins6", 300, 300],
  ["social-23", "lala2", 300, 300],
  ["social-24", "rickeys3", 300, 300],

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
  ...SOCIAL.map(([slug, file, width, height, client]): PortfolioProject => {
    const title = client ? `${client[1]} — social post` : "Social media post";
    const media = { src: `/portfolio/${slug}/${file}.webp`, width, height, alt: client ? `Social media post designed by GFX-T for ${client[1]}` : "Social media post designed by GFX-T" };
    return { slug, title, clientSlug: client?.[0], clientName: client?.[1], category: "social", services: [], cover: media, media: [media] };
  }),
  ...BRANDS.map(([slug, file, width, height, name]): PortfolioProject => {
    const media = { src: `/portfolio/${slug}/${file}.webp`, width, height, alt: `${name} logo designed by GFX-T` };
    return { slug, title: name, category: "branding", services: ["Branding & Design"], cover: media, media: [media] };
  }),
];
