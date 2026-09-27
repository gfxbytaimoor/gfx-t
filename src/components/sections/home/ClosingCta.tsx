import { closingCta } from "@/data/company";
import { contact, mailto } from "@/lib/site";
import { ActionLink } from "@/components/buttons/ActionLink";
import { RevealText } from "@/components/typography/RevealText";
import { SectionLabel } from "@/components/typography/SectionLabel";
import { RibbonStage } from "@/three/RibbonStage";
import { SocialLinks } from "@/components/ui/SocialLinks";

/**
 * STILL THINKING? — the closing frame. Above the copy flows the Signal Ribbon: a band of fine
 * lines twisting through space in the brand's yellows, rising as the section arrives and leaning
 * toward the pointer. The site opens with anchors and closes with a ribbon of paths.
 */
export function ClosingCta() {
  return (
    <section aria-labelledby="closing-heading" className="relative isolate min-h-svh overflow-hidden bg-ink-950">
      {/* Signal Ribbon across the upper part of the frame. */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[48%] [mask-image:linear-gradient(180deg,transparent_0%,black_4%,black_70%,transparent_100%)] md:h-[58%]">
        <RibbonStage />
      </div>

      <div className="container-page flex min-h-svh flex-col justify-end pb-12 pt-[36svh] md:pb-16 lg:pt-[42svh]">
        <SectionLabel index="09" className="self-start">
          Your move
        </SectionLabel>
        <h2
          id="closing-heading"
          className="group/cta mt-8 font-display text-[clamp(2.8rem,8vw,8.5rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.03em] "
        >
          <span className="block">Still</span>
          <span className="relative inline-block text-signal transition-[font-variation-settings] duration-700 ease-[var(--ease-out-expo)] [font-variation-settings:'wdth'_100] group-hover/cta:[font-variation-settings:'wdth'_118]">
            Thinking?
            <span aria-hidden className="absolute -bottom-[0.04em] left-0 h-[0.08em] w-full origin-left skew-x-[-24deg] scale-x-[0.35] bg-signal transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/cta:scale-x-100" />
          </span>
        </h2>

        <div className="mt-12 grid gap-10 border-t border-ink-800 pt-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <RevealText split="words" className="text-lead text-paper/85">
              {closingCta.body}
            </RevealText>
            <div className="mt-8 flex flex-col items-center gap-6 md:items-start">
              <ActionLink href="/contact" variant="primary" size="lg">
                Contact us
              </ActionLink>
              <SocialLinks />
            </div>
          </div>
          <address className="grid gap-6 not-italic sm:grid-cols-2 md:col-span-7">
            <a href={mailto("Project enquiry")} className="group block border-l-2 border-ink-700 pl-5 transition-colors hover:border-signal">
              <span className="label block text-ink-400">Email us</span>
              <span className="mt-2 block text-h3 leading-tight transition-colors group-hover:text-signal">{contact.email}</span>
            </a>
            <a href={contact.ceoPhone.href} className="group block border-l-2 border-ink-700 pl-5 transition-colors hover:border-signal">
              <span className="label block text-ink-400">Book a call with our CEO &amp; Founder</span>
              <span className="mt-2 block text-h3 leading-tight transition-colors group-hover:text-signal">{contact.ceoPhone.display}</span>
            </a>
          </address>
        </div>
      </div>
    </section>
  );
}
