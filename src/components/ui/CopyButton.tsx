"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/** Copies `value` to the clipboard and confirms inline (announced to screen readers). */
export function CopyButton({ value, label, className }: { value: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/insecure context): the value stays visible to copy by hand.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn("label inline-flex h-11 items-center gap-2 border border-ink-700 px-4 transition-colors hover:border-paper", className)}
    >
      <span aria-hidden className={cn("size-1.5 transition-colors", copied ? "bg-signal" : "bg-ink-500")} />
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
