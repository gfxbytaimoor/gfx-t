"use client";

import Image from "next/image";
import { MobileShapes } from "@/components/ui/MobileShapes";
import { useRef, useState } from "react";
import { whyChooseUs, whyChooseUsPoints } from "@/data/company";
import { gsap, SplitText, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { SectionLabel } from "@/components/typography/SectionLabel";
import { cn } from "@/lib/cn";

registerGsap();

/** One ring per commitment: radius, orbit period (s), start angle (deg). */
const RINGS = [
  { r: 92, period: 38, start: -40 },
  { r: 142, period: 52, start: 150 },
  { r: 192, period: 70, start: 40 },
] as const;

/**
 * WHY CHOOSE US — ink, paper and signal in balance. The heading is set like the wordmark; the
 * statement sits on a paper card and inks in with scroll; an orbit illustration fills the right:
 * the GFX-T nib at the centre, one drawn ring per commitment, each with an anchor in slow orbit.
 * Hovering a commitment lights its ring.
 */
export function WhyChooseUs() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [focus, setFocus] = useState<number | null>(null);

  useGSAP(
    () => {
      if (reduced) return;
      SplitText.create("[data-statement]", {
        type: "words",
        aria: "auto",
        autoSplit: true,
        onSplit: (self) =>
          gsap.fromTo(
            self.words,
            // Opacity rather than colour: GSAP can't interpolate between CSS variables.
            { opacity: 0.2 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              scrollTrigger: { trigger: "[data-statement]", start: "top 85%", end: "bottom 55%", scrub: true },
            },
          ),
      });
      gsap
        .timeline({ scrollTrigger: { trigger: "[data-orbit]", start: "top 80%", once: true } })
        .from("[data-ring]", { drawSVG: "0%", duration: 1.6, stagger: 0.18, ease: "gfx.inOut" })
        .from("[data-core]", { scale: 0.6, autoAlpha: 0, duration: 0.9 }, 0.3)
        .from("[data-sat]", { scale: 0, autoAlpha: 0, duration: 0.6, stagger: 0.12 }, 0.9);
    },
    { scope: ref, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section ref={ref} aria-labelledby="why-heading" className="relative isolate overflow-hidden bg-ink-950 pb-[var(--spacing-section)] pt-14 md:pt-24">
      {/* Subtle signal glow + the logo's slash as texture. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_85%_35%,rgb(255_191_1/0.13),transparent_70%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.05] [background-image:repeating-linear-gradient(-56deg,var(--color-paper)_0_1px,transparent_1px_22px)] [mask-image:linear-gradient(90deg,transparent,black_60%)]" />

      <MobileShapes variant={1} />
      <div className="container-page grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <SectionLabel index="08">Our promise</SectionLabel>
          <h2
            id="why-heading"
            className="group/why mt-8 font-logo text-[clamp(2.6rem,1rem+6vw,7.5rem)] leading-[0.9] text-paper"
          >
            Why choose{" "}
            <span className="inline-block bg-signal px-[0.14em] text-ink-950 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/why:-rotate-3">
              us
            </span>
          </h2>

          <div data-reveal className="relative mt-10 bg-paper p-6 text-ink-950 md:mt-14 md:p-9">
            <span aria-hidden className="absolute left-0 top-0 h-full w-1.5 bg-signal" />
            <p
              data-statement
              className="font-display text-[clamp(1.15rem,0.85rem+1.1vw,1.9rem)] font-semibold leading-[1.3] tracking-[-0.01em]"
            >
              {whyChooseUs.body}
            </p>
          </div>
        </div>

        <div className="lg:col-span-5">
          {/* Orbit illustration */}
          <div data-orbit aria-hidden className="relative mx-auto aspect-square w-full max-w-[440px] [container-type:inline-size]">
            <svg viewBox="-220 -220 440 440" className="absolute inset-0 h-full w-full overflow-visible">
              <circle r="46" fill="none" stroke="rgb(243 240 232 / 0.08)" />
              {RINGS.map((ring, i) => (
                <circle
                  key={ring.r}
                  data-ring
                  r={ring.r}
                  fill="none"
                  strokeWidth={focus === i ? 2 : 1}
                  strokeDasharray={i === 1 ? "4 6" : undefined}
                  className={cn("transition-[stroke] duration-500", focus === i ? "stroke-signal" : "stroke-paper/20")}
                  transform="rotate(-90)"
                />
              ))}
              {/* Crosshair, like an artboard guide. */}
              <path d="M-215 0 H-60 M60 0 H215 M0 -215 V-60 M0 60 V215" stroke="rgb(243 240 232 / 0.07)" strokeDasharray="2 6" />
            </svg>

            {/* Satellites: one anchor per commitment, each on its own orbit. */}
            {RINGS.map((ring, i) => (
              <div
                key={ring.r}
                className="absolute inset-0 motion-safe:animate-[spin_var(--period)_linear_infinite]"
                style={{ "--period": `${ring.period}s`, rotate: `${ring.start}deg`, animationDirection: i === 1 ? "reverse" : "normal" } as React.CSSProperties}
              >
                <span
                  data-sat
                  className={cn(
                    "absolute left-1/2 top-1/2 grid size-9 place-items-center font-mono text-[0.7rem] transition-colors duration-500",
                    focus === i ? "bg-signal text-ink-950" : "border border-signal bg-ink-950 text-signal",
                  )}
                  style={{ transform: `translate(-50%, -50%) translateY(-${(ring.r / 440) * 100}cqw)` }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}

            {/* Core: the GFX-T nib on signal. */}
            <div data-core className="absolute left-1/2 top-1/2 grid size-[22%] -translate-x-1/2 -translate-y-1/2 place-items-center bg-signal shadow-[0_0_60px_rgb(255_191_1/0.35)]">
              <Image src="/brand/gfxt-pen-paper.png" alt="" width={188} height={158} unoptimized className="w-[62%] invert" />
            </div>
          </div>

          {/* The three commitments (from the Why Choose Us copy). */}
          <ul className="mt-8 grid gap-2">
            {whyChooseUsPoints.map((p, i) => (
              <li
                key={p}
                onPointerEnter={() => setFocus(i)}
                onPointerLeave={() => setFocus(null)}
                className={cn(
                  "label flex cursor-default items-center gap-4 border px-4 py-3.5 font-medium transition-colors duration-300",
                  focus === i ? "border-signal bg-signal text-ink-950" : "border-ink-700 text-paper",
                )}
              >
                <span className={focus === i ? "text-ink-950" : "text-signal"}>{String(i + 1).padStart(2, "0")}</span>
                {p}
                <span aria-hidden className="ml-auto h-px w-8 bg-current opacity-50" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
