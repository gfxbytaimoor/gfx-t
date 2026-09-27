"use client";

import { useRef, useState } from "react";
import { MobileShapes } from "@/components/ui/MobileShapes";
import { services } from "@/data/services";
import { servicesTeaser } from "@/data/company";
import { gsap, ScrollTrigger, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { ActionLink } from "@/components/buttons/ActionLink";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { SectionLabel } from "@/components/typography/SectionLabel";
import { ServiceGlyph } from "@/components/ui/ServiceGlyph";
import { cn } from "@/lib/cn";

registerGsap();

/**
 * SERVICES — the one paper chapter with signal yellow at full strength. A sticky preview card
 * draws the active service's glyph; the list on the right follows scroll (and hover), rows wipe
 * yellow on hover, and an oversized pen-tool curve draws itself behind the section.
 */
export function ServicesTeaser() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const current = services[active];

  useGSAP(
    () => {
      if (reduced) return;
      // Background pen path draws across the section as it scrolls through.
      gsap.fromTo(
        "[data-bg-path]",
        { drawSVG: "0%" },
        { drawSVG: "100%", ease: "none", scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 60%", scrub: true } },
      );
      gsap.from("[data-bg-point]", {
        scale: 0,
        transformOrigin: "50% 50%",
        stagger: 0.15,
        scrollTrigger: { trigger: ref.current, start: "top 60%", once: true },
      });
      // Each row slides in as it reaches the viewport (per row, so long mobile lists work too).
      gsap.utils.toArray<HTMLElement>("[data-service-row]").forEach((row) =>
        gsap.from(row, { xPercent: 6, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: row, start: "top 92%", once: true } }),
      );
      // The active service follows the scroll position (on touch screens this is the only way
      // rows light up, since there is no hover).
      gsap.utils.toArray<HTMLElement>("[data-service-row]").forEach((row, i) =>
        ScrollTrigger.create({ trigger: row, start: "top 60%", end: "bottom 60%", onToggle: (st) => st.isActive && setActive(i) }),
      );
    },
    { scope: ref, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section ref={ref} aria-labelledby="services-teaser-heading" className="relative isolate overflow-hidden bg-paper py-[var(--spacing-section)] text-ink-950">
      {/* Background: artboard dots + one oversized pen-tool curve with its anchors and handles. */}
      <div aria-hidden className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(rgb(11_11_11/0.12)_1px,transparent_1.2px)] [background-size:28px_28px]" />
      <svg aria-hidden viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 -z-10 h-full w-full">
        <path d="M-40 640 C 220 640, 300 160, 600 190 S 980 700, 1240 260" fill="none" stroke="rgb(11 11 11 / 0.14)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <path data-bg-path d="M-40 640 C 220 640, 300 160, 600 190 S 980 700, 1240 260" fill="none" stroke="var(--color-signal)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        <g stroke="rgb(11 11 11 / 0.35)" strokeWidth="1" vectorEffect="non-scaling-stroke">
          <line x1="360" y1="175" x2="840" y2="205" />
          <line x1="60" y1="640" x2="220" y2="640" />
        </g>
        {[
          [600, 190, "sq"],
          [60, 640, "sq"],
          [1240, 260, "sq"],
          [360, 175, "c"],
          [840, 205, "c"],
          [220, 640, "c"],
        ].map(([x, y, k]) =>
          k === "sq" ? (
            <rect key={`${x}-${y}`} data-bg-point x={Number(x) - 7} y={Number(y) - 7} width="14" height="14" fill="var(--color-signal)" stroke="var(--color-ink-950)" strokeWidth="1.5" />
          ) : (
            <circle key={`${x}-${y}`} data-bg-point cx={x} cy={y} r="5" fill="var(--color-ink-950)" />
          ),
        )}
      </svg>

      <MobileShapes variant={1} tone="paper" />
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Sticky intro + live preview */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)]">
            <SectionLabel index="04" tone="paper">
              Services
            </SectionLabel>
            <SectionHeading id="services-teaser-heading" accent="Services" tone="paper" className="mt-8">
              {servicesTeaser.heading}
            </SectionHeading>
            <p className="mt-6 max-w-md text-lead text-ink-800">{servicesTeaser.body}</p>

            <div aria-hidden className="relative mt-10 hidden aspect-[5/4] max-w-md overflow-hidden bg-signal p-6 lg:flex lg:flex-col lg:justify-between">
              <div className="label flex justify-between text-ink-950">
                <span>{current.index} / {String(services.length).padStart(2, "0")}</span>
                <span>Now viewing</span>
              </div>
              <ServiceGlyph glyph={current.glyph} tone="paper" play replayKey={active} className="mx-auto size-32" />
              <p className="font-display text-2xl font-extrabold uppercase leading-none">{current.title}</p>
              <span className="absolute -bottom-10 -right-10 size-40 rotate-45 border border-ink-950/20" />
            </div>

            <div className="mt-10">
              <ActionLink href="/services" variant="primary" tone="paper" size="lg">
                All services
              </ActionLink>
            </div>
          </div>
        </div>

        {/* Service rows */}
        <ol data-service-list className="border-t border-ink-950/15 lg:col-span-7">
          {services.map((s, i) => {
            const on = active === i;
            return (
              <li key={s.slug} data-service-row className="border-b border-ink-950/15">
                <TransitionLink
                  href={`/services#${s.slug}`}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group relative isolate grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 overflow-hidden px-2 py-6 sm:gap-5 sm:px-3 md:gap-8 md:px-5 md:py-8"
                >
                  {/* Yellow wipe on hover / when active */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -inset-y-1 -left-[10%] -z-10 w-[120%] skew-x-[-18deg] bg-signal transition-transform duration-500 ease-[var(--ease-out-expo)]",
                      on ? "translate-x-0" : "-translate-x-full group-hover:translate-x-0",
                    )}
                  />
                  <span className={cn("label grid size-10 place-items-center transition-colors duration-500", on ? "bg-ink-950 text-signal" : "border border-ink-950/25 text-ink-950")}>
                    {s.index}
                  </span>
                  <span>
                    <span className="block break-words font-display text-[clamp(1.1rem,0.8rem+1.3vw,2.1rem)] font-extrabold uppercase leading-none tracking-[-0.01em] [hyphens:auto]">
                      {s.title}
                    </span>
                    <span className="mt-2 block max-w-lg text-sm leading-relaxed text-ink-800">{s.description}</span>
                  </span>
                  <span className="flex items-center gap-4">
                    <ServiceGlyph glyph={s.glyph} tone="paper" play={on} className="hidden size-8 min-[400px]:block md:size-10" />
                    <span className={cn("grid size-10 place-items-center transition-colors duration-500", on ? "bg-ink-950 text-signal" : "border border-ink-950/25")}>
                      <svg viewBox="0 0 16 16" className={cn("size-3.5 transition-transform duration-500", on ? "rotate-0" : "-rotate-45")} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                        <path d="M2 8h11M9 4l4 4-4 4" />
                      </svg>
                    </span>
                  </span>
                </TransitionLink>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
