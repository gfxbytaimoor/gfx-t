import Image from "next/image";
import { MobileShapes } from "@/components/ui/MobileShapes";
import { leaders } from "@/data/management";
import { ActionLink } from "@/components/buttons/ActionLink";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { SectionLabel } from "@/components/typography/SectionLabel";
import { cn } from "@/lib/cn";
import { SlideInPair } from "./SlideInPair";

/**
 * LEADERSHIP — the CEO and COO as two portrait cards (photos shown as supplied: no filters).
 * The cards are not links; the one "Meet our CEO & COO" button leads to the full profiles.
 */
export function Leadership({ index, compact, className }: { index: string; compact?: boolean; className?: string }) {
  return (
    <section aria-labelledby="leadership-heading" className={cn("relative isolate overflow-x-clip bg-ink-900", compact ? "py-10 md:py-14" : "pb-10 pt-16 md:pb-14 md:pt-24", className)}>
      <MobileShapes variant={2} />
      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel index={index}>Leadership</SectionLabel>
            <SectionHeading id="leadership-heading" accent="Management" size={compact ? "md" : "lg"} className={compact ? "mt-6" : "mt-8"}>
              Our Management
            </SectionHeading>
          </div>
          <div>
            <ActionLink href="/management" variant="primary" size="lg" wrap>
              Meet our CEO &amp; COO
            </ActionLink>
          </div>
        </div>

        <SlideInPair className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 md:mt-12 md:gap-6">
          {leaders.map((l) => (
            <li key={l.slug}>
              <div className="relative overflow-hidden border border-ink-800 bg-ink-900">
                <span className="relative block aspect-[4/5] overflow-hidden">
                  <Image src={l.portrait.src} alt={l.portrait.alt} fill sizes="(max-width: 640px) 100vw, 440px" quality={90} className="object-cover object-top" />
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-950/90 to-transparent" />
                  <span className="label absolute left-4 top-4 bg-signal px-2.5 py-1.5 font-medium text-ink-950">{l.role}</span>
                </span>
                <span className="absolute inset-x-0 bottom-0 block p-4 md:p-5">
                  <span>
                    <span className="block font-display text-[clamp(1.1rem,0.9rem+0.8vw,1.5rem)] font-extrabold uppercase leading-tight text-paper">
                      {l.name}
                    </span>
                    <span className="mt-2 block text-sm text-paper/80">
                      <span className="font-semibold text-signal">{l.experience.value}</span> {l.experience.unit}
                      {l.reach.length > 0 && <> · {l.reach.join(", ")}</>}
                    </span>
                  </span>
                </span>
              </div>
            </li>
          ))}
        </SlideInPair>
      </div>
    </section>
  );
}
