"use client";

import { useEffect, useRef, useState } from "react";
import { services, type Service } from "@/data/services";
import { ServiceGlyph } from "@/components/ui/ServiceGlyph";
import { SelectionBox } from "@/components/ui/SelectionBox";
import { cn } from "@/lib/cn";

/**
 * One service as an artboard: index, glyph, title and the full description are always visible.
 * Hover "selects" the artboard (bounding-box handles, dot grid, glyph redraw); the glyph also
 * draws itself once when the artboard first scrolls into view, which is all touch users need.
 */
export function ServiceArtboard({ service }: { service: Service }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [selected, setSelected] = useState(false);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const select = () => {
    setSelected(true);
    setReplay((n) => n + 1);
  };

  return (
    <article
      ref={ref}
      id={service.slug}
      aria-labelledby={`${service.slug}-title`}
      onPointerEnter={select}
      onPointerLeave={() => setSelected(false)}
      className="group relative flex h-full scroll-mt-28 flex-col p-6 md:p-8"
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-500 [background-image:radial-gradient(var(--color-ink-700)_1px,transparent_1.2px)] [background-size:24px_24px]",
          selected ? "opacity-100" : "opacity-0",
        )}
      />
      <SelectionBox visible={selected} className="inset-0" />

      <div className="relative flex items-start justify-between">
        <span className="label text-ink-400">
          <span className={selected ? "text-signal" : "text-paper"}>{service.index}</span> / {String(services.length).padStart(2, "0")}
        </span>
      </div>

      <div className="relative py-8">
        <ServiceGlyph glyph={service.glyph} play={inView} replayKey={replay} className="size-16 md:size-20" />
      </div>

      <div className="relative">
        <h2
          id={`${service.slug}-title`}
          className={cn(
            "font-display text-xl font-extrabold uppercase leading-tight transition-[font-variation-settings] duration-700 md:text-2xl",
            selected ? "[font-variation-settings:'wdth'_112]" : "[font-variation-settings:'wdth'_100]",
          )}
        >
          {service.title}
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-paper/75">{service.description}</p>
      </div>
    </article>
  );
}
