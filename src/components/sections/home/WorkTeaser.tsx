"use client";

import Image from "next/image";
import { MobileShapes } from "@/components/ui/MobileShapes";
import { useRef } from "react";
import { portfolio, portfolioIntro } from "@/data/portfolio";
import { artworkImageProps } from "@/lib/image";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { ActionLink } from "@/components/buttons/ActionLink";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { SectionLabel } from "@/components/typography/SectionLabel";
import { TransitionLink } from "@/components/transitions/TransitionLink";

registerGsap();

const COLUMNS = 4;
/** Relative drift per column while the section crosses the viewport (percent of its height). */
const DRIFT = [-8, 6, -12, 4];

/** The first twelve posts, in the order set in data/portfolio.ts (dealt left to right, row by row). */
const TEASER_PIECES = portfolio.filter((p) => p.category === "social").slice(0, 12);

/**
 * SELECTED WORK — the proof chapter. Real posts from the portfolio hang in four columns that
 * drift at different speeds as the section scrolls past. Renders nothing until work exists.
 */
export function WorkTeaser() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const pieces = TEASER_PIECES;

  useGSAP(
    () => {
      if (reduced) return;
      gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((col, i) => {
        gsap.fromTo(
          col,
          { yPercent: -DRIFT[i % DRIFT.length] },
          {
            yPercent: DRIFT[i % DRIFT.length],
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: ref, dependencies: [reduced], revertOnUpdate: true },
  );

  if (pieces.length === 0) return null;
  const columns = Array.from({ length: COLUMNS }, (_, c) => pieces.filter((_, i) => i % COLUMNS === c));

  return (
    <section ref={ref} aria-labelledby="work-heading" className="relative isolate overflow-hidden bg-ink-950 py-[var(--spacing-section)]">
      <MobileShapes variant={0} />
      <div className="container-page grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionLabel index="05">Selected work</SectionLabel>
          <SectionHeading id="work-heading" accent="Portfolio" className="mt-8">
            Our Portfolio
          </SectionHeading>
        </div>
        <div className="flex flex-col justify-end gap-8 lg:col-span-5 lg:col-start-8">
          <p className="text-lead text-paper/85">{portfolioIntro}</p>
          <div>
            <ActionLink href="/portfolio" variant="primary" size="lg">
              View the portfolio
            </ActionLink>
          </div>
        </div>
      </div>

      <div className="container-page mt-16 grid grid-cols-2 gap-3 md:mt-24 md:grid-cols-4 md:gap-4">
        {columns.map((col, c) => (
          <div key={c} data-drift className={c > 1 ? "hidden flex-col gap-3 md:flex md:gap-4" : "flex flex-col gap-3 md:gap-4"}>
            {col.map((p) => (
              <TransitionLink
                key={p.slug}
                href="/portfolio"
                data-cursor="view"
                aria-label={`${p.title}, ${p.detail} — view in portfolio`}
                className="group relative block aspect-square overflow-hidden bg-ink-850"
              >
                <Image
                  src={p.cover.src}
                  alt={p.cover.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 22vw"
                  {...artworkImageProps(p.cover.width)}
                  style={p.cover.position ? { objectPosition: p.cover.position } : undefined}
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                />
              </TransitionLink>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
