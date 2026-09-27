import { Hero } from "@/components/sections/home/Hero";
import { AboutTeaser } from "@/components/sections/home/AboutTeaser";
import { VisionMission } from "@/components/sections/shared/VisionMission";
import { ServicesTeaser } from "@/components/sections/home/ServicesTeaser";
import { ClientsTeaser } from "@/components/sections/home/ClientsTeaser";
import { WorkTeaser } from "@/components/sections/home/WorkTeaser";
import { WhyChooseUs } from "@/components/sections/home/WhyChooseUs";
import { Leadership } from "@/components/sections/shared/Leadership";
import { ClosingCta } from "@/components/sections/home/ClosingCta";

/**
 * Home — surfaces alternate so each chapter reads distinctly:
 * ink (hero, about) → ink-900 (vision/mission) → paper (services) → ink (work) → paper (clients)
 * → ink (leadership) → ink (why) → ink (close).
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutTeaser />
      <VisionMission index="03" />
      <ServicesTeaser />
      <WorkTeaser />
      <ClientsTeaser />
      <Leadership index="07" />
      <WhyChooseUs />
      <ClosingCta />
    </>
  );
}
