import Image from "next/image";
import type { Client } from "@/data/clients";
import { cn } from "@/lib/cn";
import { artworkImageProps } from "@/lib/image";

type Props = {
  client: Client;
  /** Surface the mark sits on. */
  surface?: "ink" | "paper";
  className?: string;
  /**
   * Largest rendered height of a logo, in px. Logos are sized to a constant visual area
   * (optical balancing), so wide wordmarks come out shorter than compact marks.
   */
  logoHeight?: number;
  /** Let long names wrap (grid tiles); marquees keep them on one line. */
  wrap?: boolean;
};

/**
 * A client's mark. Uses the supplied logo file when `client.logo` is set; until then the name
 * is set as a typographic wordmark — never a fabricated logo.
 */
export function ClientMark({ client, surface = "ink", className, logoHeight = 40, wrap = false }: Props) {
  const { logo } = client;
  if (logo) {
    // Single-colour logos are shown monochrome so the wall reads as one system.
    const invert = (surface === "ink" && logo.tone === "dark") || (surface === "paper" && logo.tone === "light");
    // Equal area: a square mark gets ~80% of the max height, a 5:1 wordmark about 40%.
    const aspect = logo.width / logo.height;
    const height = Math.round(Math.min(logoHeight, (logoHeight * 0.8) / Math.sqrt(Math.max(aspect, 0.4))));
    return (
      <Image
        src={logo.src}
        width={logo.width}
        height={logo.height}
        alt={client.name}
        sizes="240px"
        {...artworkImageProps(logo.width)}
        style={{ height, width: "auto" }}
        className={cn("max-w-full object-contain", invert && "invert", className)}
      />
    );
  }
  return (
    <span className={cn("font-display font-semibold uppercase tracking-[-0.01em]", wrap ? "text-balance" : "whitespace-nowrap", className)}>
      {client.name}
    </span>
  );
}
