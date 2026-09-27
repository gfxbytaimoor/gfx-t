/**
 * GLSL for the hero Anchor Field. All motion happens on the GPU; the CPU only updates
 * a handful of uniforms per frame.
 *
 * Shared uniforms
 *   uMorph1  A → B (create → strategize)      uMorph2  B → C (strategize → elevate)
 *   uDraw    path draw-on progress            uIntro   load-in fade/scale
 *   uMouse   pointer in NDC                   uMouseActive 0..1 (fades when pointer leaves)
 *   uFormRot/uFormScale/uFormOffset — placement of the nib form (state C only)
 */

const shared = /* glsl */ `
  uniform float uTime;
  uniform float uMorph1;
  uniform float uMorph2;
  uniform float uIntro;
  uniform float uPixelRatio;
  uniform float uAspect;
  uniform vec2  uMouse;
  uniform float uMouseActive;
  uniform float uMouseRadius;
  uniform mat3  uFormRot;
  uniform float uFormScale;
  uniform vec3  uFormOffset;
  uniform vec3  uPaper;
  uniform vec3  uSignal;

  float stagger(float progress, float r) {
    float s = r * 0.35;
    return smoothstep(s, s + 0.65, progress);
  }

  vec3 placeForm(vec3 c) {
    return uFormRot * (c * uFormScale) + uFormOffset;
  }
`;

const anchorAttributes = /* glsl */ `
  attribute vec3 aPosA;
  attribute vec3 aPosB;
  attribute vec3 aPosC;
  attribute vec3 aTanA;
  attribute vec3 aTanB;
  attribute vec3 aTanC;
  attribute float aRand;
  attribute float aShape;
  attribute float aSelB;
  attribute float aSelC;
  attribute float aLayer;
  attribute float aFree;
  attribute float aSide;

  vec3 anchorPosition(out vec3 tangent, out float mAB, out float mBC) {
    mAB = stagger(uMorph1, aRand);
    mBC = stagger(uMorph2, aRand);
    vec3 drift = vec3(
      sin(uTime * 0.23 + aRand * 40.0),
      cos(uTime * 0.19 + aRand * 23.0),
      sin(uTime * 0.17 + aRand * 11.0)
    );
    vec3 a = aPosA + drift * 0.22;
    vec3 b = aPosB + drift * 0.03;
    vec3 c = mix(placeForm(aPosC), aPosC, aFree) + drift * mix(0.0, 0.2, aFree);
    tangent = normalize(mix(mix(aTanA, aTanB, mAB), uFormRot * aTanC, mBC) + 1e-5);
    return mix(mix(a, b, mAB), c, mBC);
  }

  float pointerInfluence(vec4 clip) {
    vec2 d = clip.xy / clip.w - uMouse;
    d.x *= uAspect;
    return (1.0 - smoothstep(0.0, uMouseRadius, length(d))) * uMouseActive;
  }

  float anchorAlpha(float mAB, float mBC) {
    // In the final form only the front layer keeps (every other) anchor; the layers behind
    // it are carried by their contours alone, so the mark reads as clean stacked lines.
    float front = step(0.99, aLayer) * step(fract(aRand * 13.7), 0.5);
    float structured = mix(0.7, front * 0.95, mBC);
    float base = mix(0.78, structured, mAB);
    // Atmospheric anchors dissolve as the form assembles.
    float free = 0.3 * (1.0 - smoothstep(0.0, 0.7, uMorph2));
    return mix(base, free, aFree);
  }
`;

// ----------------------------------------------------------------------------- anchors

