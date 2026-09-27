"use client";

import { useRef } from "react";
import { clientCategories, clients } from "@/data/clients";
import { gsap, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { ClientMark } from "./ClientMark";

registerGsap();

/**
 * Industry bento: one dark card per category on the paper surface, with a count that runs up
 * when it scrolls into view and a preview of that category's logos.
 */
export function CategoryStats() {
  const ref = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from("[data-stat-card]", {
        y: 40,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const to = Number(el.dataset.count);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: to,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => (el.textContent = String(Math.round(obj.v)).padStart(2, "0")),
        });
      });
    },
    { scope: ref, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <ul ref={ref} className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {clientCategories.map((c) => {
        const list = clients.filter((x) => x.category === c.id);
        return (
          <li
            key={c.id}
            data-stat-card
            className="group relative overflow-hidden bg-ink-950 p-5 text-paper transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 md:p-6"
          >
            <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-signal transition-transform duration-500 group-hover:scale-x-100" />
            <p className="flex items-center justify-between font-display text-base font-bold uppercase tracking-[0.04em] text-paper md:text-lg">
              {c.label}
              <span aria-hidden className="size-2 bg-signal transition-transform duration-500 group-hover:rotate-45" />
            </p>
            <p className="mt-6 font-display text-[clamp(3rem,2rem+3vw,5rem)] font-extrabold leading-none text-signal transition-[font-variation-settings] duration-500 [font-variation-settings:'wdth'_100] group-hover:[font-variation-settings:'wdth'_120]">
              <span data-count={list.length}>{String(list.length).padStart(2, "0")}</span>
            </p>
            <p className="mt-1 text-sm text-paper/75">{list.length === 1 ? "brand" : "brands"}</p>
            <div aria-hidden className="mt-6 flex gap-1.5">
              {list.slice(0, 3).map((client) => (
                <span key={client.slug} className="grid h-12 flex-1 place-items-center overflow-hidden bg-paper px-1.5">
                  <ClientMark client={client} surface="paper" logoHeight={34} className="text-[0.6rem] text-ink-950" />
                </span>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
