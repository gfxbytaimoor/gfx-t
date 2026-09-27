"use client";

import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { AnchorFieldScene, type AnchorFieldState } from "./scenes/AnchorFieldScene";

type Props = {
  state: React.RefObject<AnchorFieldState>;
  quality: "desktop" | "mobile";
  still?: boolean;
};

/**
 * Canvas host for the Anchor Field. Rendering stops entirely when the canvas is off-screen,
 * pixel ratio is capped, and PerformanceMonitor steps the ratio down on struggling GPUs.
 */
export default function AnchorFieldCanvas({ state, quality, still }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const maxDpr = quality === "mobile" ? 1.5 : 1.75;
  const [dpr, setDpr] = useState(maxDpr);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "100px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={dpr}
        frameloop={still ? "demand" : visible ? "always" : "never"}
        camera={{ position: [0, 0, 11], fov: 35, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
        />
        <AnchorFieldScene state={state} quality={quality} still={still} />
      </Canvas>
    </div>
  );
}
