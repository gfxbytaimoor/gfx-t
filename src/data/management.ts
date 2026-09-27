export type Leader = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  /** Headline figure for the editorial treatment. Taken directly from the bio text. */
  experience: { value: string; unit: string };
  /** Places named in the bio; drawn as paths from Lahore. */
  reach: string[];
  portrait: { src: string; width: number; height: number; alt: string };
  surface: "paper" | "ink";
};

export const managementHeading = "Introduction of Our CEO & Founder and COO";

export const leaders: Leader[] = [
  {
    slug: "syed-zamir-ahmad-naushahi",
    name: "Syed Zamir Ahmad Naushahi",
    role: "CEO & Founder",
    bio: "With over three decades of experience in the media industry, Syed Zamir Ahmad Naushahi founded GFX-T with a vision to redefine branding, design, and digital marketing. Having also lived and worked in the USA, he brings valuable international experience and global perspective to his work. As CEO and Founder, his leadership and expertise continue to drive innovation, delivering impactful solutions for businesses.",
    experience: { value: "30+", unit: "years in media" },
    reach: ["USA"],
    portrait: {
      src: "/team/syed-zamir-ahmad-naushahi.jpg",
      width: 1600,
      height: 2000,
      alt: "Portrait of Syed Zamir Ahmad Naushahi, CEO and Founder of GFX-T, seated in a grey suit",
    },
    surface: "paper",
  },
  {
    slug: "syed-taimoor-hassan-naushahi",
    name: "Syed Taimoor Hassan Naushahi",
    role: "COO / Creative Head",
    bio: "With 7 years of experience in local and multinational creative agencies, Syed Taimoor Hassan Naushahi serves as the COO and Creative Head of GFX-T. His leadership and expertise drive innovation, delivering impactful branding, design, and digital marketing solutions. He has also worked with clients across Qatar, UAE, UK, and Jordan bringing a diverse international perspective to every creative project.",
    experience: { value: "7", unit: "years in creative agencies" },
    reach: ["Qatar", "UAE", "UK", "Jordan"],
    portrait: {
      src: "/team/syed-taimoor-hassan-naushahi.jpg",
      width: 1600,
      height: 2000,
      alt: "Portrait of Syed Taimoor Hassan Naushahi, COO and Creative Head of GFX-T, standing in a studio",
    },
    surface: "ink",
  },
];