export const anchorsVertex = /* glsl */ `
  uniform float uSize;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vShape;
  ${shared}
  ${anchorAttributes}

  void main() {
    vec3 tangent; float mAB; float mBC;
    vec3 p = anchorPosition(tangent, mAB, mBC);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    float influence = pointerInfluence(clip);
    gl_Position = clip;

    float depthScale = 11.0 / clamp(-mv.z, 2.0, 40.0);
    // Anchors shrink as the form assembles so the contours, not the dots, carry the mark.
    float size = uSize * mix(0.8, 1.2, aShape) * mix(1.0, 0.6, aFree) * mix(1.0, 0.72, mBC) * (1.0 + influence * 0.8);
    gl_PointSize = size * depthScale * uPixelRatio * uIntro;

    float selected = mix(aSelB * mAB, aSelC, mBC);
    vColor = mix(uPaper, uSignal, max(selected, influence));
    vAlpha = anchorAlpha(mAB, mBC) * uIntro;
    vAlpha = max(vAlpha, influence * uIntro);
    vShape = aShape;
  }
`;

export const anchorsFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vShape;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    // Squares are anchors, circles are handle knobs — the two marks in the logo.
    float circle = 1.0 - smoothstep(0.38, 0.5, length(c));
    float square = 1.0 - smoothstep(0.44, 0.5, max(abs(c.x), abs(c.y)));
    float a = mix(circle, square, vShape) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

// ----------------------------------------------------------------------------- handles

/** Bézier handles sprout from anchors near the pointer — the cursor acts as the pen tool. */
export const handlesVertex = /* glsl */ `
  uniform float uHandleLength;
  uniform float uSize;
  varying float vAlpha;
  varying vec3 vColor;
  ${shared}
  ${anchorAttributes}

  void main() {
    vec3 tangent; float mAB; float mBC;
    vec3 p = anchorPosition(tangent, mAB, mBC);
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    float pointer = pointerInfluence(clip) * (1.0 - aFree);
    // A few anchors always show their handles, so the field reads as vector points, not stars.
    float idle = step(0.9, aRand) * (1.0 - aFree) * (1.0 - mBC) * 0.5;
    float influence = max(pointer, idle);
    float len = uHandleLength * influence * (0.6 + fract(aRand * 7.31) * 0.6);
    vec4 mv = modelViewMatrix * vec4(p + tangent * aSide * len, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * 0.75 * uPixelRatio * influence * uIntro;
    vAlpha = smoothstep(0.05, 0.5, influence) * mix(0.45, 0.95, step(idle, pointer)) * uIntro;
    vColor = mix(uPaper, uSignal, step(idle + 0.001, pointer));
  }
`;

export const handlesFragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    if (vAlpha < 0.01) discard;
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

export const handleEndsFragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float a = (1.0 - smoothstep(0.3, 0.5, length(gl_PointCoord - 0.5))) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

// ----------------------------------------------------------------------------- paths

export const pathsVertex = /* glsl */ `
  uniform float uDraw;
  attribute vec3 aPosB;
  attribute vec3 aPosC;
  attribute float aT;
  attribute float aSelB;
  attribute float aSelC;
  attribute float aLayer;
  attribute float aRand;
  varying float vT;
  varying float vDraw;
  varying float vAlpha;
  varying vec3 vColor;
  ${shared}

  void main() {
    float mBC = stagger(uMorph2, aRand);
    vec3 b = aPosB;
    b.y += sin(aT * 9.42 + uTime * 0.35 + aRand * 6.0) * 0.035;
    vec3 p = mix(b, placeForm(aPosC), mBC);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);

    vT = aT;
    vDraw = clamp((uDraw - aRand * 0.35) / 0.65, 0.0, 1.0);

    float selected = mix(aSelB, aSelC, mBC);
    // Depth cue: contours fade toward the back of the stack.
    float structured = mix(0.16, mix(0.08, 0.9, aLayer * aLayer * aLayer), mBC);
    vAlpha = mix(structured, 1.0, selected) * uIntro;
    vColor = mix(uPaper, uSignal, selected);
  }
`;

export const pathsFragment = /* glsl */ `
  varying float vT;
  varying float vDraw;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    if (vT > vDraw || vAlpha < 0.01) discard;
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;
