"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

let registered = false;

/** Register plugins once; safe to call from any client module. */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase, Flip, useGSAP);
  CustomEase.create("gfx.out", "0.16, 1, 0.3, 1");
  CustomEase.create("gfx.inOut", "0.76, 0, 0.24, 1");
  gsap.defaults({ ease: "gfx.out", duration: 0.8 });
  registered = true;
}

/** Motion tokens — mirror the CSS custom properties in globals.css. */
export const motion = {
  duration: { fast: 0.2, base: 0.45, slow: 0.8, scene: 1.2 },
  ease: { out: "gfx.out", inOut: "gfx.inOut" },
  stagger: { chars: 0.018, words: 0.04, lines: 0.08, items: 0.06 },
} as const;

export { gsap, Flip, ScrollTrigger, SplitText, useGSAP };
