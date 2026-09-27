import { buildNibContours, nibContoursToSvgPaths } from "@/three/objects/nibContours";

const paths = nibContoursToSvgPaths(buildNibContours(48));

/** Static nib mark drawn from the same contour data as the WebGL scene (no-WebGL fallback). */
export function HeroFallback() {
  return (
    <svg
      viewBox="-1.8 -2 3.8 4"
      aria-hidden
      className="absolute right-[6%] top-[14%] h-[52%] w-auto opacity-80 max-md:left-1/2 max-md:right-auto max-md:top-[12%] max-md:h-[34%] max-md:-translate-x-1/2"
      fill="none"
      strokeWidth="0.012"
    >
      {paths.map((p) => (
        <path key={p.id} d={p.d} stroke={p.selected ? "var(--color-signal)" : "var(--color-paper)"} />
      ))}
    </svg>
  );
}
