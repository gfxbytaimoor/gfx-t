"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";

const LenisContext = createContext<Lenis | null>(null);

/** Access the Lenis instance (null when reduced motion disables smooth scrolling). */
export const useLenis = () => useContext(LenisContext);

/**
 * Lenis driven by GSAP's ticker so ScrollTrigger and smooth scroll share one clock.
 * Disabled entirely under prefers-reduced-motion (native scrolling instead).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    registerGsap();
    if (reduced) return;

    const instance = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.4 });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- publishing an external instance
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
