import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/PageIntro";
import { SectionLabel } from "@/components/typography/SectionLabel";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { Leadership } from "@/components/sections/shared/Leadership";
import { aboutParagraphs, aboutSummary, mission, vision, type Principle } from "@/data/company";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: aboutSummary,
  alternates: { canonical: "/about" },
};

// The second paragraph opens with the company's core belief; it is set as a pull-quote and the
// rest of the paragraph follows, so no sentence appears twice.
const [origin, philosophy] = aboutParagraphs;
const splitAt = philosophy.indexOf(". ") + 1;
const belief = philosophy.slice(0, splitAt);
const philosophyRest = philosophy.slice(splitAt).trim();

/** Services as named in the About copy ("Our services include …"). */
const aboutServices = ["Branding", "Social Media Management", "Digital Marketing", "Design", "Content Creation"];

function Principles({ title, items, accent }: { title: string; items: Principle[]; accent?: boolean }) {
  return (
    <article data-reveal className={accent ? "bg-signal p-6 text-ink-950 md:p-8" : "border border-ink-800 bg-ink-900 p-6 md:p-8"}>
      <h3 className="font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] font-extrabold uppercase leading-none">{title}</h3>
      <ol className="mt-6 space-y-5">
        {items.map((p) => (
          <li key={p.index} className={accent ? "border-t border-ink-950/20 pt-5" : "border-t border-ink-800 pt-5"}>
            <p className="flex items-baseline gap-3">
              <span className={accent ? "label text-ink-950/70" : "label text-signal"}>{p.index}</span>
              <span className="text-lg font-semibold">{p.title}</span>
            </p>
            <p className={accent ? "mt-2 text-[0.9375rem] leading-relaxed text-ink-900" : "mt-2 text-[0.9375rem] leading-relaxed text-paper/75"}>
              {p.body}
            </p>
          </li>
        ))}
      </ol>
    </article>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageIntro index="02" eyebrow="Our story" title="About Us" subtitle="Welcome to GFX-T" />

      {/* Story: facts on the left, the two paragraphs on the right, one shared top edge. */}
      <section aria-labelledby="story-heading" className="container-page grid gap-8 pb-12 pt-8 md:py-16 lg:grid-cols-12 lg:gap-12">
        <aside data-reveal className="lg:col-span-4">
          <dl className="grid gap-px border border-ink-800 bg-ink-800">
            <div className="bg-ink-950 p-5">
              <dt className="label text-ink-400">Founded</dt>
              <dd className="mt-2 font-display text-3xl font-extrabold text-signal">{site.founded}</dd>
              <dd className="mt-1 text-sm text-paper/70">During the COVID era</dd>
            </div>
            <div className="bg-ink-950 p-5">
              <dt className="label text-ink-400">Based in</dt>
              <dd className="mt-2 text-lg font-semibold text-paper">Lahore, Pakistan</dd>
            </div>
            <div className="bg-ink-950 p-5">
              <dt className="label text-ink-400">Our services include</dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {aboutServices.map((s) => (
                  <span key={s} className="label border border-ink-700 px-2.5 py-1.5 text-paper/85">
                    {s}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </aside>

        <div className="lg:col-span-8">
          <SectionLabel as="h2" id="story-heading" index="01">
            Where we started
          </SectionLabel>
          <p className="mt-6 text-lead text-paper/90">{origin}</p>

          <blockquote data-reveal className="mt-10 border-l-4 border-signal pl-6">
            <p className="font-display text-[clamp(1.4rem,1rem+1.5vw,2.25rem)] font-extrabold uppercase leading-tight">{belief}</p>
          </blockquote>
          <p className="mt-6 text-paper/80">{philosophyRest}</p>
        </div>
      </section>

      {/* Vision & Mission — the full principles (the home page shows the summaries). */}
      <section aria-labelledby="vm-heading" className="border-t border-ink-800 py-12 md:py-16">
        <div className="container-page">
          <SectionLabel index="02">Vision &amp; Mission</SectionLabel>
          <SectionHeading id="vm-heading" accent="drives" size="md" className="mt-6">
            What drives us
          </SectionHeading>
          <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
            <Principles title="Our Vision" items={vision} />
            <Principles title="Our Mission" items={mission} accent />
          </div>
        </div>
      </section>

      <Leadership index="03" compact />

    </>
  );
}
