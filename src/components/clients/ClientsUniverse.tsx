"use client";

import { useRef, useState } from "react";
import { clientCategories, clients, type ClientCategory } from "@/data/clients";
import { Flip, gsap, motion, useGSAP, registerGsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/device";
import { ClientMark } from "./ClientMark";
import { SelectionBox } from "@/components/ui/SelectionBox";
import { FilterChips, type FilterOption } from "@/components/ui/FilterChips";

registerGsap();

type Filter = ClientCategory | "all";

const labelFor = (id: ClientCategory) => clientCategories.find((c) => c.id === id)?.label ?? id;

/**
 * The client roster as a filterable wall. Filtering re-flows the tiles with FLIP so the
 * visitor can follow where each client goes; hidden tiles leave the layout entirely.
 */
export function ClientsUniverse() {
  const gridRef = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState>(null);
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("all");

  const filters: FilterOption<Filter>[] = [
    { id: "all", label: "All", count: clients.length },
    ...clientCategories.map((c) => ({ id: c.id, label: c.label, count: clients.filter((x) => x.category === c.id).length })),
  ];

  const choose = (next: Filter) => {
    if (next === filter) return;
    if (!reduced && gridRef.current) flipState.current = Flip.getState(gridRef.current.children);
    setFilter(next);
  };

  // Animate from the captured state once React has committed the new filter.
  useGSAP(
    () => {
      const state = flipState.current;
      if (!state || !gridRef.current) return;
      flipState.current = null;
      Flip.from(state, {
        targets: gridRef.current.children,
        duration: motion.duration.slow,
        ease: motion.ease.inOut,
        absolute: true,
        nested: true,
        stagger: 0.015,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: motion.duration.base, delay: 0.25 }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.94, duration: motion.duration.fast }),
      });
    },
    { dependencies: [filter] },
  );

  return (
    <div>
      <FilterChips label="Filter clients by industry" options={filters} value={filter} onChange={choose} tone="paper" />

      <p className="sr-only" aria-live="polite">
        Showing {filter === "all" ? "all clients" : `${labelFor(filter)} clients`}
      </p>

      <ul ref={gridRef} className="mt-10 grid grid-cols-2 border-l border-t border-ink-950/15 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        {clients.map((c, i) => {
          const shown = filter === "all" || c.category === filter;
          return (
            <li
              key={c.slug}
              data-flip-id={c.slug}
              hidden={!shown}
              className="group relative flex aspect-[4/3] flex-col justify-between border-b border-r border-ink-950/15 p-3 md:p-5"
            >
              <SelectionBox visible={false} tone="ink" className="inset-0 group-hover:opacity-100" />
              <div className="label flex justify-between gap-2 text-ink-700">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{labelFor(c.category)}</span>
              </div>
              <div className="flex flex-1 items-center justify-center py-3">
                <ClientMark
                  client={c}
                  surface="paper"
                  wrap
                  logoHeight={120}
                  className="max-h-[120px] text-center text-[clamp(1.05rem,0.8rem+1.2vw,1.8rem)] leading-none text-ink-950 grayscale opacity-80 transition-[filter,opacity] duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>
              <p aria-hidden={!!c.logo} className="label truncate text-ink-950">
                {c.name}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
