"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { gsap, motion, ScrollTrigger, useGSAP, registerGsap } from "@/lib/motion";
import { hasWebGL, useFinePointer, useIsMobile, useReducedMotion } from "@/lib/device";
import { ActionLink } from "@/components/buttons/ActionLink";
import { HERO_BEATS, type AnchorFieldState, type CopyBox } from "@/three/scenes/AnchorFieldScene";
import { HeroFallback } from "./HeroFallback";
import { HeroMobileField } from "./HeroMobileField";
import { cn } from "@/lib/cn";

registerGsap();

const AnchorFieldCanvas = dynamic(() => import("@/three/AnchorFieldCanvas"), { ssr: false });

/** Per-beat width axis: create = neutral, strategize = condensed (order), elevate = expanded. */
const BEAT_WIDTH = [100, 86, 114] as const;

/**
 * HERO — "Anchor → Path → Form".
 * A pinned (CSS sticky) stage. Scrolling moves the WebGL field through three beats while the
 * headline "selects" the matching line with a design-tool bounding box.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            fieldState.current.progress = self.progress;
            setBeat(self.progress < b1 ? 0 : self.progress < b2 ? 1 : 2);
          },
        });
      });
      // Phones: the hero is not pinned (no scroll distance to spend), so the headline selects
      // each line in turn on a timer, in step with the paths of the mobile field.
      mm.add("(max-width: 767px)", () => {
        const id = window.setInterval(() => setBeat((b) => (b + 1) % 3), 1600);
        return () => window.clearInterval(id);
      });
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  );

  // Load-in choreography: headline lines rise from their masks. The supporting copy and buttons
  // follow via the CSS `hero-fade` utility (globals.css), so they are never hidden after they have
  // painted and the buttons can be clicked from the first frame.
  useGSAP(
    () => {
      if (reduced) return;
      gsap.timeline({ delay: 0.15 }).from("[data-hero-line]", {
        yPercent: 108,
        duration: motion.duration.scene,
        stagger: motion.stagger.lines * 1.5,
      });
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

  // Tell the field where the copy is, so the nib can fill the free space around it. Headline lines
  // are measured at their widest beat (the width axis animates); everything relative to the stage.
  useEffect(() => {
    const stage = stageRef.current;
    if (mobile || !stage) return;
    const measure = () => {
      const st = stage.getBoundingClientRect();
      const boxes: CopyBox[] = [];
      const add = (r: DOMRect, x1 = r.right) => boxes.push({ x0: r.left - st.left, x1: x1 - st.left, y0: r.top - st.top, y1: r.bottom - st.top });
      lineRefs.current.forEach((line, i) => {
        if (!line) return;
        const r = line.getBoundingClientRect();
        const current = Number(gsap.getProperty(line, "--wdth")) || 100;
        add(r, r.left + (r.width * Math.max(100, BEAT_WIDTH[i])) / current);
      });
      stage.querySelectorAll("[data-hero-copy]").forEach((el) => add(el.getBoundingClientRect()));
      fieldState.current.copyBoxes = boxes;
    };
    // After the intro (lines rise from their masks) and once web fonts have settled the widths.
    const t = window.setTimeout(measure, 1800);
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(() => measure());
    ro.observe(stage);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
    };
  }, [mobile]);

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
      // Phones: sized by its content (no pinned scroll, no empty bands). Tablet/desktop: pinned stage.
      className={cn("relative", reduced ? "md:h-svh" : "md:h-[250svh]")}
    >
      <div ref={stageRef} className="relative overflow-hidden md:sticky md:top-0 md:h-svh">
        {/* Artboard dot grid (echoes the dotted patches in the company deck). */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-60 [background-image:radial-gradient(var(--color-ink-700)_1px,transparent_1.2px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_60%_40%,black,transparent_75%)]"
        />
        {/* Phones: pen paths and anchors spread evenly over the whole stage (CSS, no WebGL). */}
        <HeroMobileField />
        {/* The field recedes behind the copy (top / left) and stays vivid where the form lands. */}
        {/* Tablet/desktop: the field fills the stage, receding behind the copy. On phones it gets
            its own box below the copy instead (see further down), so it can never sit on text. */}
        {!mobile && (
          <div className="absolute inset-0 [mask-image:linear-gradient(180deg,rgb(0_0_0/0.3)_0%,rgb(0_0_0/0.45)_45%,black_72%)] lg:[mask-image:linear-gradient(90deg,rgb(0_0_0/0.3)_0%,rgb(0_0_0/0.45)_30%,black_58%)]">
            {webgl === true && <AnchorFieldCanvas state={fieldState} quality="desktop" still={reduced} />}
            {webgl === false && <HeroFallback />}
          </div>
        )}

        {/* Legibility veil behind the copy (tablet/desktop, over the WebGL field): from the top-left on desktop, from the top on tablets. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 max-md:hidden md:bg-[linear-gradient(180deg,var(--color-ink-950)_0%,rgb(11_11_11/0.85)_45%,transparent_70%)] lg:bg-[linear-gradient(100deg,var(--color-ink-950)_0%,rgb(11_11_11/0.75)_42%,transparent_65%)]"
        />

        {/* Order: meta → headline → tagline + actions → beat bar. The form fills the space low-right. */}
        <div className="container-page relative flex h-full flex-col pb-12 pt-[calc(var(--header-h)+1.75rem)] md:justify-start md:pb-8 md:pt-[calc(var(--header-h)+clamp(1rem,4svh,3rem))] short:pb-4">
          <ul aria-label="About GFX-T" className="hero-fade label flex flex-wrap items-center gap-2">
            <li data-hero-copy className="flex items-center gap-2 bg-signal px-3 py-1.5 font-medium text-ink-950">
              <span aria-hidden className="size-1.5 bg-ink-950" />
              {site.descriptor}
            </li>
            <li data-hero-copy className="hidden border border-paper/20 px-3 py-1.5 text-paper/85 backdrop-blur-sm min-[400px]:block">Lahore, Pakistan</li>
            <li data-hero-copy className="border border-paper/20 px-3 py-1.5 text-paper/85 backdrop-blur-sm">
              Est. <span className="text-signal">{site.founded}</span>
            </li>
          </ul>

          <h1
            id="hero-heading"
            // Sized by width AND height so all three lines always fit the stage. On phones the width
            // term divides the space inside the gutters by the widest line ("We Strategize." ≈ 8.51em).
            className="mt-5 whitespace-nowrap font-display text-[length:min(calc((100vw_-_2*var(--spacing-gutter))/8.7),8.6svh)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] md:mt-7 md:text-[min(7.2vw,12.5svh)] short:mt-4 short:text-[min(7.2vw,10svh)] short-phone:mt-3"
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
          <div className="mt-6 flex flex-col gap-5 md:mt-9 md:gap-6 short:mt-5 short:gap-4 short-phone:mt-4 short-phone:gap-3">
            <p data-hero-copy className="hero-fade w-fit max-w-md text-base text-paper/85 [--hero-fade-delay:0.76s] md:text-lead short:max-w-xl short:text-base short-phone:max-w-xl">
              {site.tagline}
            </p>
            <div data-hero-copy className="hero-fade flex w-fit flex-wrap gap-2 [--hero-fade-delay:0.82s] md:gap-3">
              {/* Size and label switch in CSS (not JS) so the buttons don't jump when the page loads. */}
              <ActionLink href="/contact" variant="primary" size="sm-md">
                Start a project
              </ActionLink>
              <ActionLink href="/services" size="sm-md">
                <span className="md:hidden">Services</span>
                <span className="hidden md:inline">Our services</span>
              </ActionLink>
            </div>
          </div>

          {/* Desktop: the form fills the free space. Phones: no canvas — the copy sits centred. */}
          {/* CSS, not the JS media check: rendered on the server too, so phones don't jump on load. */}
          <div aria-hidden className="hidden flex-1 md:block" />
        </div>
      </div>
    </section>
  );
}
