"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";

registerGsap();

/**
 * Desktop only: the first child slides in from the left and the second from the right, easing
 * into their centred positions when the pair scrolls into view.
 */
export function SlideInPair({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const [left, right] = Array.from(ref.current!.children);
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 82%", once: true } });
        tl.from(left, { xPercent: -70, autoAlpha: 0, duration: 1.3, ease: "gfx.out" }).from(
          right,
          { xPercent: 70, autoAlpha: 0, duration: 1.3, ease: "gfx.out" },
          0.08,
        );
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}
