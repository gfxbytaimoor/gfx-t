"use client";

import { useRef } from "react";
import { gsap, motion, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

registerGsap();

/** Approximate [longitude, latitude] of each place named in the bios. */
const PLACES: Record<string, { at: [number, number]; label: "above" | "below" | "left" | "right" }> = {
  Pakistan: { at: [74.35, 31.55], label: "right" },
  USA: { at: [-98.5, 39.8], label: "above" },
  UK: { at: [-1.5, 52.5], label: "above" },
  Jordan: { at: [36.2, 31.2], label: "above" },
  Qatar: { at: [51.2, 25.3], label: "left" },
  UAE: { at: [54.4, 24.4], label: "below" },
};

const W = 600;
const H = 300;
const ORIGIN = "Pakistan";
/** Inner margins of the frame (viewBox units): room for labels at the sides, arcs above, legend below. */
const MARGIN_X = 70;
const MARGIN_TOP = 70;
const MARGIN_BOTTOM = 56;

/**
 * An abstract reach diagram: Pakistan as the anchor, a drawn path to each place named in the
 * leader's bio. Equirectangular, cropped to the places involved — a diagram, not a map. Everything
 * (points, arcs and labels) stays inside the dotted frame at every size.
 *
 * `groupLabel`: draw the paths without naming each place, and caption them all with this label
 * (e.g. "Other countries").
 */
export function ReachMap({ places, tone, groupLabel, className }: { places: string[]; tone: "ink" | "paper"; groupLabel?: string; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  const all = [ORIGIN, ...places].map((p) => PLACES[p]).filter(Boolean);
  const lons = all.map((p) => p.at[0]);
  const lats = all.map((p) => p.at[1]);
  // Fit the places into an inner box (margins leave room for labels and arcs), keeping the
  // degree aspect ratio and centring the result.
  const minLon = Math.min(...lons) - 2;
  const maxLon = Math.max(...lons) + 2;
  const minLat = Math.min(...lats) - 2;
  const maxLat = Math.max(...lats) + 2;
  const scale = Math.min((W - 2 * MARGIN_X) / (maxLon - minLon), (H - MARGIN_TOP - MARGIN_BOTTOM) / (maxLat - minLat));
  const offX = (W - (maxLon - minLon) * scale) / 2;
  const offY = MARGIN_TOP + (H - MARGIN_TOP - MARGIN_BOTTOM - (maxLat - minLat) * scale) / 2;
  const project = ([lon, lat]: [number, number]) => ({
    x: Math.round(offX + (lon - minLon) * scale),
    y: Math.round(offY + (maxLat - lat) * scale),
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
  // Labels are set in viewBox units: larger on phones, where the frame is drawn much smaller.
  const label = "font-mono text-[20px] uppercase tracking-[0.14em] md:text-[12px]";
  const labelPos = (l: string, x: number, y: number): { x: number; y: number; anchor: "start" | "middle" | "end" } =>
    l === "above" ? { x, y: y - 16, anchor: "middle" } : l === "below" ? { x, y: y + 30, anchor: "middle" } : l === "left" ? { x: x - 12, y: y + 6, anchor: "end" } : { x: x + 12, y: y + 6, anchor: "start" };

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Reach: from ${ORIGIN} to ${groupLabel ?? places.join(", ")}`} className={cn("w-full", className)}>
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
            {!groupLabel && (
              <text x={lp.x} y={lp.y} textAnchor={lp.anchor} className={cn(label, ink ? "fill-ink-950" : "fill-paper")}>
                {t.name}
              </text>
            )}
          </g>
        );
      })}
      <rect x={o.x - 5} y={o.y - 5} width={10} height={10} className={ink ? "fill-ink-950" : "fill-signal"} />
      {/* Centred under the point: clear of the Gulf points just west of it, and inside the frame
          (Pakistan sits furthest east, at least MARGIN_X from the edge). */}
      <text x={o.x} y={o.y + 32} textAnchor="middle" className={cn(label, ink ? "fill-ink-950" : "fill-signal")}>
        {ORIGIN}
      </text>
      {groupLabel && (
        <g data-place>
          <rect x={20} y={H - 30} width={8} height={8} strokeWidth={1} className={ink ? "fill-paper stroke-ink-950" : "fill-ink-950 stroke-paper"} />
          <text x={38} y={H - 26} dominantBaseline="central" className={cn(label, ink ? "fill-ink-950" : "fill-paper")}>
            {groupLabel}
          </text>
        </g>
      )}
    </svg>
  );
}
