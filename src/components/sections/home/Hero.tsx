"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { gsap, motion, ScrollTrigger, useGSAP, registerGsap } from "@/lib/motion";
import { hasWebGL, useFinePointer, useIsMobile, useReducedMotion } from "@/lib/device";
import { ActionLink } from "@/components/buttons/ActionLink";
import { HERO_BEATS, type AnchorFieldState } from "@/three/scenes/AnchorFieldScene";
import { HeroFallback } from "./HeroFallback";
import { cn } from "@/lib/cn";

registerGsap();

const AnchorFieldCanvas = dynamic(() => import("@/three/AnchorFieldCanvas"), { ssr: false });

/** Per-beat width axis: create = neutral, strategize = condensed (order), elevate = expanded. */
const BEAT_WIDTH = [100, 86, 122] as const;

/**
 * HERO — "Anchor → Path → Form".
 * A pinned (CSS sticky) stage. Scrolling moves the WebGL field through three beats while the
 * headline "selects" the matching line with a design-tool bounding box.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const fieldState = useRef<AnchorFieldState>({
    progress: 0,
    pointer: { x: 10, y: 10 },
    pointerActive: false,
  });

  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const finePointer = useFinePointer();
  const [scrollBeat, setBeat] = useState(0);
  // Without motion the field shows its final form, so the headline selects the matching line.
  const beat = reduced ? 2 : scrollBeat;
  // Hovering a line selects it, overriding the scroll beat while the pointer is on it.
  const [hovered, setHovered] = useState<number | null>(null);
  const selected = hovered ?? beat;
  const [webgl, setWebgl] = useState<boolean | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- capability probe runs client-side only
  useEffect(() => setWebgl(hasWebGL()), []);

  // Scroll → field progress + active headline beat.
  useGSAP(
    () => {
      if (reduced) {
        fieldState.current.progress = 1;
        return;
      }
      const [b1, b2] = HERO_BEATS.headline;
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          fieldState.current.progress = self.progress;
          setBeat(self.progress < b1 ? 0 : self.progress < b2 ? 1 : 2);
        },
      });
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  );

  // Load-in choreography: headline lines rise from their masks, then supporting copy.
  useGSAP(
    () => {
      if (reduced) return;
      gsap
        .timeline({ delay: 0.15 })
        .from("[data-hero-line]", {
          yPercent: 108,
          duration: motion.duration.scene,
          stagger: motion.stagger.lines * 1.5,
        })
        .from(
          "[data-hero-fade]",
          { autoAlpha: 0, y: 16, duration: motion.duration.slow, stagger: motion.stagger.items },
          0.55,
        );
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  );

  // Headline width axis follows the beat.
  useGSAP(
    () => {
      lineRefs.current.forEach((line, i) => {
        if (!line) return;
        gsap.to(line, {
          "--wdth": i === selected ? BEAT_WIDTH[i] : 100,
          duration: reduced ? 0 : hovered !== null ? motion.duration.slow : motion.duration.scene,
          ease: motion.ease.inOut,
        });
      });
    },
    { dependencies: [selected, reduced] },
  );

  // Pointer → NDC for the pen-tool interaction.
  useEffect(() => {
    if (!finePointer || reduced) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      const inHero = (sectionRef.current?.getBoundingClientRect().bottom ?? 0) > e.clientY;
      fieldState.current.pointer = { x, y };
      fieldState.current.pointerActive = inHero;
    };
    const onLeave = () => (fieldState.current.pointerActive = false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [finePointer, reduced]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className={cn("relative", reduced ? "h-svh" : "h-[170svh] md:h-[320svh]")}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Artboard dot grid (echoes the dotted patches in the company deck). */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-60 [background-image:radial-gradient(var(--color-ink-700)_1px,transparent_1.2px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_60%_40%,black,transparent_75%)]"
        />
        {/* The field recedes behind the copy (top / left) and stays vivid where the form lands. */}
        {/* Tablet/desktop: the field fills the stage, receding behind the copy. On phones it gets
            its own box below the copy instead (see further down), so it can never sit on text. */}
        {!mobile && (
          <div className="absolute inset-0 [mask-image:linear-gradient(180deg,rgb(0_0_0/0.3)_0%,rgb(0_0_0/0.45)_45%,black_72%)] lg:[mask-image:linear-gradient(90deg,rgb(0_0_0/0.3)_0%,rgb(0_0_0/0.45)_30%,black_58%)]">
            {webgl === true && <AnchorFieldCanvas state={fieldState} quality="desktop" still={reduced} />}
            {webgl === false && <HeroFallback />}
          </div>
        )}

        {/* Legibility veil behind the copy: from the top-left on desktop, from the top on mobile. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--color-ink-950)_0%,rgb(11_11_11/0.85)_45%,transparent_70%)] lg:bg-[linear-gradient(100deg,var(--color-ink-950)_0%,rgb(11_11_11/0.75)_42%,transparent_65%)]"
        />

        {/* Order: meta → headline → tagline + actions → beat bar. The form fills the space low-right. */}
        <div className="container-page relative flex h-full flex-col justify-center pb-10 pt-[var(--header-h)] md:justify-start md:pb-8 md:pt-[calc(var(--header-h)+clamp(1rem,4svh,3rem))]">
          <ul data-hero-fade aria-label="About GFX-T" className="label flex flex-wrap items-center gap-2">
            <li className="flex items-center gap-2 bg-signal px-3 py-1.5 font-medium text-ink-950">
              <span aria-hidden className="size-1.5 bg-ink-950" />
              {site.descriptor}
            </li>
            <li className="hidden border border-paper/20 px-3 py-1.5 text-paper/85 backdrop-blur-sm min-[400px]:block">Lahore, Pakistan</li>
            <li className="border border-paper/20 px-3 py-1.5 text-paper/85 backdrop-blur-sm">
              Est. <span className="text-signal">{site.founded}</span>
            </li>
          </ul>

          <h1
            id="hero-heading"
            // Sized by width AND height so all three lines always fit the stage. On phones the width
            // term divides the space inside the gutters by the widest line ("We Strategize." ≈ 8.51em).
            className="mt-5 whitespace-nowrap font-display text-[length:min(calc((100vw_-_2*var(--spacing-gutter))/8.7),8.6svh)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] md:mt-7 md:text-[min(7.2vw,12.5svh)]"
            onPointerLeave={() => setHovered(null)}
          >
            {site.heroHeading.map((line, i) => {
              const active = selected === i;
              return (
                <span key={line} className="relative block w-fit" onPointerEnter={() => setHovered(i)}>
                  <span className="reveal-mask">
                    <span
                      data-hero-line
                      ref={(el) => {
                        lineRefs.current[i] = el;
                      }}
                      style={{ "--wdth": 100 } as React.CSSProperties}
                      className={cn(
                        "inline-block cursor-default pr-[0.06em] transition-colors duration-500 [font-variation-settings:'wdth'_var(--wdth)]",
                        hovered === i ? "text-signal" : active ? "text-paper" : "text-ink-400",
                      )}
                    >
                      {line}
                    </span>
                  </span>
                </span>
              );
            })}
          </h1>

          {/* Tagline first, actions always underneath it (every screen size). */}
          <div className="mt-6 flex flex-col gap-5 md:mt-9 md:gap-6">
            <p data-hero-fade className="max-w-md text-base text-paper/85 md:text-lead">
              {site.tagline}
            </p>
            <div data-hero-fade className="flex flex-wrap gap-2 md:gap-3">
              <ActionLink href="/contact" variant="primary" size={mobile ? "sm" : "md"}>
                Start a project
              </ActionLink>
              <ActionLink href="/services" size={mobile ? "sm" : "md"}>
                {mobile ? "Services" : "Our services"}
              </ActionLink>
            </div>
          </div>

          {/* Desktop: the form fills the free space. Phones: no canvas — the copy sits centred. */}
          {!mobile && <div aria-hidden className="flex-1" />}
        </div>
      </div>
    </section>
  );
}
