"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Gentle fade-up for any element marked `data-reveal`, as it scrolls into view. CSS transitions
 * + one IntersectionObserver (cheap on phones). The hidden start state only applies once this has
 * run (`html.reveal-ready`), so content is never stuck invisible without JS. Siblings stagger.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("reveal-ready");
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    els.forEach((el) => {
      const siblings = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.hasAttribute("data-reveal")) : [];
      el.style.transitionDelay = `${(Math.max(0, siblings.indexOf(el)) % 4) * 90}ms`;
    });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
