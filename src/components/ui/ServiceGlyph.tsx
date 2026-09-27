"use client";

import { useRef } from "react";
import type { ServiceGlyph as GlyphId } from "@/data/services";
import { gsap, motion, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

registerGsap();

/**
 * Service glyphs, drawn in the hero's pen-tool vocabulary on a 48×48 artboard:
 * hairline paths, square anchors, round handle ends, and one "selected" path in signal.
 */
type Stroke = { d: string; selected?: boolean };
type Glyph = { strokes: Stroke[]; anchors: [number, number][]; handles?: [number, number][] };

const GLYPHS: Record<GlyphId, Glyph> = {
  // Photography — a camera body with its lens selected.
  camera: {
    strokes: [
      { d: "M6 16 H14 L17 11 H31 L34 16 H42 V38 H6 Z" },
      { d: "M24 18 A9 9 0 1 1 23.99 18", selected: true },
      { d: "M24 23 A4 4 0 1 1 23.99 23" },
    ],
    anchors: [[36, 21]],
  },
  // Videography — a frame with film edges and the play mark selected.
  play: {
    strokes: [
      { d: "M6 12 H42 V36 H6 Z" },
      { d: "M6 17 H42" },
      { d: "M6 31 H42" },
      { d: "M21 19.5 L29 24 L21 28.5 Z", selected: true },
    ],
    anchors: [[6, 12], [42, 36]],
  },
  // Branding & Design — a Bézier segment with both handles out.
  bezier: {
    strokes: [
      { d: "M8 36 L8 14" },
      { d: "M40 12 L40 34" },
      { d: "M8 36 C8 14 40 34 40 12", selected: true },
    ],
    anchors: [[8, 36], [40, 12]],
    handles: [[8, 14], [40, 34]],
  },
  // Digital Marketing — a growth path rising through its anchors.
  signal: {
    strokes: [
      { d: "M6 42 L42 42" },
      { d: "M6 36 L17 27 L26 31 L42 12", selected: true },
    ],
    anchors: [[6, 36], [17, 27], [26, 31], [42, 12]],
  },
  // Content Writing & Creation — lines of copy and a live text caret.
  cursor: {
    strokes: [
      { d: "M8 12 L40 12" },
      { d: "M8 20 L36 20" },
      { d: "M8 28 L22 28" },
      { d: "M26 23 L26 35", selected: true },
    ],
    anchors: [[8, 12], [8, 20], [8, 28]],
  },
  // Social Media Management — a feed grid with one post selected.
  grid: {
    strokes: [8, 20, 32].flatMap((y) =>
      [8, 20, 32].map((x) => ({
        d: `M${x} ${y} h8 v8 h-8 Z`,
        selected: x === 20 && y === 20,
      })),
    ),
    anchors: [],
  },
  // Print Media — a printer's registration mark.
  registration: {
    strokes: [
      { d: "M24 6 L24 42" },
      { d: "M6 24 L42 24" },
      { d: "M24 12 A12 12 0 1 1 23.99 12" },
      { d: "M24 19 A5 5 0 1 1 23.99 19", selected: true },
    ],
    anchors: [],
  },
  // Public Relations — a message radiating outward from one point.
  broadcast: {
    strokes: [
      { d: "M10 28 A10 10 0 0 1 20 38" },
      { d: "M10 20 A18 18 0 0 1 28 38" },
      { d: "M10 12 A26 26 0 0 1 36 38", selected: true },
    ],
    anchors: [[10, 38]],
  },
};

type Props = {
  glyph: GlyphId;
  /** Surface the glyph sits on: paths use paper on ink, ink on paper. */
  tone?: "ink" | "paper";
  /** Each time this becomes true the glyph is re-drawn stroke by stroke. */
  play?: boolean;
  /** Changing this re-draws the glyph even if `play` stays true. */
  replayKey?: number;
  className?: string;
};

export function ServiceGlyph({ glyph, tone = "ink", play = true, replayKey = 0, className }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const g = GLYPHS[glyph];
  const line = tone === "ink" ? "var(--color-paper)" : "var(--color-ink-950)";
  // Yellow hairlines vanish on paper, so the selected path becomes a heavier ink stroke there.
  const selected = tone === "ink" ? "var(--color-signal)" : "var(--color-ink-950)";

  useGSAP(
    () => {
      if (!play || reduced || !ref.current) return;
      const points = ref.current.querySelectorAll("[data-point]");
      const tl = gsap
        .timeline()
        .fromTo(
          ref.current.querySelectorAll("[data-stroke]"),
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: motion.duration.slow, stagger: motion.stagger.items, ease: motion.ease.inOut },
        );
      if (points.length)
        tl.fromTo(
          points,
          { scale: 0, transformOrigin: "50% 50%" },
          { scale: 1, duration: motion.duration.base, stagger: motion.stagger.items / 2 },
          0.2,
        );
    },
    { scope: ref, dependencies: [play, replayKey, glyph, reduced], revertOnUpdate: true },
  );

  return (
    <svg ref={ref} viewBox="0 0 48 48" fill="none" aria-hidden className={cn("overflow-visible", className)}>
      {g.strokes.map((s, i) => (
        <path
          key={i}
          data-stroke
          d={s.d}
          stroke={s.selected ? selected : line}
          strokeWidth={s.selected ? 1.6 : 1}
          strokeOpacity={s.selected ? 1 : 0.7}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {g.handles?.map(([x, y]) => (
        <circle key={`h${x}-${y}`} data-point cx={x} cy={y} r={1.6} fill={line} />
      ))}
      {g.anchors.map(([x, y]) => (
        <rect key={`a${x}-${y}`} data-point x={x - 2} y={y - 2} width={4} height={4} fill={tone === "ink" ? "var(--color-ink-950)" : "var(--color-paper)"} stroke={line} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}
