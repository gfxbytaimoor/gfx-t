"use client";

import { useRef } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

registerGsap();

type Props = {
  year: number | string;
  /** "x": paper fills left→right (Home). "y": signal rises bottom→top (About, pinned). */
  fill: "x" | "y";
  /** Scroll range: the mark itself, or its enclosing <section> when the mark is pinned. */
  track?: "self" | "section";
  className?: string;
};

/**
 * The founding year as an outline that fills with scroll. Decorative (aria-hidden): the year is
 * always stated in the surrounding copy.
 */
export function YearMark({ year, fill, track = "self", className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      const trigger = track === "section" ? (ref.current.closest("section") ?? ref.current) : ref.current;
      gsap.fromTo(
        "[data-fill]",
        { clipPath: fill === "x" ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger:
            track === "section"
              ? { trigger, start: "top 60%", end: "bottom bottom", scrub: true }
              : { trigger, start: "top 85%", end: "bottom 35%", scrub: true },
        },
      );
    },
    { scope: ref, dependencies: [reduced, fill, track], revertOnUpdate: true },
  );

  const type = "block font-display text-[length:var(--year-size)] font-bold leading-[0.8] tracking-[-0.04em] [font-variation-settings:'wdth'_112]";
  return (
    <div ref={ref} aria-hidden className={cn("relative w-fit", className)}>
      <span className={cn(type, "text-transparent [-webkit-text-stroke:1px_var(--color-ink-500)]")}>{year}</span>
      <span data-fill className={cn(type, "absolute inset-0", fill === "x" ? "text-paper" : "text-signal")}>
        {year}
      </span>
    </div>
  );
}
