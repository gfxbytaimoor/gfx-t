export type ServiceGlyph =
  | "bezier"
  | "signal"
  | "cursor"
  | "grid"
  | "registration"
  | "broadcast"
  | "camera"
  | "play";

export type Service = {
  slug: string;
  index: string;
  title: string;
  description: string;
  /** Visual identity used by the services interaction (drawn from the anchor/path language). */
  glyph: ServiceGlyph;
};

export const servicesIntro =
  "We provide a comprehensive set of services made available to meet every requirement and platform needed for making a brand successful.";

export const services: Service[] = [
  {
    slug: "branding-design",
    index: "01",
    title: "Branding & Design",
    description:
      "Crafting unique brand identities, logos, and visual content that leave a lasting impact.",
    glyph: "bezier",
  },
  {
    slug: "digital-marketing",
    index: "02",
    title: "Digital Marketing",
    description:
      "Implementing data-driven strategies for social media, paid campaigns to boost brand visibility.",
    glyph: "signal",
  },
  {
    slug: "content-writing-creation",
    index: "03",
    title: "Content Writing & Creation",
    description:
      "Producing high-quality graphics, videos, content, and compelling written content to engage and captivate audiences.",
    glyph: "cursor",
  },
  {
    slug: "social-media-management",
    index: "04",
    title: "Social Media Management",
    description:
      "Managing and optimizing social media platforms to enhance engagement and brand presence.",
    glyph: "grid",
  },
  {
    slug: "print-media",
    index: "05",
    title: "Print Media",
    description:
      "Crafting compelling visuals and copy for flyers, brochures, posters, and newspaper ads to effectively engage offline audiences and enhance brand presence.",
    glyph: "registration",
  },
  {
    slug: "public-relations",
    index: "06",
    title: "Public Relations (PR)",
    description:
      "Managing media outreach, press releases, and brand reputation to foster strong public perception and media presence.",
    glyph: "broadcast",
  },
  // Added at the client's request (not in the original content document); copy to be confirmed.
  {
    slug: "photography",
    index: "07",
    title: "Photography",
    description:
      "Capturing products, people, spaces, and events in striking imagery that brings a brand's story to life across every platform.",
    glyph: "camera",
  },
  {
    slug: "videography",
    index: "08",
    title: "Videography",
    description:
      "Producing engaging videos, from brand films and commercials to social media reels, that capture attention and tell a brand's story.",
    glyph: "play",
  },
];
