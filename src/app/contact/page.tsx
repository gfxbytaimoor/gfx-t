import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/PageIntro";
import { CopyButton } from "@/components/ui/CopyButton";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { ActionLink } from "@/components/buttons/ActionLink";
import { contactIntro } from "@/data/company";
import { contact, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: contactIntro,
  alternates: { canonical: "/contact" },
};

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address.full)}`;
const card = "flex flex-col border border-ink-800 bg-ink-900 p-6 md:p-8";

export default function ContactPage() {
  return (
    <>
      <PageIntro index="07" eyebrow="Get in touch" title="Contact Us" lead={contactIntro} />

      <section aria-labelledby="details-heading" className="container-page py-12 md:py-16">
        <h2 id="details-heading" className="font-display text-[clamp(1.75rem,1.1rem+2.2vw,3rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
          Let&apos;s create something <span className="text-signal">amazing.</span>
        </h2>

        <address className="mt-8 grid gap-4 not-italic md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          <div data-reveal className={card}>
            <p className="label text-ink-400">Email</p>
            <a href={mailto()} className="mt-3 break-all text-xl font-medium text-paper transition-colors hover:text-signal md:text-2xl">
              {contact.email}
            </a>
            <div className="mt-auto flex flex-wrap gap-3 pt-6">
              <ActionLink href={mailto("Project enquiry")} variant="primary" size="sm">
                Email us
              </ActionLink>
              <CopyButton value={contact.email} label="Copy" />
            </div>
          </div>

          <div data-reveal className={card}>
            <p className="label text-ink-400">Phone</p>
            <ul className="mt-3 space-y-3">
              {contact.phones.map((p) => (
                <li key={p.href}>
                  <a href={p.href} className="text-xl font-medium text-paper transition-colors hover:text-signal">
                    {p.display}
                  </a>
                  {p.label && <span className="label mt-1 block text-signal">{p.label}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal className={`${card} md:col-span-2 lg:col-span-1`}>
            <p className="label text-ink-400">Studio</p>
            <p className="mt-3 text-xl font-medium text-paper">
              {contact.address.street}
              <br />
              {contact.address.city}, {contact.address.country}
            </p>
            <div className="mt-auto pt-6">
              <ActionLink href={mapsHref} size="sm">
                Open in Maps
              </ActionLink>
            </div>
          </div>
        </address>

        <div data-reveal className="mt-4 flex flex-col gap-5 border border-ink-800 bg-ink-900 p-6 sm:flex-row sm:items-center sm:justify-between md:mt-6 md:p-8">
          <div>
            <p className="label text-ink-400">Follow us</p>
            <p className="mt-2 text-lg font-medium text-paper">See our latest work on social media.</p>
          </div>
          <SocialLinks size="lg" />
        </div>
      </section>
    </>
  );
}
