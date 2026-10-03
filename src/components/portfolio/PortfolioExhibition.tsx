"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { portfolio, portfolioCategories, portfolioNote, type PortfolioCategory, type PortfolioProject } from "@/data/portfolio";
import { mailto } from "@/lib/site";
import { artworkImageProps } from "@/lib/image";
import { Flip, gsap, motion, useGSAP, registerGsap } from "@/lib/motion";
import { useMediaQuery, useReducedMotion } from "@/lib/device";
import { FilterChips, type FilterOption } from "@/components/ui/FilterChips";
import { ActionLink } from "@/components/buttons/ActionLink";
import { ExhibitionPending } from "./ExhibitionPending";

registerGsap();

type Filter = PortfolioCategory | "all";

/**
 * PORTFOLIO — an exhibition wall. Pieces hang in a masonry of columns at their own proportions,
 * so every piece is shown whole (posters, standees and billboards alike), and re-flow with FLIP
 * when filtered. Each piece, in data order, joins the shortest column, so the wall reads left to
 * right in the same sequence as the home page and the columns finish level. The wall is for looking only: pieces are not links and do not open a viewer.
 * With no data it renders the pending exhibition instead.
 */
export function PortfolioExhibition({ projects = portfolio }: { projects?: PortfolioProject[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const reduced = useReducedMotion();
  // Column count per breakpoint (matches the 2 / 3 / 4 columns the wall used before).
  const md = useMediaQuery("(min-width: 768px)", true);
  const xl = useMediaQuery("(min-width: 1280px)", true);
  const columnCount = xl ? 4 : md ? 3 : 2;
  const wallRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState>(null);

  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);
  const isVisible = (p: PortfolioProject) => visible.includes(p);
  const works = projects.filter((p) => p.category !== "branding");
  const identities = projects.filter((p) => p.category === "branding");
  // Visible pieces go, in order, into whichever column is currently shortest (by the pieces'
  // proportions), so the sequence reads left to right and the columns end level instead of
  // leaving gaps. Filtered-out pieces stay mounted (hidden) for FLIP.
  const columns: PortfolioProject[][] = Array.from({ length: columnCount }, () => []);
  const heights = Array<number>(columnCount).fill(0);
  for (const p of works.filter(isVisible)) {
    const c = heights.indexOf(Math.min(...heights));
    columns[c].push(p);
    // Relative tile height: the image at column width plus a constant for the caption.
    heights[c] += p.cover.height / p.cover.width + 0.28;
  }
  columns[columnCount - 1].push(...works.filter((p) => !isVisible(p)));

  const choose = (next: Filter) => {
    if (next === filter) return;
    if (!reduced && wallRef.current) flipState.current = Flip.getState(wallRef.current.querySelectorAll("li"));
    setFilter(next);
  };

  useGSAP(
    () => {
      const state = flipState.current;
      if (!state || !wallRef.current) return;
      flipState.current = null;
      Flip.from(state, {
        targets: wallRef.current.querySelectorAll("li"),
        duration: motion.duration.slow,
        ease: motion.ease.inOut,
        absolute: true,
        stagger: 0.01,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: motion.duration.base, delay: 0.2 }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.94, duration: motion.duration.fast }),
      });
    },
    { dependencies: [filter] },
  );

  if (projects.length === 0) return <ExhibitionPending />;

  // Only categories that actually hold work are offered as filters.
  const options: FilterOption<Filter>[] = [
    { id: "all", label: "All", count: projects.length },
    ...portfolioCategories
      .map((c) => ({ id: c.id as Filter, label: c.label, count: projects.filter((p) => p.category === c.id).length }))
      .filter((o) => o.count > 0),
  ];

  return (
    <div className="container-page">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <FilterChips label="Filter work by category" options={options} value={filter} onChange={choose} />
        <p className="label text-ink-400" aria-live="polite">
          Showing <span className="text-paper">{String(visible.length).padStart(2, "0")}</span> pieces
        </p>
      </div>

      <div ref={wallRef} className="relative mt-10">
        {/* Posts and campaigns: a masonry of columns, each piece at its own proportions. */}
        <div hidden={!works.some(isVisible)} className="flex items-start gap-3 md:gap-5">
          {columns.map((col, c) => (
            <ol key={c} className="min-w-0 flex-1">
              {col.map((p) => (
                <li key={p.slug} data-flip-id={p.slug} hidden={!isVisible(p)} className="mb-6 md:mb-8">
                  <PieceTile project={p} number={projects.indexOf(p) + 1} />
                </li>
              ))}
            </ol>
          ))}
        </div>
        {/* Brand identities are all square cards, so they sit in an even grid of their own. */}
        <ol hidden={!identities.some(isVisible)} className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5 md:gap-y-8 xl:grid-cols-5">
          {identities.map((p) => (
            <li key={p.slug} data-flip-id={p.slug} hidden={!isVisible(p)}>
              <PieceTile project={p} number={projects.indexOf(p) + 1} />
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-12 flex flex-col gap-6 border border-ink-800 bg-ink-900 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <p className="max-w-md text-paper/80">{portfolioNote}</p>
        <ActionLink href={mailto("Portfolio request")} variant="primary" wrap>
          Request the complete portfolio
        </ActionLink>
      </div>
    </div>
  );
}

const TILE_SIZES = "(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw";

// Eager for every piece: in a column layout the tiles at the top of each column are not the first
// ones in the list, and the whole wall is light (small originals + optimised variants).
function PieceTile({ project, number }: { project: PortfolioProject; number: number }) {
  const { cover } = project;
  const identity = project.category === "branding";
  const loading = "eager";
  return (
    <figure>
      {identity ? (
        // Logos sit on a white card so each mark reads as it was designed; square artboards with
        // their own background fill the card edge to edge.
        <span className="relative block aspect-square overflow-hidden bg-white">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes={TILE_SIZES}
            loading={loading}
            {...artworkImageProps(cover.width)}
            className={cover.bleed ? "object-cover" : "object-contain p-[10%]"}
          />
        </span>
      ) : (
        // Shown whole, at the piece's own proportions.
        <Image
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          sizes={TILE_SIZES}
          loading={loading}
          {...artworkImageProps(cover.width)}
          className="block h-auto w-full bg-ink-850"
        />
      )}
      <figcaption className="mt-3 flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-paper">{project.title}</span>
          <span className="label mt-1 block leading-snug text-ink-400">{project.detail}</span>
        </span>
        <span className="label shrink-0 text-ink-400">{String(number).padStart(2, "0")}</span>
      </figcaption>
    </figure>
  );
}
