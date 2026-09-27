"use client";

import { useRef } from "react";
import { aboutDisciplines } from "@/data/company";
import { site } from "@/lib/site";
import { ScrollTrigger, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

registerGsap();

const STAGES = [
  { caption: "Founded", label: String(site.founded) },
  ...aboutDisciplines.map((d) => ({ caption: "Grew into", label: d })),
  { caption: "Now", label: "Today" },
];

/**
 * 2020 → today as one lit path. A signal-yellow line fills with scroll and each stage ignites as
 * the line reaches it. Horizontal on large screens, vertical on small ones. The nodes are the
 * disciplines named in the About copy; no dates are attached because the source gives none.
 */
export function GrowthPath({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-node]"));
      const set = (p: number) => {
        root.style.setProperty("--p", p.toFixed(4));
        nodes.forEach((n, i) => (n.dataset.on = String(p >= i / (nodes.length - 1) - 0.02)));
      };
      if (reduced) return set(1);
      set(0);
      ScrollTrigger.create({
        trigger: root,
        start: "top 78%",
        end: "bottom 40%",
        scrub: 0.4,
        onUpdate: (self) => set(self.progress),
      });
    },
    { scope: ref, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <div
      ref={ref}
      style={{ "--p": 0 } as React.CSSProperties}
      className={cn(
        "relative overflow-hidden border border-ink-800 bg-[radial-gradient(120%_140%_at_0%_0%,rgb(255_191_1/0.08),transparent_55%),var(--color-ink-900)] px-6 pb-6 pt-6 md:px-10 md:pb-8 md:pt-8",
        className,
      )}
    >
      <div className="label flex items-center justify-between text-ink-400">
        <span>
          <span className="text-signal">{site.founded}</span> → Today
        </span>
        <span>Our path</span>
      </div>

      <div className="relative mt-8 lg:mt-10">
        {/* Track + lit progress (vertical on mobile, horizontal on large screens). */}
        <div aria-hidden className="absolute bottom-2 left-[9px] top-2 w-px bg-ink-700 lg:bottom-auto lg:left-0 lg:right-0 lg:top-[9px] lg:h-px lg:w-auto" />
        <div
          aria-hidden
          className="absolute bottom-2 left-[8px] top-2 w-[3px] origin-top bg-gradient-to-b from-signal to-signal-deep shadow-[0_0_18px_rgb(255_191_1/0.55)] [transform:scaleY(var(--p))] lg:bottom-auto lg:left-0 lg:right-0 lg:top-[8px] lg:h-[3px] lg:w-auto lg:origin-left lg:bg-gradient-to-r lg:[transform:scaleX(var(--p))]"
        />

        <ol className="relative flex flex-col gap-9 lg:grid lg:grid-cols-6 lg:gap-6">
          {STAGES.map((s, i) => (
            <li key={s.label} data-node data-on="false" className="group flex items-start gap-5 lg:block">
              <span
                aria-hidden
                className="relative z-10 grid size-[19px] shrink-0 place-items-center border border-ink-500 bg-ink-950 transition-[background-color,border-color,box-shadow,transform] duration-500 group-hover:rotate-45 group-data-[on=true]:border-signal group-data-[on=true]:bg-signal group-data-[on=true]:shadow-[0_0_22px_rgb(255_191_1/0.65)]"
              >
                <span className="size-[5px] bg-ink-500 transition-colors duration-500 group-data-[on=true]:bg-ink-950" />
              </span>
              <div className="lg:mt-7">
                <p className="label flex items-center gap-2 text-ink-500 transition-colors duration-500 group-data-[on=true]:text-signal">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span aria-hidden className="h-px w-4 bg-current" />
                  {s.caption}
                </p>
                <p className="mt-2 font-display text-xl font-bold uppercase leading-tight text-ink-400 transition-[color,transform] duration-500 group-hover:translate-x-1 group-data-[on=true]:text-paper lg:text-[1.35rem]">
                  {s.label}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
