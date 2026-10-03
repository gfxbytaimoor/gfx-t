import { aboutSummary } from "@/data/company";
import { MobileShapes } from "@/components/ui/MobileShapes";
import { site } from "@/lib/site";

const facts = [
  { term: "Founded", value: String(site.founded), note: "During the COVID era" },
  { term: "Based in", value: "Lahore", note: "Pakistan" },
  { term: "Led by", value: "30+ years", note: "Of media industry experience" },
];
import { ActionLink } from "@/components/buttons/ActionLink";
import { RevealText } from "@/components/typography/RevealText";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { SectionLabel } from "@/components/typography/SectionLabel";
import { GrowthPath } from "@/components/sections/shared/GrowthPath";
import { YearMark } from "@/components/typography/YearMark";

/**
 * ABOUT TEASER — editorial. The founding year is the anchor: an outline that fills with ink
 * as the visitor scrolls, followed by the growth path from 2020 to today.
 */
export function AboutTeaser() {
  return (
    <section aria-labelledby="about-teaser-heading" className="relative isolate bg-ink-950 py-[calc(var(--spacing-section)*0.5)] md:pt-[calc(var(--spacing-section)*0.2)]">
      <MobileShapes variant={1} />
      <div className="container-page">
        <SectionLabel index="02">About GFX-T</SectionLabel>

        <SectionHeading id="about-teaser-heading" accent="GFX-T" className="mt-8 max-w-[14ch]">
          Welcome to GFX-T
        </SectionHeading>

        <div className="mt-12 grid gap-x-12 gap-y-12 lg:mt-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {/* Year: outline underneath, solid copy revealed over it by scroll. */}
            <YearMark year={site.founded} fill="x" className="[--year-size:34vw] lg:[--year-size:min(19vw,20rem)]" />
            {/* Facts under the year, all taken from the company documents. */}
            <dl className="mt-10 grid gap-px bg-ink-800 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.term} data-reveal className="group bg-ink-950 p-5 transition-colors duration-500 hover:bg-ink-900">
                  <dt className="label flex items-center gap-2 text-ink-400">
                    <span aria-hidden className="size-1.5 bg-signal transition-transform duration-500 group-hover:rotate-45" />
                    {f.term}
                  </dt>
                  <dd className="mt-3 font-display text-lg font-bold uppercase leading-tight text-paper">{f.value}</dd>
                  <dd className="mt-1 text-sm text-paper/60">{f.note}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col justify-between gap-10 lg:col-span-5">
            <RevealText split="words" className="text-lead text-paper/85">
              {aboutSummary}
            </RevealText>
            <div>
              <ActionLink href="/about" variant="primary" size="lg">
                Read more
              </ActionLink>
            </div>
          </div>
        </div>

        {/* 2020 → today: the disciplines named in the copy, plotted on one path. */}
        <GrowthPath className="mt-20 lg:mt-28" />
      </div>
    </section>
  );
}
