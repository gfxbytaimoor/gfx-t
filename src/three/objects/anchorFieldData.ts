import { BufferAttribute, BufferGeometry, Sphere, Vector3 } from "three";
import { buildNibContours, type Contour } from "./nibContours";

/**
 * Buffers for the hero "Anchor Field". Each anchor point and each path vertex carries
 * three positions that the shaders blend between as the visitor scrolls:
 *   A — CREATE:     loose anchors scattered through depth
 *   B — STRATEGIZE: anchors ordered onto a flowing lattice of paths
 *   C — ELEVATE:    paths lift into stacked contours of the GFX-T pen nib
 */

export type AnchorFieldConfig = {
  /** Depth layers of the nib form (the "elevation"). */
  layers: number;
  /** Anchors riding along each path. */
  pointsPerCurve: number;
  /** Atmospheric anchors that never join a path. */
  freePoints: number;
  /** Vertices per path. */
  samples: number;
  seed?: number;
};

export const FIELD_PRESETS = {
  desktop: { layers: 6, pointsPerCurve: 16, freePoints: 90, samples: 112 },
  mobile: { layers: 4, pointsPerCurve: 9, freePoints: 40, samples: 72 },
} satisfies Record<string, AnchorFieldConfig>;

// Deterministic PRNG so server/client and reloads produce the same composition.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LATTICE_HALF_WIDTH = 6.4;
const LATTICE_HALF_HEIGHT = 3.2;
const FORM_DEPTH = 0.9;

type Curve = {
  contour: Contour;
  layer: number; // 0 = back, 1 = front
  latticeIndex: number;
  selectedB: boolean;
  selectedC: boolean;
  rand: number;
};

/** Lattice path i at parameter t ∈ [0,1]. */
function latticePoint(i: number, count: number, t: number, out: Vector3) {
  const y0 = -LATTICE_HALF_HEIGHT + (2 * LATTICE_HALF_HEIGHT * i) / Math.max(1, count - 1);
  const envelope = Math.sin(Math.PI * t);
  out.set(
    -LATTICE_HALF_WIDTH + 2 * LATTICE_HALF_WIDTH * t,
    y0 + 0.42 * Math.sin(t * Math.PI * 1.6 + i * 0.23) * envelope,
    -0.8 + 0.7 * Math.sin(t * Math.PI * 2 + i * 0.31),
  );
  return out;
}

function contourPoint(curve: Curve, t: number, layers: number, out: Vector3) {
  const pts = curve.contour.points;
  const f = t * (pts.length - 1);
  const i = Math.min(Math.floor(f), pts.length - 2);
  const k = f - i;
  const x = pts[i].x + (pts[i + 1].x - pts[i].x) * k;
  const y = pts[i].y + (pts[i + 1].y - pts[i].y) * k;
  const z = layers > 1 ? -FORM_DEPTH + FORM_DEPTH * curve.layer : 0;
  return out.set(x, y, z);
}

const tmpA = new Vector3();
const tmpB = new Vector3();

function tangentOf(fn: (t: number, out: Vector3) => Vector3, t: number, out: Vector3) {
  const e = 0.004;
  fn(Math.min(1, t + e), tmpA);
  fn(Math.max(0, t - e), tmpB);
  out.subVectors(tmpA, tmpB);
  if (out.lengthSq() < 1e-8) out.set(1, 0, 0);
  return out.normalize();
}

export type AnchorFieldBuffers = {
  paths: BufferGeometry;
  anchors: BufferGeometry;
  handles: BufferGeometry;
  handleEnds: BufferGeometry;
  counts: { anchors: number; curves: number };
};

