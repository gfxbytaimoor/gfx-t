"use client";

import { cn } from "@/lib/cn";

export type FilterOption<T extends string> = { id: T; label: string; count: number };

type Props<T extends string> = {
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Surface the row sits on. */
  tone?: "ink" | "paper";
};

/** Toggle-button filter row. The selected option is the one yellow fill in view. */
export function FilterChips<T extends string>({ label, options, value, onChange, tone = "ink" }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o.id;
        const empty = o.count === 0;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            disabled={empty}
            onClick={() => onChange(o.id)}
            className={cn(
              "label flex h-11 items-center gap-3 border px-4 transition-colors duration-300",
              on
                ? "border-signal bg-signal text-ink-950"
                : tone === "ink"
                  ? "border-ink-700 text-paper enabled:hover:border-paper disabled:cursor-not-allowed disabled:text-ink-500"
                  : "border-ink-950/25 text-ink-950 enabled:hover:border-ink-950 disabled:cursor-not-allowed disabled:text-ink-400",
            )}
          >
            {o.label}
            <span className={on ? "text-ink-800" : tone === "ink" ? "text-ink-400" : "text-ink-700"}>{String(o.count).padStart(2, "0")}</span>
          </button>
        );
      })}
    </div>
  );
}
