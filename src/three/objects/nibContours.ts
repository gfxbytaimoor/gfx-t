import { Path, Vector2 } from "three";

/**
 * The GFX-T pen-tool mark (from the logo) expressed as vector contours.
 * Units are arbitrary scene units; the mark is centred on the origin, nib pointing right,
 * exactly as it sits between the X and the T in the wordmark.
 *
 *   ferrules  nib body       anchor + handle bar
 *   ▯ ▯      ◀━━━━━━━━●      ● (circle)
 *                 slit ─────■ (anchor at the tip)
 *                              ● (circle)
 *   The Bézier arc that the pen "draws" runs from the top handle square, through the tip
 *   anchor, to the bottom handle square — this is the selected (yellow) path.
 */

export type Contour = {
  id: string;
  /** Evenly spaced samples along the contour (arc-length parameterised). */
  points: Vector2[];
  closed: boolean;
  /** Rendered as the "selected" path (signal yellow). */
  selected: boolean;
};

const OFFSET_X = -0.2;

function sample(path: Path, samples: number): Vector2[] {
  return path.getSpacedPoints(samples - 1).map((p) => new Vector2(p.x + OFFSET_X, p.y));
}

function rect(x0: number, x1: number, h: number) {
  const p = new Path();
  p.moveTo(x0, h);
  p.lineTo(x1, h);
  p.lineTo(x1, -h);
  p.lineTo(x0, -h);
  p.lineTo(x0, h);
  return p;
}

export function buildNibContours(samples = 128): Contour[] {
  // Nib body: flat back, bulging shoulders converging to the tip.
  const nib = new Path();
  nib.moveTo(-0.35, 0.95);
  nib.bezierCurveTo(0.35, 1.02, 1.0, 0.55, 1.5, 0);
  nib.bezierCurveTo(1.0, -0.55, 0.35, -1.02, -0.35, -0.95);
  nib.lineTo(-0.35, 0.95);

  const slit = new Path();
  slit.moveTo(1.5, 0);
  slit.lineTo(0.44, 0);

  const hole = new Path();
  hole.absarc(0.3, 0, 0.14, 0, Math.PI * 2, false);

  const ferruleA = rect(-0.78, -0.5, 0.72);
  const ferruleB = rect(-1.2, -0.94, 0.6);

  const handleBar = new Path();
  handleBar.moveTo(1.5, 1.45);
  handleBar.lineTo(1.5, -1.45);

  const arc = new Path();
  arc.moveTo(0.35, 1.6);
  arc.bezierCurveTo(1.05, 1.6, 1.5, 0.95, 1.5, 0);
  arc.bezierCurveTo(1.5, -0.95, 1.05, -1.6, 0.35, -1.6);

  return [
    { id: "nib", points: sample(nib, samples), closed: true, selected: false },
    { id: "slit", points: sample(slit, samples), closed: false, selected: false },
    { id: "hole", points: sample(hole, samples), closed: true, selected: false },
    { id: "ferrule-a", points: sample(ferruleA, samples), closed: true, selected: false },
    { id: "ferrule-b", points: sample(ferruleB, samples), closed: true, selected: false },
    { id: "handle", points: sample(handleBar, samples), closed: false, selected: false },
    { id: "arc", points: sample(arc, samples), closed: false, selected: true },
  ];
}

/** SVG path data for the same contours — used as the no-WebGL fallback. */
export function nibContoursToSvgPaths(contours: Contour[]) {
  return contours.map((c) => ({
    id: c.id,
    selected: c.selected,
    d:
      c.points
        .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(3)} ${(-p.y).toFixed(3)}`)
        .join(" ") + (c.closed ? " Z" : ""),
  }));
}
