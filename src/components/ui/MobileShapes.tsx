import { cn } from "@/lib/cn";

type Kind = "cube" | "ring" | "anchor" | "plus";
/** Position is in px from a corner, so shapes stay inside a section's padding bands. */
type Shape = { kind: Kind; size: number; dur: number; delay: number; top?: number; bottom?: number; left?: number; right?: number };

/**
 * Deterministic layouts. Every shape sits in a corner of the section's top or bottom padding
 * (never over copy): sections have at least ~40px of padding there on phones, shapes are ≤ 28px.
 */
const LAYOUTS: Shape[][] = [
  [
    { kind: "cube", top: 10, right: 18, size: 24, dur: 14, delay: 0 },
    { kind: "ring", bottom: 8, left: 16, size: 26, dur: 18, delay: -4 },
    { kind: "plus", bottom: 14, right: 22, size: 12, dur: 16, delay: -6 },
  ],
  [
    { kind: "ring", top: 8, right: 18, size: 26, dur: 16, delay: -3 },
    { kind: "anchor", top: 16, right: 60, size: 12, dur: 11, delay: -2 },
    { kind: "cube", bottom: 10, left: 18, size: 22, dur: 13, delay: -5 },
  ],
  [
    { kind: "plus", top: 12, right: 20, size: 14, dur: 15, delay: 0 },
    { kind: "cube", bottom: 8, right: 20, size: 24, dur: 15, delay: -6 },
    { kind: "anchor", bottom: 16, left: 18, size: 12, dur: 10, delay: -1 },
  ],
  // Page intros: top corner only (their bottom padding is too shallow for a shape).
  [
    { kind: "cube", top: 10, right: 18, size: 22, dur: 14, delay: 0 },
    { kind: "anchor", top: 17, right: 58, size: 10, dur: 11, delay: -3 },
  ],
];

function ShapeView({ s, tone }: { s: Shape; tone: "ink" | "paper" }) {
  const line = tone === "ink" ? "var(--color-paper)" : "var(--color-ink-950)";
  const accent = "var(--color-signal)";
  const common = { width: s.size, height: s.size, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` };

  if (s.kind === "cube") {
    const half = s.size / 2;
    const faces = [
      `rotateY(0deg) translateZ(${half}px)`,
      `rotateY(90deg) translateZ(${half}px)`,
      `rotateY(180deg) translateZ(${half}px)`,
      `rotateY(-90deg) translateZ(${half}px)`,
      `rotateX(90deg) translateZ(${half}px)`,
      `rotateX(-90deg) translateZ(${half}px)`,
    ];
    return (
      <span className="block [perspective:400px]" style={{ width: s.size, height: s.size }}>
        <span className="relative block animate-[shape-tumble_linear_infinite] [transform-style:preserve-3d]" style={common}>
          {faces.map((t) => (
            <span key={t} className="absolute inset-0 border" style={{ transform: t, borderColor: accent }} />
          ))}
        </span>
      </span>
    );
  }
  if (s.kind === "ring") {
    return (
      <span className="block [perspective:400px]" style={{ width: s.size, height: s.size }}>
        <span className="block animate-[shape-flip_linear_infinite] rounded-full border-2" style={{ ...common, borderColor: line }} />
      </span>
    );
  }
  if (s.kind === "anchor") {
    return <span className="block animate-[shape-spin_linear_infinite] border-2" style={{ ...common, borderColor: accent, background: "transparent" }} />;
  }
  return (
    <span className="relative block animate-[shape-spin_linear_infinite]" style={common}>
      <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2" style={{ background: line }} />
      <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2" style={{ background: line }} />
    </span>
  );
}

/**
 * Phones only: a few slowly rotating objects (wireframe cube, ring, anchor square, plus) drifting
 * in the corners of a section's padding, clear of the copy — the mobile counterpart of the desktop interactions. Pure CSS 3D, low
 * opacity, no pointer events; hidden from md up and under reduced motion. The parent section
 * needs `relative isolate` so the layer sits above its background and below its content.
 */
export function MobileShapes({
  variant = 0,
  tone = "ink",
  topOffset = 0,
  className,
}: {
  variant?: number;
  tone?: "ink" | "paper";
  /** Extra px added to top-anchored shapes (e.g. to clear the fixed header on page intros). */
  topOffset?: number;
  className?: string;
}) {
  const layout = LAYOUTS[variant % LAYOUTS.length];
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden motion-reduce:hidden md:hidden", className)}>
      {layout.map((s, i) => (
        <span
          key={i}
          className="absolute animate-[shape-drift_ease-in-out_infinite] opacity-45"
          style={{ top: s.top !== undefined ? s.top + topOffset : undefined, bottom: s.bottom, left: s.left, right: s.right, animationDuration: `${s.dur * 0.6}s`, animationDelay: `${s.delay}s` }}
        >
          <ShapeView s={s} tone={tone} />
        </span>
      ))}
    </div>
  );
}
