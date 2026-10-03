"use client";
/* eslint-disable react-hooks/immutability -- R3F idiom: uniform objects are GPU-bound state
   mutated inside useFrame each frame, deliberately outside React's render cycle. */

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  Euler,
  Group,
  LinearSRGBColorSpace,
  Matrix3,
  Matrix4,
  MathUtils,
  NormalBlending,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import { buildAnchorField, FIELD_PRESETS } from "../objects/anchorFieldData";
import {
  anchorsFragment,
  anchorsVertex,
  handleEndsFragment,
  handlesFragment,
  handlesVertex,
  pathsFragment,
  pathsVertex,
} from "../shaders/anchorField";

export type AnchorFieldState = {
  /** Scroll progress through the hero, 0..1. */
  progress: number;
  /** Pointer in normalised device coordinates. */
  pointer: { x: number; y: number };
  pointerActive: boolean;
  /**
   * Where the hero copy sits, in CSS px relative to the stage (top-left origin). Measured by the
   * Hero; the nib is sized and placed to fill the free space around it.
   */
  copyBoxes?: CopyBox[];
};

export type CopyBox = { x0: number; x1: number; y0: number; y1: number };

/**
 * The formed nib's extent in its own units at the final pose (from the rendered mark), split
 * into its three bands so its narrow left end can tuck under the headline's shorter lines.
 * x grows right, y grows up.
 */
const NIB_PARTS = [
  { x0: -1.5, x1: -0.75, y0: -0.62, y1: 0.77 }, // ferrules
  { x0: -0.75, x1: 0.95, y0: -1.0, y1: 1.0 }, // body
  { x0: 0.95, x1: 1.6, y0: -1.52, y1: 1.62 }, // handle bar + arcs
] as const;
const NIB_RIGHT = 1.6;
const NIB_LEFT = 1.5;
const NIB_TOP = 1.62;
const NIB_BOTTOM = 1.52;
const HALF_H = 3.47; // visible half-height at z=0 (camera z 11, fov 35)

/**
 * Largest nib that fits the landscape stage without touching the copy, centred in the space left
 * over (world units). Returns null until the copy has been measured.
 */
function placeNib(width: number, height: number, boxes: CopyBox[] | undefined) {
  if (!boxes?.length) return null;
  const pxu = height / (HALF_H * 2);
  const halfW = width / 2 / pxu;
  const world = boxes.map((b) => ({
    x1: (b.x1 - width / 2) / pxu,
    top: (height / 2 - b.y0) / pxu,
    bottom: (height / 2 - b.y1) / pxu,
  }));
  const headerU = 72 / pxu; // fixed header (4.5rem); the top arcs may pass a little behind it
  const topLimit = HALF_H - headerU * 0.45;
  const gap = 0.22; // clearance from the copy
  for (let scale = 2.6; scale >= 0.6; scale -= 0.02) {
    // Sit low (clear of the headline), with a little room under it.
    const cy = -HALF_H + 0.2 + NIB_BOTTOM * scale;
    if (cy + NIB_TOP * scale > topLimit) continue;
    const hi = halfW - 0.15 - NIB_RIGHT * scale;
    let lo = -halfW + 0.2 + NIB_LEFT * scale;
    for (const b of world)
      for (const part of NIB_PARTS)
        if (cy + part.y0 * scale < b.top + 0.08 && cy + part.y1 * scale > b.bottom - 0.08)
          lo = Math.max(lo, b.x1 + gap - part.x0 * scale);
    if (lo <= hi) return { scale, x: (lo + hi) / 2, y: cy };
  }
  return null;
}

type Props = {
  state: React.RefObject<AnchorFieldState>;
  quality: "desktop" | "mobile";
  /** Render the final composition, without time-based motion. */
  still?: boolean;
};

// The shaders write colours straight to the screen (no output colour-space conversion), so the
// brand hexes are stored as-is rather than converted to linear — otherwise yellow renders orange.
const PAPER = new Color().setHex(0xf3f0e8, LinearSRGBColorSpace);
const SIGNAL = new Color().setHex(0xffbf01, LinearSRGBColorSpace);

/** Map hero progress to the three beats. Kept here so DOM + GL share one choreography. */
export const HERO_BEATS = {
  morph1: [0.08, 0.4],
  draw: [0.14, 0.48],
  morph2: [0.5, 0.86],
  /** Headline beat boundaries: create | strategize | elevate */
  headline: [0.28, 0.6],
} as const;

const remap = (v: number, [a, b]: readonly [number, number]) => MathUtils.clamp((v - a) / (b - a), 0, 1);

