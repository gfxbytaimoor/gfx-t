"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion";
import { useFinePointer, useReducedMotion } from "@/lib/device";

/**
 * Pen-tool cursor. A small anchor point that follows the pointer.
 *  - default: 6px filled circle (the logo's anchor circle)
 *  - interactive (a, button, [data-cursor]): becomes an outlined square anchor
 *  - [data-cursor="view" | "drag"]: shows a short mono label beside the anchor
 * Only mounted for fine pointers without reduced-motion; the native cursor is untouched otherwise.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current!;
    const label = labelRef.current!;
    document.documentElement.classList.add("has-cursor");

    const xTo = gsap.quickTo(dot, "x", { duration: 0.18, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.18, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      dot.dataset.visible = "true";
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest<HTMLElement>(
        "a, button, [role='button'], input, textarea, select, label, [data-cursor]",
      );
      const mode = target?.dataset.cursor;
      const isText = target?.matches("input, textarea");
      dot.dataset.state = !target ? "default" : isText ? "text" : mode ? "label" : "link";
      label.textContent = mode ?? "";
    };

    const onLeave = () => (dot.dataset.visible = "false");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      data-state="default"
      data-visible="false"
      className="group pointer-events-none fixed left-0 top-0 z-[var(--z-cursor)] mix-blend-difference data-[visible=false]:opacity-0"
    >
      <span
        className="absolute block size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper transition-[width,height,border-radius,background-color] duration-200
          group-data-[state=link]:size-3 group-data-[state=link]:rounded-none group-data-[state=link]:border group-data-[state=link]:border-paper group-data-[state=link]:bg-transparent
          group-data-[state=label]:size-3 group-data-[state=label]:rounded-none group-data-[state=label]:bg-paper
          group-data-[state=text]:h-5 group-data-[state=text]:w-px group-data-[state=text]:rounded-none"
      />
      <span
        ref={labelRef}
        className="label absolute left-3 top-2 whitespace-nowrap text-paper opacity-0 transition-opacity duration-200 group-data-[state=label]:opacity-100"
      />
    </div>
  );
}
