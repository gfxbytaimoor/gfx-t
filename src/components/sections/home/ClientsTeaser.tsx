import { clients, type Client } from "@/data/clients";
import { clientsTeaser } from "@/data/company";
import { ActionLink } from "@/components/buttons/ActionLink";
import { SectionHeading } from "@/components/typography/SectionHeading";
import { CategoryStats } from "@/components/clients/CategoryStats";
import { SectionLabel } from "@/components/typography/SectionLabel";
import { ClientMark } from "@/components/clients/ClientMark";

/**
 * CLIENTS TEASER — on paper so every logo shows in its own colours. The roster drifts past in two
 * counter-moving rows, desaturated until hovered. Pauses on hover/focus; static and scrollable
 * under reduced motion.
 */
export function ClientsTeaser() {
  const half = Math.ceil(clients.length / 2);
  const rows = [clients.slice(0, half), clients.slice(half)];

  return (
    <section aria-labelledby="clients-teaser-heading" className="overflow-hidden bg-paper py-[var(--spacing-section)] text-ink-950">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionLabel index="06" tone="paper">
              Clients
            </SectionLabel>
            <SectionHeading id="clients-teaser-heading" accent="Clients" tone="paper" className="mt-8">
              {clientsTeaser.heading}
            </SectionHeading>
          </div>
          <p className="self-end text-lead text-ink-800 lg:col-span-4 lg:col-start-9">{clientsTeaser.body}</p>
        </div>
        <div className="mt-12 md:mt-16">
          <CategoryStats />
        </div>
      </div>

      <ul className="sr-only">
        {clients.map((c) => (
          <li key={c.slug}>{c.name}</li>
        ))}
      </ul>
      <div aria-hidden className="mt-16 space-y-4 md:mt-24 md:space-y-6">
        {rows.map((row, i) => (
          <MarqueeRow key={i} clients={row} reverse={i === 1} />
        ))}
      </div>

      <div className="container-page mt-16 flex justify-center">
        <ActionLink href="/clients" variant="primary" tone="paper" size="lg">
          View all clients
        </ActionLink>
      </div>
    </section>
  );
}

function MarqueeRow({ clients: row, reverse }: { clients: Client[]; reverse?: boolean }) {
  // The list is rendered twice so the -50% loop is seamless.
  const items = [...row, ...row];
  return (
    <div className="marquee overflow-hidden motion-reduce:overflow-x-auto">
      <div
        className="marquee-track"
        style={{ "--marquee-duration": "70s", "--marquee-direction": reverse ? "reverse" : "normal" } as React.CSSProperties}
      >
        {items.map((c, i) => (
          <span key={`${c.slug}-${i}`} className="flex items-center">
            <span className="px-6 md:px-12">
              <ClientMark
                client={c}
                surface="paper"
                logoHeight={88}
                className="text-[clamp(1.75rem,1rem+3.2vw,4.5rem)] leading-none text-ink-950 grayscale opacity-75 transition-[filter,opacity] duration-500 hover:opacity-100 hover:grayscale-0 [font-variation-settings:'wdth'_108]"
              />
            </span>
            <span className="size-2 shrink-0 border border-ink-300" />
          </span>
        ))}
      </div>
    </div>
  );
}
