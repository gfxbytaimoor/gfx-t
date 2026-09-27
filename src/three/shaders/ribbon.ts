/**
 * GLSL for the "Signal Ribbon" (closing CTA): a band of fine lines that twists through 3D as it
 * travels — the flowing-ribbon idea popularised by Stripe, drawn in GFX-T's palette.
 *
 * Every line is a copy of the same centre curve, offset across the band's width by `aV`
 * (-1..1). The offset direction rotates along the curve (the twist), so the band folds and
 * turns over; additive blending makes it glow where lines bunch up at a fold.
 */
export const ribbonVertex = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;      // 0..1, grows as the section scrolls in
  uniform vec2  uPointer;  // NDC, eased; (0,0) when absent
  uniform float uWidth;    // world units, half-width of the band
  uniform float uSpan;     // world units, half-length of the curve
  attribute float aU;      // 0..1 along the curve
  attribute float aV;      // -1..1 across the band
  varying float vU;
  varying float vV;
  varying float vFacing;

  void main() {
    float x = (aU * 2.0 - 1.0) * uSpan;
    float t = uTime;

    // Centre curve: two slow travelling waves, nudged by the pointer.
    float y = sin(aU * 3.4 + t * 0.55) * 0.9 * uAmp
            + sin(aU * 7.1 - t * 0.32) * 0.28 * uAmp
            + uPointer.y * 0.6 * sin(aU * 3.14159);
    float z = cos(aU * 2.6 + t * 0.4) * 0.8;

    // Twist: the band's cross-direction turns along the curve and rolls over time.
    float twist = aU * 5.2 + t * 0.7 + uPointer.x * 0.8;
    vec2 dir = vec2(cos(twist), sin(twist));
    // Width swells and pinches like a folding ribbon.
    float w = uWidth * (0.55 + 0.45 * sin(aU * 3.14159)) * (0.8 + 0.2 * sin(t * 0.5 + aU * 2.0));
    vec3 p = vec3(x, y + dir.x * aV * w, z + dir.y * aV * w);

    vU = aU;
    vV = aV;
    // How face-on the band is here: bright where it faces the camera, dim edge-on.
    vFacing = abs(dir.x);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const ribbonFragment = /* glsl */ `
  uniform vec3 uSignal;
  uniform vec3 uAmber;
  uniform vec3 uPaper;
  varying float vU;
  varying float vV;
  varying float vFacing;

  void main() {
    // Colour runs along the band: amber → signal yellow → warm paper highlight at the faces.
    vec3 col = mix(uAmber, uSignal, smoothstep(0.0, 0.55, vU));
    col = mix(col, uPaper, smoothstep(0.55, 1.0, vFacing) * 0.55);
    // Fade out at both ends and toward the band's outer lines.
    float ends = smoothstep(0.0, 0.18, vU) * smoothstep(1.0, 0.8, vU);
    float edge = 1.0 - smoothstep(0.75, 1.0, abs(vV));
    float a = ends * mix(0.35, 1.0, edge) * mix(0.35, 0.9, vFacing);
    gl_FragColor = vec4(col * a, a);
  }
`;
