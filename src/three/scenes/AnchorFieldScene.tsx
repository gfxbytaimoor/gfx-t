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
};

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

  const scratch = useMemo(() => ({ euler: new Euler(), m4: new Matrix4() }), []);

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
    // Landscape: toward the centre, low enough that its body sits below the headline and right
    // of the tagline (the headline fills the upper-left half of the stage).
    u.uFormOffset.value.set(portrait ? 0 : halfW * 0.34, portrait ? -2.3 + m2 * 0.1 : -1.4 + m2 * 0.1, 0);
    u.uFormScale.value = portrait ? Math.min(0.62, halfW * 0.28) : Math.min(1.1, halfW * 0.19);
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
