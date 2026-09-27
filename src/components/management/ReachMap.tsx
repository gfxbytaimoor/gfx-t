"use client";

import { useRef } from "react";
import { gsap, motion, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

registerGsap();

/** Approximate [longitude, latitude] of each place named in the bios. */
const PLACES: Record<string, { at: [number, number]; label: "above" | "below" | "left" | "right" }> = {
  Lahore: { at: [74.35, 31.55], label: "right" },
  USA: { at: [-98.5, 39.8], label: "above" },
  UK: { at: [-1.5, 52.5], label: "above" },
  Jordan: { at: [36.2, 31.2], label: "above" },
  Qatar: { at: [51.2, 25.3], label: "left" },
  UAE: { at: [54.4, 24.4], label: "below" },
};

const W = 600;
const H = 300;
const ORIGIN = "Lahore";

/**
 * An abstract reach diagram: Lahore as the anchor, a drawn path to each place named in the
 * leader's bio. Equirectangular, cropped to the places involved — a diagram, not a map.
 */
export function ReachMap({ places, tone, className }: { places: string[]; tone: "ink" | "paper"; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  const all = [ORIGIN, ...places].map((p) => PLACES[p]).filter(Boolean);
  const lons = all.map((p) => p.at[0]);
  const lats = all.map((p) => p.at[1]);
  // Fit the places into the frame with padding, preserving the degree aspect ratio.
  let [minLon, maxLon] = [Math.min(...lons) - 14, Math.max(...lons) + 14];
  let [minLat, maxLat] = [Math.min(...lats) - 12, Math.max(...lats) + 12];
  const spanLon = maxLon - minLon;
  const spanLat = maxLat - minLat;
  if (spanLon / spanLat > W / H) {
    const pad = (spanLon * (H / W) - spanLat) / 2;
    minLat -= pad;
    maxLat += pad;
  } else {
    const pad = (spanLat * (W / H) - spanLon) / 2;
    minLon -= pad;
    maxLon += pad;
  }
  const project = ([lon, lat]: [number, number]) => ({
    x: Math.round(((lon - minLon) / (maxLon - minLon)) * W),
    y: Math.round(((maxLat - lat) / (maxLat - minLat)) * H),
  });

  const o = project(PLACES[ORIGIN].at);
  const targets = places
    .filter((p) => PLACES[p])
    .map((name) => {
      const t = project(PLACES[name].at);
      const lift = Math.min(90, Math.hypot(t.x - o.x, t.y - o.y) * 0.35);
      const cx = Math.round((o.x + t.x) / 2);
      const cy = Math.round(Math.min(o.y, t.y) - lift);
      return { name, ...t, d: `M${o.x} ${o.y} Q${cx} ${cy} ${t.x} ${t.y}`, label: PLACES[name].label };
    });

  useGSAP(
    () => {
      if (reduced) return;
      gsap
        .timeline({ scrollTrigger: { trigger: ref.current, start: "top 80%", once: true } })
        .from("[data-arc]", { drawSVG: "0%", duration: 1.4, ease: motion.ease.inOut, stagger: 0.15 })
        .from("[data-place]", { autoAlpha: 0, duration: 0.5, stagger: 0.1 }, 0.6);
    },
    { scope: ref, dependencies: [reduced], revertOnUpdate: true },
  );

  const ink = tone === "paper";
  const labelPos = (l: string, x: number, y: number): { x: number; y: number; anchor: "start" | "middle" | "end" } =>
    l === "above" ? { x, y: y - 14, anchor: "middle" } : l === "below" ? { x, y: y + 22, anchor: "middle" } : l === "left" ? { x: x - 12, y: y + 4, anchor: "end" } : { x: x + 12, y: y + 4, anchor: "start" };

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Reach: from Lahore to ${places.join(", ")}`} className={cn("w-full overflow-visible", className)}>
      <defs>
        <pattern id={`dots-${tone}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" className={ink ? "fill-ink-950/15" : "fill-ink-700"} />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#dots-${tone})`} />
      {targets.map((t) => (
        <path key={t.name} data-arc d={t.d} fill="none" strokeWidth={1.25} vectorEffect="non-scaling-stroke" className={ink ? "stroke-ink-950" : "stroke-signal"} />
      ))}
      {targets.map((t) => {
        const lp = labelPos(t.label, t.x, t.y);
        return (
          <g key={t.name} data-place>
            <rect x={t.x - 4} y={t.y - 4} width={8} height={8} strokeWidth={1} className={ink ? "fill-paper stroke-ink-950" : "fill-ink-950 stroke-paper"} />
            <text x={lp.x} y={lp.y} textAnchor={lp.anchor} className={cn("font-mono text-[12px] uppercase tracking-[0.14em]", ink ? "fill-ink-950" : "fill-paper")}>
              {t.name}
            </text>
          </g>
        );
      })}
      <rect x={o.x - 5} y={o.y - 5} width={10} height={10} className={ink ? "fill-ink-950" : "fill-signal"} />
      <text x={o.x + 12} y={o.y + 18} className={cn("font-mono text-[12px] uppercase tracking-[0.14em]", ink ? "fill-ink-950" : "fill-signal")}>
        Lahore
      </text>
    </svg>
  );
}