export function buildAnchorField(config: AnchorFieldConfig): AnchorFieldBuffers {
  const { layers, pointsPerCurve, freePoints, samples } = config;
  const rand = mulberry32(config.seed ?? 2020);
  const contours = buildNibContours(samples);

  const curves: Curve[] = [];
  for (let l = 0; l < layers; l++) {
    const layer = layers > 1 ? l / (layers - 1) : 1;
    for (const contour of contours) {
      curves.push({
        contour,
        layer,
        latticeIndex: curves.length,
        selectedB: contour.selected && l % 3 === (layers - 1) % 3,
        selectedC: contour.selected && l === layers - 1,
        rand: rand(),
      });
    }
  }
  const curveCount = curves.length;

  // ---------------------------------------------------------------- paths (LineSegments)
  const segs = samples - 1;
  const pathVerts = curveCount * segs * 2;
  const pB = new Float32Array(pathVerts * 3);
  const pC = new Float32Array(pathVerts * 3);
  const pT = new Float32Array(pathVerts);
  const pSelB = new Float32Array(pathVerts);
  const pSelC = new Float32Array(pathVerts);
  const pLayer = new Float32Array(pathVerts);
  const pRand = new Float32Array(pathVerts);

  const v = new Vector3();
  let w = 0;
  for (const curve of curves) {
    for (let s = 0; s < segs; s++) {
      for (const j of [s, s + 1]) {
        const t = j / (samples - 1);
        latticePoint(curve.latticeIndex, curveCount, t, v).toArray(pB, w * 3);
        contourPoint(curve, t, layers, v).toArray(pC, w * 3);
        pT[w] = t;
        pSelB[w] = curve.selectedB ? 1 : 0;
        pSelC[w] = curve.selectedC ? 1 : 0;
        pLayer[w] = curve.layer;
        pRand[w] = curve.rand;
        w++;
      }
    }
  }

  const paths = new BufferGeometry();
  // `position` is required by three for bounds; the shader uses aPosB/aPosC.
  paths.setAttribute("position", new BufferAttribute(pB, 3));
  paths.setAttribute("aPosB", new BufferAttribute(pB, 3));
  paths.setAttribute("aPosC", new BufferAttribute(pC, 3));
  paths.setAttribute("aT", new BufferAttribute(pT, 1));
  paths.setAttribute("aSelB", new BufferAttribute(pSelB, 1));
  paths.setAttribute("aSelC", new BufferAttribute(pSelC, 1));
  paths.setAttribute("aLayer", new BufferAttribute(pLayer, 1));
  paths.setAttribute("aRand", new BufferAttribute(pRand, 1));

  // ---------------------------------------------------------------- anchors (Points)
  const anchorCount = curveCount * pointsPerCurve + freePoints;
  const A = new Float32Array(anchorCount * 3);
  const B = new Float32Array(anchorCount * 3);
  const C = new Float32Array(anchorCount * 3);
  const tA = new Float32Array(anchorCount * 3);
  const tB = new Float32Array(anchorCount * 3);
  const tC = new Float32Array(anchorCount * 3);
  const aRand = new Float32Array(anchorCount);
  const aShape = new Float32Array(anchorCount);
  const aSelB = new Float32Array(anchorCount);
  const aSelC = new Float32Array(anchorCount);
  const aLayer = new Float32Array(anchorCount);
  const aFree = new Float32Array(anchorCount);

  const randomScatter = (out: Vector3) =>
    // Shallow depth band: anchors read as placed points on a canvas, not a starfield.
    out.set((rand() * 2 - 1) * 7.2, (rand() * 2 - 1) * 4.0, -2.6 + rand() * 3.4);
  const randomDir = (out: Vector3) =>
    out.set(rand() * 2 - 1, rand() * 2 - 1, (rand() * 2 - 1) * 0.3).normalize();

  let n = 0;
  const pos = new Vector3();
  const tan = new Vector3();
  for (const curve of curves) {
    const lattice = (t: number, out: Vector3) => latticePoint(curve.latticeIndex, curveCount, t, out);
    const form = (t: number, out: Vector3) => contourPoint(curve, t, layers, out);
    for (let k = 0; k < pointsPerCurve; k++) {
      const t = Math.min(1, (k + 0.15 + rand() * 0.7) / pointsPerCurve);
      randomScatter(pos).toArray(A, n * 3);
      randomDir(tan).toArray(tA, n * 3);
      lattice(t, pos).toArray(B, n * 3);
      tangentOf(lattice, t, tan).toArray(tB, n * 3);
      form(t, pos).toArray(C, n * 3);
      tangentOf(form, t, tan).toArray(tC, n * 3);
      aRand[n] = rand();
      aShape[n] = rand() < 0.62 ? 1 : 0;
      aSelB[n] = curve.selectedB ? 1 : 0;
      aSelC[n] = curve.selectedC ? 1 : 0;
      aLayer[n] = curve.layer;
      aFree[n] = 0;
      n++;
    }
  }
  for (let f = 0; f < freePoints; f++, n++) {
    randomScatter(pos);
    pos.toArray(A, n * 3);
    // Free anchors retreat into the background as the form assembles.
    pos.multiplyScalar(1.15).setZ(pos.z - 3).toArray(B, n * 3);
    pos.toArray(C, n * 3);
    randomDir(tan);
    tan.toArray(tA, n * 3);
    tan.toArray(tB, n * 3);
    tan.toArray(tC, n * 3);
    aRand[n] = rand();
    aShape[n] = rand() < 0.5 ? 1 : 0;
    aLayer[n] = 0;
    aFree[n] = 1;
  }

  const anchorAttrs: Record<string, [Float32Array, number]> = {
    aPosA: [A, 3],
    aPosB: [B, 3],
    aPosC: [C, 3],
    aTanA: [tA, 3],
    aTanB: [tB, 3],
    aTanC: [tC, 3],
    aRand: [aRand, 1],
    aShape: [aShape, 1],
    aSelB: [aSelB, 1],
    aSelC: [aSelC, 1],
    aLayer: [aLayer, 1],
    aFree: [aFree, 1],
  };

  /** Build a geometry where every anchor is repeated once per entry in `sides`. */
  const expand = (sides: number[]) => {
    const g = new BufferGeometry();
    const reps = sides.length;
    for (const [name, [src, size]] of Object.entries(anchorAttrs)) {
      const out = new Float32Array(anchorCount * reps * size);
      for (let i = 0; i < anchorCount; i++)
        for (let r = 0; r < reps; r++)
          for (let c = 0; c < size; c++) out[(i * reps + r) * size + c] = src[i * size + c];
      g.setAttribute(name, new BufferAttribute(out, size));
    }
    const side = new Float32Array(anchorCount * reps);
    for (let i = 0; i < anchorCount; i++) for (let r = 0; r < reps; r++) side[i * reps + r] = sides[r];
    g.setAttribute("aSide", new BufferAttribute(side, 1));
    g.setAttribute("position", g.getAttribute("aPosA"));
    return g;
  };

  const anchors = expand([0]);
  // Handles: two line segments per anchor, centre → +handle and centre → −handle.
  const handles = expand([0, 1, 0, -1]);
  // Handle end knobs (the logo's small circles).
  const handleEnds = expand([1, -1]);

  // Generous bounds: shader-driven positions make CPU-computed bounds meaningless.
  for (const g of [paths, anchors, handles, handleEnds]) g.boundingSphere = new Sphere(new Vector3(), 40);

  return { paths, anchors, handles, handleEnds, counts: { anchors: anchorCount, curves: curveCount } };
}
