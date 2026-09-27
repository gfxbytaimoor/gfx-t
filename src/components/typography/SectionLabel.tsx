import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  index?: string;
  children: ReactNode;
  tone?: "ink" | "paper" | "signal";
  className?: string;
  /** Render as a heading when the label is the section's only title. */
  as?: "p" | "h1" | "h2";
  id?: string;
};

/** Chapter chip: a solid index block beside the chapter name. Tone is the surface it sits on. */
export function SectionLabel({ index, children, tone = "ink", className, as: Tag = "p", id }: Props) {
  const skin = {
    ink: { box: "border-ink-700 text-paper", index: "bg-signal text-ink-950" },
    paper: { box: "border-ink-950/25 text-ink-950", index: "bg-ink-950 text-signal" },
    signal: { box: "border-ink-950/40 text-ink-950", index: "bg-ink-950 text-signal" },
  }[tone];
  return (
    <Tag id={id} className={cn("label inline-flex items-stretch border font-medium", skin.box, className)}>
      {index && <span className={cn("grid place-items-center px-2.5 py-1.5", skin.index)}>{index}</span>}
      <span className="flex items-center px-3 py-1.5">{children}</span>
    </Tag>
  );
}
