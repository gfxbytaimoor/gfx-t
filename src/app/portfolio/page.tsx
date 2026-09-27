import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/PageIntro";
import { PortfolioExhibition } from "@/components/portfolio/PortfolioExhibition";
import { portfolioIntro } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description: portfolioIntro,
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  return (
    <>
      <PageIntro index="04" eyebrow="Selected work" title="Our Portfolio" lead={portfolioIntro} />
      <section aria-label="Work" className="py-12 md:py-16">
        <PortfolioExhibition />
      </section>
    </>
  );
}

