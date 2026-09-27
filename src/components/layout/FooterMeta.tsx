"use client";

import { useEffect, useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Karachi",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Studio local time (Lahore). Rendered after mount so server and client HTML always match. */
export function StudioTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums">
      Lahore <span className="text-paper">{time ?? "--:--"}</span> PKT
    </span>
  );
}

export function BackToTop() {
  const lenis = useLenis();
  return (
    <button
      type="button"
      onClick={() => {
        if (lenis) lenis.scrollTo(0, { duration: 1.4 });
        else window.scrollTo({ top: 0 });
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
      className="group flex items-center gap-2 transition-colors hover:text-paper"
    >
      Back to top
      <span aria-hidden className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5">
        ↑
      </span>
    </button>
  );
}
