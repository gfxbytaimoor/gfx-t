import { RevealText } from "./RevealText";
import { cn } from "@/lib/cn";

type Props = {
  children: string;
  /** Word(s) inside `children` to set as the accent. */
  accent?: string;
  /** Surface: yellow text on ink; on paper and signal surfaces the accent is ink on a highlight. */
  tone?: "ink" | "paper" | "signal";
  as?: "h1" | "h2";
  /** "lg": home chapters. "md": sections inside inner pages. */
  size?: "lg" | "md";
  id?: string;
  className?: string;
};

/**
 * Section title. Large display type with one accent word; on hover the heading widens along
 * Archivo's width axis and a signal underline sweeps under the accent.
 */
export function SectionHeading({ children, accent, tone = "ink", as = "h2", size = "lg", id, className }: Props) {
  const i = accent ? children.toLowerCase().indexOf(accent.toLowerCase()) : -1;
  const parts = i >= 0 && accent ? [children.slice(0, i), children.slice(i, i + accent.length), children.slice(i + accent.length)] : [children, "", ""];

  return (
    <RevealText
      as={as}
      id={id}
      className={cn(
        size === "lg" ? "text-h2" : "text-[clamp(2rem,1.2rem+3vw,4rem)]",
        "group/heading font-display font-extrabold uppercase tracking-[-0.025em] transition-[font-variation-settings] duration-700 ease-[var(--ease-out-expo)] [font-variation-settings:'wdth'_100] hover:[font-variation-settings:'wdth'_114]",
        className,
      )}
    >
      {parts[0]}
      {parts[1] && (
        <span
          className={cn(
            "relative inline-block",
            tone === "ink" ? "text-signal" : "text-ink-950",
          )}
        >
          {tone !== "ink" && <span aria-hidden className={cn("absolute inset-x-[-0.06em] bottom-[0.08em] top-[0.18em] -z-10", tone === "paper" ? "bg-signal" : "bg-paper")} />}
          {parts[1]}
          <span
            aria-hidden
            className={cn(
              "absolute -bottom-[0.06em] left-0 h-[0.07em] w-full origin-left scale-x-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/heading:scale-x-100",
              tone === "ink" ? "bg-signal" : "bg-ink-950",
            )}
          />
        </span>
      )}
      {parts[2]}
    </RevealText>
  );
}
