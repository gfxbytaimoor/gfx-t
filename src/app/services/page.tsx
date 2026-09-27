import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/PageIntro";
import { ServiceArtboard } from "@/components/services/ServiceArtboard";
import { ActionLink } from "@/components/buttons/ActionLink";
import { services, servicesIntro } from "@/data/services";
import { servicesTeaser } from "@/data/company";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description: servicesTeaser.body,
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageIntro index="03" eyebrow="What we do" title="Our Services" lead={servicesIntro}>
        {/* Quick index: every service reachable in one tap. */}
        <nav aria-label="Services index" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {services.map((s) => (
              <li key={s.slug}>
                <a
                  href={`#${s.slug}`}
                  className="label group inline-flex items-center gap-2 border border-ink-700 px-3 py-2 text-paper/85 transition-colors hover:border-signal hover:bg-signal hover:text-ink-950"
                >
                  <span className="text-signal group-hover:text-ink-950">{s.index}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageIntro>

      <section aria-label="Services" className="container-page py-12 md:py-16">
        <div className="grid border-l border-t border-ink-800 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((s) => (
            <div key={s.slug} data-reveal className="border-b border-r border-ink-800">
              <ServiceArtboard service={s} />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="services-cta" className="container-page pb-16 md:pb-24">
        <div data-reveal className="flex flex-col gap-8 border border-ink-800 bg-ink-900 p-6 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="label text-signal">Next step</p>
            <h2 id="services-cta" className="mt-3 font-display text-[clamp(1.5rem,1rem+1.8vw,2.5rem)] font-extrabold uppercase leading-tight">
              Book a call directly with our CEO &amp; Founder
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <ActionLink href={contact.ceoPhone.href} variant="primary">
              {contact.ceoPhone.display}
            </ActionLink>
            <ActionLink href="/contact">All contact details</ActionLink>
          </div>
        </div>
      </section>

    </>
  );
}
