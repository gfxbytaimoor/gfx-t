"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Leader } from "@/data/management";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { RevealText } from "@/components/typography/RevealText";
import { ReachMap } from "./ReachMap";
import { cn } from "@/lib/cn";

registerGsap();

/**
 * Editorial profile. Shared structure, distinct treatment per leader: the CEO sits on paper
 * with the portrait leading; the COO on ink with the portrait trailing. The portrait is
 * revealed with a clip, never distorted or re-coloured.
 */
export function LeaderProfile({ leader, index }: { leader: Leader; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const paper = leader.surface === "paper";
  const flip = index % 2 === 1;

  // Last word of the name is set heavier and wider: "Syed Zamir A. / NAUSHAHI".
  const words = leader.name.split(" ");
  const family = words.pop();
  const given = words.join(" ");

  useGSAP(
    () => {
      if (reduced) return;
      // Desktop: the portrait also slides in from its own side (CEO from the left, COO from the right).
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.from("figure", {
          x: flip ? 180 : -180,
          autoAlpha: 0,
          duration: 1.3,
          ease: "gfx.out",
          scrollTrigger: { trigger: "figure", start: "top 85%", once: true },
        });
      });
      gsap
        .timeline({ scrollTrigger: { trigger: "[data-portrait]", start: "top 80%", once: true } })
        .fromTo("[data-portrait]", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "gfx.inOut" })
        .from("[data-portrait] img", { scale: 1.12, duration: 1.8, ease: "gfx.out" }, 0);
    },
    { scope: ref, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <article
      ref={ref}
      id={leader.slug}
      aria-labelledby={`${leader.slug}-name`}
      className={cn("overflow-x-clip py-12 md:py-[var(--spacing-section)]", paper ? "bg-paper text-ink-950" : "bg-ink-950 text-paper")}
    >
      <div className="container-page grid gap-6 md:grid-cols-12 md:gap-x-8 lg:gap-x-10">
        <figure className={cn("md:sticky md:top-[calc(var(--header-h)+2rem)] md:col-span-5 md:self-start", flip && "md:order-2 md:col-start-8")}>
          <div data-portrait className="relative aspect-[4/5] overflow-hidden bg-ink-850">
            <Image
              src={leader.portrait.src}
              alt={leader.portrait.alt}
              fill
              sizes="(max-width: 768px) 100vw, 42vw"
              quality={90}
              className="object-cover"
            />
          </div>
          <figcaption className={cn("label mt-4 flex justify-between", paper ? "text-ink-700" : "text-ink-400")}>
            <span>{leader.role}</span>
            <span>GFX-T — Lahore</span>
          </figcaption>
        </figure>

        {/* Mirrored 5 + 7 split: portrait and copy fill the full width on both profiles. */}
        <div className={cn("flex min-w-0 flex-col md:col-span-7", flip ? "md:order-1 md:col-start-1" : "md:col-start-6")}>
          <p className={cn("label flex items-center gap-3", paper ? "text-ink-700" : "text-ink-300")}>
            <span className={cn("size-2", paper ? "bg-ink-950" : "bg-signal")} aria-hidden />
            {leader.role}
          </p>
          <h2 id={`${leader.slug}-name`} className="mt-6 font-display uppercase leading-[0.9] tracking-[-0.02em]">
            <span className="block text-h3 font-medium">{given}</span>
            <span className="block text-h2 font-bold [font-variation-settings:'wdth'_118]">{family}</span>
          </h2>

          <div className={cn("mt-10 flex items-end gap-5 border-t pt-8", paper ? "border-ink-950/15" : "border-ink-800")}>
            <span className="font-display text-[clamp(4.5rem,3rem+6vw,9rem)] font-bold leading-[0.8] tracking-[-0.04em] [font-variation-settings:'wdth'_112]">
              {leader.experience.value}
            </span>
            <span className={cn("label pb-2", paper ? "text-ink-700" : "text-ink-300")}>{leader.experience.unit}</span>
          </div>

          <RevealText split="words" className={cn("mt-10 text-lead", paper ? "text-ink-800" : "text-paper/85")}>
            {leader.bio}
          </RevealText>

          <div className="mt-12">
            <p className={cn("label mb-4", paper ? "text-ink-700" : "text-ink-400")}>International experience</p>
            <ReachMap places={leader.reach} groupLabel={leader.reachLabel} tone={paper ? "paper" : "ink"} />
          </div>
        </div>
      </div>
    </article>
  );
}
