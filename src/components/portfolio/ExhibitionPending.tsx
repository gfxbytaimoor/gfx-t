import { portfolioCategories } from "@/data/portfolio";
import { mailto } from "@/lib/site";
import { ActionLink } from "@/components/buttons/ActionLink";
import { SelectionBox } from "@/components/ui/SelectionBox";

/**
 * Shown until real work is added to `data/portfolio.ts`. The exhibition's rooms are drawn as
 * empty artboards — an honest "being installed" state rather than placeholder imagery.
 */
export function ExhibitionPending() {
  return (
    <div className="container-page">
      <ol className="grid grid-cols-2 border-l border-t border-ink-800 lg:grid-cols-4">
        {portfolioCategories.map((c, i) => (
          <li key={c.id} className="border-b border-r border-ink-800 p-2 md:p-4">
            <div className="relative flex aspect-[3/4] flex-col justify-between p-3 md:aspect-[4/5] md:p-5 [background-image:radial-gradient(var(--color-ink-800)_1px,transparent_1.2px)] [background-size:20px_20px]">
              <SelectionBox visible tone="muted" className="inset-0" />
              <p className="label text-ink-400">Room {String(i + 1).padStart(2, "0")}</p>
              <div>
                <p className="font-display text-lead font-semibold uppercase md:text-h3">{c.label}</p>
                <p className="label mt-3 flex items-center gap-2 text-ink-400">
                  <span aria-hidden className="size-1.5 animate-pulse bg-signal motion-reduce:animate-none" />
                  Being installed
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-12 flex flex-col gap-6 md:ml-[33%] md:flex-row md:items-center md:justify-between">
        <p className="max-w-md text-paper/80">Portfolio pieces are being prepared and will be published here.</p>
        <ActionLink href={mailto("Portfolio request")} variant="primary">
          Request our portfolio
        </ActionLink>
      </div>
    </div>
  );
}
