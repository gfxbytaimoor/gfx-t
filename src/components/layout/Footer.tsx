import Image from "next/image";
import { navigation } from "@/data/navigation";
import { contact, mailto, site } from "@/lib/site";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { ActionLink } from "@/components/buttons/ActionLink";
import { BackToTop, StudioTime } from "./FooterMeta";
import { SocialLinks } from "@/components/ui/SocialLinks";

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address.full)}`;

const credits = [
  { name: "Hira Baig", href: "https://portfolio-website-new-opal.vercel.app/" },
  { name: "OBD", href: "https://omerbindawood.github.io/Portfolio-Website/" },
];

/** Label that rolls up to a signal-yellow copy on hover (same move as the header links). */
function Roll({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full">{children}</span>
      <span aria-hidden className="absolute inset-0 block translate-y-full text-signal transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0">
        {children}
      </span>
    </span>
  );
}

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-ink-800 bg-ink-950">
      <div aria-hidden className="absolute inset-0 -z-10 opacity-50 [background-image:radial-gradient(var(--color-ink-800)_1px,transparent_1.2px)] [background-size:28px_28px] [mask-image:linear-gradient(180deg,transparent,black_60%)]" />

      {/* Signature: the full wordmark as a faint layer behind the whole footer. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-16 -z-10 md:bottom-20">
        <div className="container-page">
          <Image src="/brand/gfxt-wordmark-paper.png" alt="" width={1330} height={226} sizes="100vw" className="h-auto w-full select-none opacity-[0.06]" />
        </div>
      </div>

      <div className="container-page grid gap-12 pb-16 pt-16 md:grid-cols-2 md:pb-28 md:pt-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="max-w-sm font-display text-2xl font-bold uppercase leading-tight">
            We create. We strategize. <span className="text-signal">We elevate.</span>
          </p>
          <p className="mt-4 max-w-sm text-sm text-paper/60">{site.tagline}</p>
          <div className="mt-8 flex justify-center md:justify-start">
            <ActionLink href="/contact" variant="primary">
              Start a project
            </ActionLink>
          </div>
        </div>

        <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-5">
          <p className="label mb-5 text-ink-400">Pages</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <TransitionLink href={item.href} className="group flex items-baseline gap-3 text-lg font-medium text-paper/85">
                  <span className="label text-ink-500 transition-colors group-hover:text-signal">{item.index}</span>
                  <Roll>{item.label}</Roll>
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <address className="not-italic lg:col-span-3">
          <p className="label mb-5 text-ink-400">Contact</p>
          <a href={mailto()} className="group block text-lg font-medium">
            <Roll>{contact.email}</Roll>
          </a>
          <ul className="mt-4 space-y-2">
            {contact.phones.map((p) => (
              <li key={p.href}>
                <a href={p.href} className="group inline-block text-paper/70">
                  <Roll>{p.display}</Roll>
                </a>
              </li>
            ))}
          </ul>
          <SocialLinks className="mt-6" />
        </address>

        <div className="lg:col-span-2">
          <p className="label mb-5 text-ink-400">Studio</p>
          <p className="text-paper/70">
            {contact.address.street}
            <br />
            {contact.address.city}, {contact.address.country}
          </p>
          <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="label mt-4 inline-flex items-center gap-2 text-paper hover:text-signal">
            Open in Maps <span aria-hidden>↗</span>
          </a>
          <p className="label mt-6 text-ink-400">
            <StudioTime />
          </p>
        </div>
      </div>

      <div className="relative border-t border-ink-800 bg-ink-950">
        <div className="container-page label flex flex-col gap-3 py-5 text-ink-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-6">
            <span>Since {site.founded}</span>
            <BackToTop />
          </p>
        </div>
      </div>

      {/* Credits */}
      <div className="border-t border-ink-800 bg-ink-950">
        <p className="container-page label flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-4 text-center text-ink-400">
          <span className="flex items-center gap-2">
            <span aria-hidden className="size-1.5 bg-signal" />
            Designed &amp; developed by
          </span>
          <span className="flex items-center gap-4">
            {credits.map((c, i) => (
              <span key={c.name} className="flex items-center gap-4">
                {i > 0 && <span aria-hidden className="text-ink-500">&amp;</span>}
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center font-medium text-paper transition-colors duration-300 hover:text-signal"
                >
                  {c.name}
                  <span aria-hidden className="absolute -right-3 top-0 -translate-x-1 opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    ↗
                  </span>
                  <span aria-hidden className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-signal transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                </a>
              </span>
            ))}
          </span>
        </p>
      </div>
    </footer>
  );
}
