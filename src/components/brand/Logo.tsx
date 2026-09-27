import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  tone?: "paper" | "ink";
  /** "wordmark" omits the CREATIVE AGENCY line — use for compact placements. */
  variant?: "wordmark" | "full";
  className?: string;
  priority?: boolean;
};

const assets = {
  wordmark: { width: 1330, height: 226 },
  full: { width: 1330, height: 344 },
} as const;

export function Logo({ tone = "paper", variant = "wordmark", className, priority }: Props) {
  const { width, height } = assets[variant];
  const src =
    variant === "wordmark" ? `/brand/gfxt-wordmark-${tone}.png` : `/brand/gfxt-logo-${tone}.png`;
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt="GFX-T Creative Agency"
      // `priority` on next/image is deprecated in Next 16; above-the-fold logos just load eagerly.
      loading={priority ? "eager" : undefined}
      quality={90}
      sizes="(max-width: 768px) 140px, 240px"
      className={cn("h-auto select-none", className)}
    />
  );
}
