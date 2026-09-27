import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/PageIntro";
import { ClientsUniverse } from "@/components/clients/ClientsUniverse";
import { clientsTeaser } from "@/data/company";

export const metadata: Metadata = {
  title: "Clients",
  description: clientsTeaser.body,
  alternates: { canonical: "/clients" },
};

export default function ClientsPage() {
  return (
    <>
      <PageIntro index="05" eyebrow="Clients" title={clientsTeaser.heading} lead={clientsTeaser.body} />
      <section aria-label="Client list" className="bg-paper py-16 text-ink-950 md:py-24">
        <div className="container-page">
          <ClientsUniverse />
        </div>
      </section>
    </>
  );
}
