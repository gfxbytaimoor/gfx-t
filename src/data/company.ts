/**
 * Company copy. Verbatim from the Word document (the authoritative source);
 * only spelling was corrected where noted.
 */

export const aboutSummary =
  "GFX-T was founded in 2020 during the COVID era, starting as a small creative agency in Pakistan with a passion for delivering exceptional creative solutions. Since then, we have grown steadily, building a strong reputation for excellence in graphic design, branding, digital marketing, and content creation.";

export const aboutParagraphs = [
  aboutSummary,
  "At GFX-T, we believe in putting our clients first. We understand that every business has unique needs and challenges, which is why we work closely with our clients to develop customized solutions that align with their vision and exceed expectations. Our services include branding, social media management, digital marketing, design, content creation, and more. With a commitment to creativity, innovation, and client satisfaction, GFX-T continues to help businesses stand out in a competitive digital landscape.",
] as const;

export type Principle = { index: string; title: string; body: string };

/** Home "Vision card" copy. */
export const visionSummary =
  "To create impactful and innovative branding, design, and digital marketing solutions that help businesses establish a strong identity and thrive in a competitive market. We continuously push creative boundaries, integrating the latest trends and technologies to deliver unique and result-driven solutions for our clients.";

/** Home "Mission card" copy. */
export const missionSummary =
  "To deliver excellence through high-quality branding, design, and digital marketing solutions that drive growth and success for our clients — innovating continuously and building strong, long-term client partnerships.";

export const vision: Principle[] = [
  {
    index: "01",
    title: "Empowering Brands",
    body: "To create impactful and innovative branding, design, and digital marketing solutions that help businesses establish a strong identity and thrive in a competitive market.",
  },
  {
    index: "02",
    title: "Driving Creativity & Innovation",
    body: "To continuously push creative boundaries, integrating the latest trends and technologies to deliver unique and result-driven solutions for our clients.",
  },
];

export const mission: Principle[] = [
  {
    index: "01",
    title: "Deliver Excellence",
    body: "To provide high-quality branding, design, and digital marketing solutions that drive growth and success for our clients.",
  },
  {
    index: "02",
    title: "Innovate Continuously",
    body: "To stay ahead of industry trends, embracing creativity and technology to craft unique and effective strategies.",
  },
  {
    index: "03",
    title: "Build Strong Partnerships",
    body: "To foster long-term relationships with clients by understanding their needs and offering tailored solutions that exceed expectations.",
  },
];

export const servicesTeaser = {
  heading: "Our Exclusive Services",
  body: "We provide a comprehensive set of creative and marketing services covering every platform needed to make a brand successful.",
} as const;

export const clientsTeaser = {
  heading: "Our Prestigious Clients",
  body: "GFX-T is proud to have worked with leading names across fashion, food, beauty, and other industries.",
} as const;

export const whyChooseUs = {
  heading: "Why Choose Us",
  body: "We deliver excellence with a team that puts clients first. We understand that every business has unique needs and challenges, so we work closely with each client to develop customized solutions that align with their vision and exceed expectations - combining creativity, innovation, and a genuine commitment to client satisfaction.",
} as const;

export const closingCta = {
  heading: "Still Thinking?",
  body: "Let GFX-T bring your vision to life with creativity and innovation!",
} as const;

export const contactIntro =
  "Get in touch with us to elevate your brand with innovative design, marketing, and digital solutions - let's create something amazing together!";

/** The four disciplines named in the About summary, in the order the text lists them. */
export const aboutDisciplines = ["Graphic Design", "Branding", "Digital Marketing", "Content Creation"] as const;

/** Short labels for the three commitments made in the Why Choose Us copy (not new claims). */
export const whyChooseUsPoints = ["Clients first", "Customized solutions", "Creativity & innovation"] as const;
