import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { site, contact } from "@/lib/site";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { TransitionProvider } from "@/components/transitions/TransitionProvider";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Cursor } from "@/components/ui/Cursor";
import { ScrollReveal } from "@/components/providers/ScrollReveal";

// Archivo's width axis ("wdth" 62–125) is used expressively: headlines widen on the "Elevate" beat.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
// The italic only sets the "Why choose us" headline (`font-logo`) on the home page, so it is a
// separate face that is not preloaded — every other page would download it for nothing.
const archivoItalic = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  style: "italic",
  variable: "--font-archivo-italic",
  display: "swap",
  preload: false,
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

const description = site.tagline;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Creative Agency in Lahore, Pakistan`,
    template: `%s — ${site.name}`,
  },
  description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: `${site.name} — We Create. We Strategize. We Elevate.`,
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — We Create. We Strategize. We Elevate.`,
    description,
  },
  formatDetection: { telephone: false },
  // The site is already dark: ask the Dark Reader extension not to restyle it. Its edits to SVG
  // icons and inline styles land before React hydrates and cause hydration mismatch errors.
  other: { "darkreader-lock": "true" },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  colorScheme: "dark",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description,
  url: site.url,
  logo: `${site.url}/brand/gfxt-logo-ink.png`,
  foundingDate: String(site.founded),
  email: contact.email,
  telephone: contact.phones.map((p) => p.display),
  address: {
    "@type": "PostalAddress",
    streetAddress: contact.address.street,
    addressLocality: contact.address.city,
    addressCountry: contact.address.countryCode,
  },
  founder: { "@type": "Person", name: "Syed Zamir Ahmad Naushahi" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: browser extensions (Grammarly, ColorZilla, password managers…)
    // add attributes to <html>/<body> before React loads. This ignores attribute differences on
    // these two elements only; mismatches anywhere inside the page are still reported.
    <html lang="en" className={`${archivo.variable} ${archivoItalic.variable} ${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <SmoothScroll>
          <TransitionProvider>
            <Header />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer />
            <Cursor />
            <ScrollReveal />
          </TransitionProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
