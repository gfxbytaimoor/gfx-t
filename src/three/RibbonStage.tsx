"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, useGSAP, registerGsap } from "@/lib/motion";
import { hasWebGL, useFinePointer, useIsMobile, useReducedMotion } from "@/lib/device";
import type { RibbonState } from "./scenes/RibbonScene";

registerGsap();

const RibbonCanvas = dynamic(() => import("./RibbonCanvas"), { ssr: false });

/** Static stand-in for devices without WebGL: a twisted band of lines drawn once in SVG. */
function RibbonFallback() {
  const lines = Array.from({ length: 28 }, (_, l) => {
    const v = (l / 27) * 2 - 1;
    const pts = Array.from({ length: 61 }, (_, i) => {
      const u = i / 60;
      const twist = u * 5.2;
      const y = 130 + Math.sin(u * 3.4) * 60 + Math.cos(twist) * v * 55 * (0.55 + 0.45 * Math.sin(u * Math.PI));
      return `${(u * 600).toFixed(1)},${y.toFixed(1)}`;
    });
    return { l, d: `M${pts.join(" L")}` };
  });
  return (
    <svg viewBox="0 0 600 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {lines.map(({ l, d }) => (
        <path key={l} d={d} fill="none" stroke="var(--color-signal)" strokeOpacity={0.25} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

/**
 * Host for the closing CTA's Signal Ribbon: mounts the canvas only when the section nears the
 * viewport, feeds it scroll progress and the pointer (relative to this box).
 */
export function RibbonStage({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef<RibbonState>({ progress: 0, pointer: null });
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const finePointer = useFinePointer();
  const [near, setNear] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- capability probe runs client-side only
  useEffect(() => setWebgl(hasWebGL()), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "center center",
        onUpdate: (self) => (state.current.progress = self.progress),
      });
    },
    { dependencies: [reduced], revertOnUpdate: true },
  );

  useEffect(() => {
    if (!finePointer || reduced) return;
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      state.current.pointer = inside
        ? { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }
        : null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [finePointer, reduced]);

  return (
    <div ref={ref} aria-hidden className={className ?? "absolute inset-0"}>
      {near && webgl === true && <RibbonCanvas state={state} quality={mobile ? "mobile" : "desktop"} still={reduced} />}
      {webgl === false && <RibbonFallback />}
    </div>
  );
}
