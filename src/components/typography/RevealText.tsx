"use client";

import { useRef, type ReactNode } from "react";
import { gsap, motion, SplitText, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";

registerGsap();

type Props = {
  as?: "p" | "h1" | "h2" | "h3" | "div" | "span";
  children: ReactNode;
  className?: string;
  id?: string;
  /** "lines" rises each line out of a mask (headlines); "words" is a softer fade for body copy. */
  split?: "lines" | "words";
  /** Play on mount instead of when scrolled into view (page titles above the fold). */
  immediate?: boolean;
  delay?: number;
};

/**
 * The site's one text-reveal behaviour. Text is fully rendered on the server; the split only
 * happens client-side, so content is readable without JS and under reduced motion.
 */
export function RevealText({
  as: Tag = "p",
  children,
  className,
  id,
  split = "lines",
  immediate = false,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLParagraphElement>(null); // typed as <p> for JSX; used as a generic HTMLElement
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      const el = ref.current;
      SplitText.create(el, {
        type: split === "lines" ? "lines" : "words",
        mask: split === "lines" ? "lines" : undefined,
        autoSplit: true,
        aria: "auto",
        onSplit: (self) => {
          const targets = split === "lines" ? self.lines : self.words;
          return gsap.from(targets, {
            ...(split === "lines"
              ? { yPercent: 110, duration: motion.duration.scene, stagger: motion.stagger.lines }
              : { autoAlpha: 0, y: 10, duration: motion.duration.slow, stagger: motion.stagger.words / 2 }),
            delay,
            scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
          });
        },
      });
    },
    { scope: ref, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