export function AnchorFieldScene({ state, quality, still = false }: Props) {
  const { gl, size } = useThree();
  const group = useRef<Group>(null);

  const buffers = useMemo(() => buildAnchorField(FIELD_PRESETS[quality]), [quality]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph1: { value: 0 },
      uMorph2: { value: 0 },
      uDraw: { value: 0 },
      uIntro: { value: still ? 1 : 0 },
      uPixelRatio: { value: 1 },
      uAspect: { value: 1 },
      uMouse: { value: new Vector2(10, 10) },
      uMouseActive: { value: 0 },
      uMouseRadius: { value: 0.3 },
      uFormRot: { value: new Matrix3() },
      uFormScale: { value: 1.3 },
      uFormOffset: { value: new Vector3() },
      uPaper: { value: PAPER },
      uSignal: { value: SIGNAL },
      uSize: { value: quality === "mobile" ? 4.6 : 7 },
      uHandleLength: { value: 0.42 },
    }),
    [quality, still],
  );

  const materials = useMemo(() => {
    const make = (vertexShader: string, fragmentShader: string) =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: NormalBlending,
      });
    return {
      paths: make(pathsVertex, pathsFragment),
      anchors: make(anchorsVertex, anchorsFragment),
      handles: make(handlesVertex, handlesFragment),
      handleEnds: make(handlesVertex, handleEndsFragment),
    };
  }, [uniforms]);

  // Dispose GPU resources when the scene unmounts or quality changes.
  useEffect(
    () => () => {
      Object.values(buffers).forEach((b) => "dispose" in b && b.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    },
    [buffers, materials],
  );

  const scratch = useMemo(
    () => ({ euler: new Euler(), m4: new Matrix4(), fitFor: null as unknown, fitKey: "", fit: null as ReturnType<typeof placeNib> }),
    [],
  );

  useFrame((_, rawDelta) => {
    const s = state.current;
    const u = uniforms;
    const delta = Math.min(rawDelta, 1 / 20);
    const portrait = size.width < size.height * 0.9;
    const p = still ? 1 : s.progress;

    u.uPixelRatio.value = gl.getPixelRatio();
    u.uAspect.value = size.width / size.height;
    if (!still) {
      u.uTime.value += delta;
      // Load-in: anchors resolve out of the dark shortly after the headline starts rising.
      if (u.uTime.value > 0.35) u.uIntro.value = MathUtils.damp(u.uIntro.value, 1, 1.6, delta);
    }

    // Damped so scroll input feels weighted rather than mechanical. A still frame renders only
    // on demand, so it jumps straight to the target instead of easing over many frames.
    const approach = (from: number, to: number) => (still ? to : MathUtils.damp(from, to, 5, delta));
    u.uMorph1.value = approach(u.uMorph1.value, remap(p, HERO_BEATS.morph1));
    u.uMorph2.value = approach(u.uMorph2.value, remap(p, HERO_BEATS.morph2));
    u.uDraw.value = approach(u.uDraw.value, remap(p, HERO_BEATS.draw));

    // Pointer: the pen-tool interaction.
    u.uMouse.value.set(s.pointer.x, s.pointer.y);
    u.uMouseActive.value = MathUtils.damp(u.uMouseActive.value, s.pointerActive && !still ? 1 : 0, 6, delta);

    const m2 = u.uMorph2.value;
    // Landscape: right third, clear of the headline. Scales with aspect so it never clips.
    const aspect = size.width / size.height;
    const halfW = 3.47 * aspect; // visible half-width at z=0 (camera z 11, fov 35)
    // Headline and copy sit top-left (landscape) / top (portrait), so the form lands low-right / low.
    // Copy top-left (landscape) / top (portrait), form in the free space right / below.
    // Landscape: large, filling the lower-right of the stage — its tall right side beside the
    // headline, its narrow left side (the ferrules) below the headline and right of the tagline.
    // Landscape with the copy measured: as large as the free space allows, centred in it.
    // Recomputed only when the stage size or the measured copy changes.
    const fitKey = `${size.width}x${size.height}`;
    if (scratch.fitFor !== s.copyBoxes || scratch.fitKey !== fitKey) {
      scratch.fitFor = s.copyBoxes;
      scratch.fitKey = fitKey;
      scratch.fit = placeNib(size.width, size.height, s.copyBoxes);
    }
    const fit = portrait ? null : scratch.fit;
    if (fit) {
      u.uFormOffset.value.set(fit.x, fit.y, 0);
      u.uFormScale.value = fit.scale;
    } else {
      u.uFormOffset.value.set(portrait ? 0 : halfW * 0.565, portrait ? -2.3 + m2 * 0.1 : -0.95 + m2 * 0.1, 0);
      u.uFormScale.value = portrait ? Math.min(0.62, halfW * 0.28) : Math.min(1.6, halfW * 0.267);
    }
    const px = s.pointerActive ? s.pointer.x : 0;
    const py = s.pointerActive ? s.pointer.y : 0;
    // Ends nearly face-on (the mark stays legible) with just enough yaw to reveal its depth layers.
    // A slow sway once formed lets the stacked contours parallax — depth without noise.
    const sway = still ? 0 : Math.sin(u.uTime.value * 0.35) * 0.16 * m2;
    scratch.euler.set(0.1 - py * 0.1, 0.38 - 0.62 * m2 + px * 0.18 + sway, 0);
    scratch.m4.makeRotationFromEuler(scratch.euler);
    u.uFormRot.value.setFromMatrix4(scratch.m4);

    // Whole-field parallax — slight, keeps the space feeling physical.
    if (group.current) {
      group.current.rotation.y = MathUtils.damp(group.current.rotation.y, px * 0.06, 3, delta);
      group.current.rotation.x = MathUtils.damp(group.current.rotation.x, -py * 0.04, 3, delta);
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={buffers.paths} material={materials.paths} frustumCulled={false} />
      <lineSegments geometry={buffers.handles} material={materials.handles} frustumCulled={false} />
      <points geometry={buffers.anchors} material={materials.anchors} frustumCulled={false} />
      <points geometry={buffers.handleEnds} material={materials.handleEnds} frustumCulled={false} />
    </group>
  );
}
