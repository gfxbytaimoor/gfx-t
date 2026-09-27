"use client";
/* eslint-disable react-hooks/immutability -- R3F idiom: uniforms are GPU state mutated in useFrame. */

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, LinearSRGBColorSpace, MathUtils, ShaderMaterial } from "three";
import { ribbonFragment, ribbonVertex } from "../shaders/ribbon";

export type RibbonState = {
  /** 0..1 — how far the section has scrolled in; drives the wave amplitude. */
  progress: number;
  /** Pointer in NDC relative to the canvas, or null when absent. */
  pointer: { x: number; y: number } | null;
};

type Props = { state: React.RefObject<RibbonState>; quality: "desktop" | "mobile"; still?: boolean };

const PRESETS = { desktop: { lines: 110, samples: 220 }, mobile: { lines: 56, samples: 140 } };

/** One geometry of independent segments: `lines` copies of the curve, `samples` points each. */
function buildRibbon(lines: number, samples: number) {
  const verts = lines * (samples - 1) * 2;
  const u = new Float32Array(verts);
  const v = new Float32Array(verts);
  let k = 0;
  for (let l = 0; l < lines; l++) {
    const across = (l / (lines - 1)) * 2 - 1;
    for (let s = 0; s < samples - 1; s++) {
      for (const j of [s, s + 1]) {
        u[k] = j / (samples - 1);
        v[k] = across;
        k++;
      }
    }
  }
  const g = new BufferGeometry();
  // Positions are computed in the vertex shader; three still needs a position attribute.
  g.setAttribute("position", new BufferAttribute(new Float32Array(verts * 3), 3));
  g.setAttribute("aU", new BufferAttribute(u, 1));
  g.setAttribute("aV", new BufferAttribute(v, 1));
  return g;
}

export function RibbonScene({ state, quality, still = false }: Props) {
  const { size, camera } = useThree();
  const geometry = useMemo(() => buildRibbon(PRESETS[quality].lines, PRESETS[quality].samples), [quality]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: still ? 6 : 0 },
      uAmp: { value: still ? 1 : 0.4 },
      uPointer: { value: { x: 0, y: 0 } },
      uWidth: { value: 1.25 },
      uSpan: { value: 8 },
      // Stored as-is: the shader writes straight to the screen, so no linear conversion.
      uSignal: { value: new Color().setHex(0xffbf01, LinearSRGBColorSpace) },
      uAmber: { value: new Color().setHex(0xb87400, LinearSRGBColorSpace) },
      uPaper: { value: new Color().setHex(0xfff4d6, LinearSRGBColorSpace) },
    }),
    [still],
  );

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: ribbonVertex,
        fragmentShader: ribbonFragment,
        uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: AdditiveBlending,
      }),
    [uniforms],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  // Frame the band to the canvas: it should span the full width on any aspect.
  useEffect(() => {
    const aspect = size.width / size.height;
    uniforms.uSpan.value = Math.max(6, 3.2 * aspect + 2.2);
    uniforms.uWidth.value = aspect < 1 ? 1.1 : 1.75;
    camera.position.set(0, 0, 9);
    // Aimed low so the band sits high in its box, leaving no blank strip above it.
    camera.lookAt(0, -1.1, 0);
  }, [size, camera, uniforms]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 1 / 20);
    const u = uniforms;
    const s = state.current;
    if (!still) u.uTime.value += dt;
    u.uAmp.value = still ? 1 : MathUtils.damp(u.uAmp.value, 0.4 + 0.6 * s.progress, 2.5, dt);
    const tx = s.pointer && !still ? s.pointer.x : 0;
    const ty = s.pointer && !still ? s.pointer.y : 0;
    u.uPointer.value.x = MathUtils.damp(u.uPointer.value.x, tx, 2, dt);
    u.uPointer.value.y = MathUtils.damp(u.uPointer.value.y, ty, 2, dt);
  });

  return <lineSegments geometry={geometry} material={material} frustumCulled={false} />;
}
