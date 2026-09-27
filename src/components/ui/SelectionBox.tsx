import { cn } from "@/lib/cn";

type Props = {
  visible: boolean;
  /**
   * "signal" marks the one selected thing on ink; "ink" is the same on paper (yellow hairlines
   * disappear there); "muted" frames placeholders that are not selected.
   */
  tone?: "signal" | "ink" | "muted";
  className?: string;
};

/**
 * A design-tool bounding box: hairline frame with square handles at the corners.
 * The site's "this is selected" mark — used by the hero headline, client tiles and service rows.
 */
export function SelectionBox({ visible, tone = "signal", className }: Props) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute border transition-opacity duration-500",
        { signal: "border-signal/80", ink: "border-ink-950/70", muted: "border-ink-700" }[tone],
        visible ? "opacity-100" : "opacity-0",
        className ?? "-left-[0.1em] -right-[0.04em] bottom-[0.02em] top-[0.08em]",
      )}
    >
      {["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((pos) => (
        <span
          key={pos}
          className={cn(
            "absolute size-2 border",
            { signal: "border-signal bg-ink-950", ink: "border-ink-950 bg-paper", muted: "border-ink-500 bg-ink-950" }[tone],
            pos,
          )}
        />
      ))}
    </span>
  );
}
