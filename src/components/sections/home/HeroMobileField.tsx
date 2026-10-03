/**
 * Phones only: the hero's pen-tool language as a light CSS/SVG layer (no WebGL). Three Bézier
 * paths cross the stage at the top, middle and bottom, each with its anchors and handles, and
 * draw themselves in turn; anchor points pulse across an even grid in between. Low contrast, so
 * the copy on top stays legible. Hidden from md up and under reduced motion.
 */

type Curve = { d: string; anchors: [number, number][]; handles: [number, number, number, number][]; selected?: boolean };

// viewBox 0 0 390 520 (about the phone hero's proportions) — top, middle and bottom bands.
const CURVES: Curve[] = [
  {
    d: "M-10 104 C 70 48, 150 158, 220 100 S 340 52, 400 88",
    anchors: [[220, 100]],
    handles: [[180, 132, 260, 68]],
  },
  {
    d: "M-10 300 C 80 350, 160 230, 250 280 S 360 330, 400 270",
    anchors: [[250, 280]],
    handles: [[205, 255, 295, 305]],
    selected: true,
  },
  {
    d: "M-10 466 C 60 416, 140 516, 200 464 S 330 406, 400 476",
    anchors: [[200, 464]],
    handles: [[165, 492, 235, 436]],
  },
];

// An even 3 × 5 grid of anchor points, nudged off the strict grid so it doesn't read as a table.
const POINTS: [number, number][] = [55, 195, 335].flatMap((x, c) =>
  [48, 150, 252, 354, 456].map((y, r): [number, number] => [x + ((r + c) % 2 ? 14 : -10), y + (c - 1) * 12]),
);

export function HeroMobileField() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 390 520"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      className="pointer-events-none absolute inset-0 h-full w-full motion-reduce:hidden md:hidden"
    >
      {POINTS.map(([x, y], i) => (
        <rect
          key={`p${i}`}
          x={x - 2.5}
          y={y - 2.5}
          width={5}
          height={5}
          className="animate-[hero-point_4.8s_ease-in-out_infinite] fill-paper/40"
          style={{ animationDelay: `${-((i * 7) % 15) * 0.32}s` }}
        />
      ))}
      {CURVES.map((c, i) => {
        const delay = `${i * 1.6}s`;
        return (
          <g key={c.d}>
            {/* Faint full path, with the drawn stroke travelling along it. */}
            <path d={c.d} pathLength={1} strokeWidth={1} className="stroke-paper/10" vectorEffect="non-scaling-stroke" />
            <path
              d={c.d}
              pathLength={1}
              strokeWidth={c.selected ? 1.6 : 1.1}
              strokeDasharray="1 1"
              vectorEffect="non-scaling-stroke"
              className={`animate-[hero-draw_4.8s_var(--ease-in-out-quart)_infinite] ${c.selected ? "stroke-signal/70" : "stroke-paper/45"}`}
              style={{ animationDelay: delay }}
            />
            {c.handles.map(([x1, y1, x2, y2]) => (
              <g key={`${x1}-${y1}`} className="animate-[hero-handle_4.8s_ease-in-out_infinite]" style={{ animationDelay: delay }}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1} className="stroke-paper/30" vectorEffect="non-scaling-stroke" />
                <circle cx={x1} cy={y1} r={2.5} className="fill-paper/45" />
                <circle cx={x2} cy={y2} r={2.5} className="fill-paper/45" />
              </g>
            ))}
            {c.anchors.map(([x, y]) => (
              <rect
                key={`${x}-${y}`}
                x={x - 4}
                y={y - 4}
                width={8}
                height={8}
                strokeWidth={1}
                className={`animate-[hero-handle_4.8s_ease-in-out_infinite] fill-ink-950 ${c.selected ? "stroke-signal" : "stroke-paper/50"}`}
                style={{ animationDelay: delay }}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
