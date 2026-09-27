import type { ReactNode } from "react";
import { MobileShapes } from "@/components/ui/MobileShapes";
import { RevealText } from "@/components/typography/RevealText";
import { SectionLabel } from "@/components/typography/SectionLabel";
import { cn } from "@/lib/cn";

type Props = {
  index: string;
  eyebrow: string;
  title: string;
  /** Secondary heading set under the title (e.g. "Welcome to GFX-T"). */
  subtitle?: string;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/**
 * Opening block for inner pages. One left edge for everything (label, title, subtitle, lead),
 * a capped title size, and compact spacing so the page content starts soon after.
 */
export function PageIntro({ index, eyebrow, title, subtitle, lead, children, className }: Props) {
  return (
    <section className={cn("relative isolate border-b border-ink-800 pb-8 md:pb-16", className)}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-70 [background-image:radial-gradient(var(--color-ink-700)_1px,transparent_1.2px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_70%_80%_at_80%_20%,black,transparent_75%)]"
      />
      {/* Header is 72px tall; shapes sit just below it, beside the label row. */}
      <MobileShapes variant={3} topOffset={76} />
      <div className="container-page pt-[calc(var(--header-h)+clamp(2.5rem,6vw,5rem))]">
        <SectionLabel index={index}>{eyebrow}</SectionLabel>
        <RevealText
          as="h1"
          immediate
          delay={0.2}
          className="mt-6 max-w-[18ch] font-display text-[clamp(2.25rem,1.2rem+4.2vw,5.25rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.025em]"
        >
          {title}
        </RevealText>
        {subtitle && (
          <p className="mt-5 flex items-center gap-3 font-display text-[clamp(1.1rem,0.9rem+0.8vw,1.6rem)] font-bold uppercase text-paper">
            <span aria-hidden className="size-2.5 shrink-0 bg-signal" />
            {subtitle}
          </p>
        )}
        {lead && <div className="mt-6 max-w-2xl text-lead text-paper/80">{lead}</div>}
        {children}
      </div>
    </section>
  );
}
