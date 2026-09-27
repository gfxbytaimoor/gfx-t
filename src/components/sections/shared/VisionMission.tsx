"use client";

import { useEffect, useRef, useState } from "react";
import { MobileShapes } from "@/components/ui/MobileShapes";
import { mission, missionSummary, vision, visionSummary, type Principle } from "@/data/company";
import { gsap, motion, ScrollTrigger, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { RevealText } from "@/components/typography/RevealText";
import { SectionLabel } from "@/components/typography/SectionLabel";
import { cn } from "@/lib/cn";

registerGsap();

type Mode = "vision" | "mission";
/** "seed": every anchor collapsed onto the origin — the state a diagram assembles from. */
type Layout = Mode | "seed";

/* --------------------------------------------------------------------------
   Diagram geometry. One set of nine anchors, two arrangements:
   VISION  — anchors thrown outward along rays from a single origin (possibility, expansion).
   MISSION — the same anchors pulled onto one path, three of them milestones (direction).
   -------------------------------------------------------------------------- */
const N = 9;
const C = 200;
const RADII = [0, 150, 104, 172, 128, 160, 116, 178, 138];

const LAYOUT: Record<Layout, { x: number; y: number }[]> = {
  seed: Array.from({ length: N }, () => ({ x: C, y: C })),
  vision: Array.from({ length: N }, (_, i) => {
    if (i === 0) return { x: C, y: C };
    const a = -Math.PI / 2 + ((i - 1) / (N - 1)) * Math.PI * 2 + 0.2;
    // Rounded so server and client serialise identical attribute values.
    return { x: Math.round(C + Math.cos(a) * RADII[i]), y: Math.round(C + Math.sin(a) * RADII[i]) };
  }),
  mission: Array.from({ length: N }, (_, i) => ({ x: 40 + i * 40, y: C })),
};

/** Which anchors carry a principle number in each mode. */
const MARKED: Record<Layout, number[]> = { seed: [], vision: [3, 7], mission: [2, 5, 8] };

/** Line i runs from its source to anchor i: rays from the origin, or segments along the path. */
const source = (mode: Layout, i: number) => (mode === "mission" ? LAYOUT.mission[Math.max(0, i - 1)] : LAYOUT[mode][0]);

function Diagram({ mode, className, viewBox = "0 0 400 400" }: { mode: Layout; className?: string; viewBox?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const first = useRef(true);

  useGSAP(
    () => {
      const duration = first.current || reduced ? 0 : motion.duration.scene;
      first.current = false;
      const ease = motion.ease.inOut;
      const pts = LAYOUT[mode];

      pts.forEach((p, i) => {
        const s = source(mode, i);
        const marked = MARKED[mode].indexOf(i);
        gsap.to(`[data-anchor="${i}"]`, { attr: { x: p.x - 4, y: p.y - 4 }, duration, ease, delay: duration ? i * 0.025 : 0 });
        if (i > 0) gsap.to(`[data-line="${i}"]`, { attr: { x1: s.x, y1: s.y, x2: p.x, y2: p.y }, duration, ease, delay: duration ? i * 0.025 : 0 });
        gsap.to(`[data-mark="${i}"]`, {
          attr: { x: p.x, y: mode === "vision" ? p.y - 14 : p.y + 26 },
          autoAlpha: marked >= 0 ? 1 : 0,
          duration,
          ease,
        });
      });
    },
    { scope: ref, dependencies: [mode, reduced] },
  );

  // Initial attributes are the vision layout; the effect above snaps them to `mode` on mount.
  return (
    <svg ref={ref} viewBox={viewBox} aria-hidden className={cn("w-full overflow-visible", className)}>
      {LAYOUT.vision.map((p, i) =>
        i === 0 ? null : (
          <line
            key={`l${i}`}
            data-line={i}
            x1={C}
            y1={C}
            x2={p.x}
            y2={p.y}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            className={cn(
              "transition-[stroke] duration-700",
              mode === "mission" ? "stroke-signal" : "stroke-ink-500",
            )}
          />
        ),
      )}
      {LAYOUT.vision.map((p, i) => {
        const marked = MARKED[mode].includes(i);
        return (
          <rect
            key={`a${i}`}
            data-anchor={i}
            x={p.x - 4}
            y={p.y - 4}
            width={8}
            height={8}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            className={cn(
              "transition-[fill,stroke] duration-700",
              marked ? "fill-signal stroke-signal" : i === 0 ? "fill-paper stroke-paper" : "fill-ink-900 stroke-paper/70",
            )}
          />
        );
      })}
      {LAYOUT.vision.map((p, i) => {
        const n = MARKED[mode].indexOf(i);
        return (
          <text
            key={`m${i}`}
            data-mark={i}
            x={p.x}
            y={p.y - 14}
            textAnchor="middle"
            className="fill-paper font-mono text-[11px] tracking-[0.14em]"
            opacity={0}
          >
            {n >= 0 ? String(n + 1).padStart(2, "0") : ""}
          </text>
        );
      })}
      {/* Living motion once settled: a scan line for Vision, a pulse along the path for Mission. */}
      {mode === "vision" && (
        <line
          x1={C}
          y1={C}
          x2={C}
          y2={C - 185}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          className="stroke-signal/50 [transform-box:view-box] [transform-origin:200px_200px] motion-safe:animate-[spin_7s_linear_infinite]"
        />
      )}
      {mode === "mission" && (
        <rect x={36} y={C - 4} width={8} height={8} className="fill-signal motion-safe:animate-[path-pulse_3.2s_var(--ease-in-out-quart)_infinite]" />
      )}
    </svg>
  );
}

/** Small-screen diagram: collapsed until it scrolls into view, then assembles (every time). */
function InViewDiagram({ mode, className }: { mode: Mode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {/* Mission is a single horizontal path, so its box is cropped to that band. */}
      <Diagram mode={inView ? mode : "seed"} viewBox={mode === "mission" ? "0 150 400 90" : undefined} />
    </div>
  );
}

type Props = { index?: string };

/**
 * VISION / MISSION — a conceptual interactive system rather than two cards. The diagram is
 * sticky on large screens and re-arranges as each statement scrolls into focus; on small
 * screens each statement carries its own static diagram.
 */
export function VisionMission({ index }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<Mode>("vision");

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: "[data-block='mission']",
        start: "top 60%",
        onEnter: () => setMode("mission"),
        onLeaveBack: () => setMode("vision"),
      });
    },
    { scope: ref },
  );

  const blocks: { id: Mode; title: string; summary: string; principles: Principle[] }[] = [
    { id: "vision", title: "Our Vision", summary: visionSummary, principles: vision },
    { id: "mission", title: "Our Mission", summary: missionSummary, principles: mission },
  ];

  return (
    <section ref={ref} aria-label="Vision and Mission" className="relative isolate bg-ink-900 pb-[var(--spacing-section)] pt-[calc(var(--spacing-section)*0.3)]">
      <MobileShapes variant={2} />
      <div className="container-page">
        <SectionLabel index={index}>Vision &amp; Mission</SectionLabel>

        <div className="mt-8 grid gap-x-16 lg:grid-cols-12">
          {/* Sticky diagram (large screens) */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-[calc(var(--header-h)+6vh)] pt-[6vh]">
              <Diagram mode={mode} className="max-w-[440px] 2xl:max-w-[560px]" />
              <p className="label mt-8 flex gap-6 text-ink-400" aria-hidden>
                <span className={cn("transition-colors duration-500", mode === "vision" && "text-paper")}>
                  <span className={mode === "vision" ? "text-signal" : ""}>■</span> Possibility
                </span>
                <span className={cn("transition-colors duration-500", mode === "mission" && "text-paper")}>
                  <span className={mode === "mission" ? "text-signal" : ""}>■</span> Direction
                </span>
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            {blocks.map((b) => (
              <article
                key={b.id}
                data-block={b.id}
                aria-labelledby={`${b.id}-heading`}
                className={cn(
                  "flex flex-col py-7 lg:py-14",
                  b.id === "mission" && "border-t border-ink-800 lg:border-0",
                )}
              >
                <RevealText
                  as="h2"
                  id={`${b.id}-heading`}
                  className={cn(
                    "font-display text-h2 font-bold uppercase transition-colors duration-700",
                    // Vision reads expanded (possibility); Mission condensed (structure).
                    b.id === "vision" ? "[font-variation-settings:'wdth'_120]" : "[font-variation-settings:'wdth'_84]",
                    mode === b.id ? "text-paper" : "lg:text-ink-500",
                  )}
                >
                  {b.title}
                </RevealText>
                {/* Phones: the diagram sits centred under its heading. */}
                <InViewDiagram mode={b.id} className={cn("mx-auto mt-5 w-full lg:hidden", b.id === "mission" ? "max-w-[320px]" : "max-w-[210px]")} />

                <p className="mt-5 max-w-2xl text-lead text-paper/85 lg:mt-8">{b.summary}</p>
                <ol className="mt-6 flex flex-wrap gap-x-8 gap-y-3 lg:mt-10">
                  {b.principles.map((p) => (
                    <li key={p.index} className="label flex items-center gap-2 text-ink-300">
                      <span className="text-signal">{p.index}</span> {p.title}
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
