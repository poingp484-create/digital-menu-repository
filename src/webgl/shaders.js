/* GLSL for the YAKUZA environment. Kept as strings so Vite needs no plugin. */

const NOISE = /* glsl */ `
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < OCTAVES; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
`;

export const fullscreenVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

/**
 * The living environment: industrial dusk skyline, drifting fog, cursor
 * ripples + light pool, highway light trails (scroll-speed driven) and
 * police strobes (heat). Rendered at reduced resolution.
 */
export const backgroundFrag = /* glsl */ `
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;      // 0..1 (y up)
uniform float uMouseE;    // cursor movement energy
uniform vec3 uBase;
uniform vec3 uFog;
uniform vec3 uAccent;
uniform float uHeat;
uniform float uSiren;
uniform float uSirenPhase;
uniform float uStreaks;
uniform float uSpeed;
uniform float uSky;
uniform float uBright;
uniform float uScroll;    // page scroll (parallax)
varying vec2 vUv;
${NOISE}

void main(){
  vec2 uv = vUv;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  vec2 m = (uMouse - 0.5) * vec2(asp, 1.0);
  float d = length(p - m);

  // cursor ripple — waves of distortion radiating from the pointer
  float rip = sin(d * 26.0 - uTime * 5.0) * exp(-d * 4.5) * uMouseE;
  vec2 q = p + normalize(p - m + 1e-4) * rip * 0.05;
  q += m * 0.04; // parallax toward cursor

  float t = uTime * 0.035;
  vec2 w = vec2(fbm(q * 1.3 + vec2(t, -t) + uScroll * 0.05), fbm(q * 1.3 + vec2(-t * 1.3, t) + 5.2));
  float fog = fbm(q * 1.7 + w * 1.8 + vec2(t * 2.0, -uScroll * 0.08));

  // sky → ground gradient
  vec3 col = mix(uBase * 0.55, uBase * 1.25, smoothstep(0.0, 1.0, uv.y));

  // sodium horizon glow
  float hy = 0.36 + m.y * 0.02;
  col += uAccent * exp(-pow((uv.y - hy) * 5.5, 2.0)) * 0.22 * uSky;

  // distant skyline: cranes, towers, warehouses (very subtle, parallax)
  float sx = (uv.x + m.x * 0.012 + uScroll * 0.002) * asp * 26.0;
  float cell = floor(sx);
  float bh = hy - 0.02 + 0.09 * hash(vec2(cell, 3.1)) + 0.09 * step(0.88, hash(vec2(floor(sx * 0.25), 7.0)));
  float bld = smoothstep(bh + 0.003, bh - 0.003, uv.y) * smoothstep(hy - 0.22, hy - 0.05, uv.y);
  vec2 wc = vec2(sx * 9.0, uv.y * 320.0);
  float win = step(0.93, hash(floor(wc))) * step(0.3, fract(wc.x)) * step(0.35, fract(wc.y)) * bld * step(uv.y, bh - 0.012);
  col = mix(col, col * 0.5, bld * 0.6 * uSky);
  col += uAccent * win * 0.16 * uSky * (0.6 + 0.4 * sin(uTime * 0.5 + cell));

  // fog
  col = mix(col, uFog, fog * fog * 0.95);
  col += uFog * pow(fog, 4.0) * 0.4;

  // cursor light pool
  col += uAccent * exp(-d * d * 6.0) * 0.16;
  col += vec3(1.0) * exp(-d * d * 60.0) * 0.035 * (0.4 + uMouseE);

  // light trails — tail lights + headlights; faster with scroll speed
  vec3 trails = vec3(0.0);
  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    float y = 0.08 + 0.34 * hash(vec2(fi, 1.3));
    float sp = 0.15 + 0.5 * hash(vec2(fi, 2.1));
    float dir = mod(fi, 2.0) < 0.5 ? 1.0 : -1.0;
    float x = fract(uv.x * 0.6 * dir - uTime * sp * (0.25 + uSpeed * 2.6) + hash(vec2(fi, 4.0)));
    float len = 0.06 + uSpeed * 0.5;
    float seg = smoothstep(1.0 - len, 1.0, x) * step(x, 0.999);
    float thick = exp(-abs(uv.y - y) * uRes.y * (0.35 - uSpeed * 0.12));
    vec3 c = dir > 0.0 ? vec3(1.0, 0.16, 0.12) : vec3(0.85, 0.9, 1.0);
    trails += c * seg * thick;
  }
  col += trails * uStreaks * (0.22 + uSpeed * 0.9);

  // speed lines across the whole frame at high velocity
  float sl = step(0.985, hash(vec2(floor(uv.y * 220.0), floor(uTime * 20.0)))) * uSpeed;
  col += vec3(0.9) * sl * 0.08 * uStreaks;

  col *= 1.0 + uBright;

  // vignette
  float vig = smoothstep(1.25, 0.2, length(p * vec2(0.85, 1.1)));
  col *= mix(0.35, 1.0, vig);

  // police sirens — always on: red / blue alternation from the top corners, spilling
  // into the fog (phase integrated on the CPU so the tempo can change without jumps).
  // Heat (pursuit) adds a fast double-flash on top.
  float sp = fract(uSirenPhase);
  float redS = smoothstep(0.0, 0.14, sp) * (1.0 - smoothstep(0.34, 0.5, sp));
  float blueS = smoothstep(0.5, 0.64, sp) * (1.0 - smoothstep(0.84, 1.0, sp));
  float ph = fract(uTime * 1.6);
  float flashA = step(ph, 0.08) + step(0.16, ph) * step(ph, 0.24);
  float flashB = step(0.5, ph) * step(ph, 0.58) + step(0.66, ph) * step(ph, 0.74);
  vec2 lpR = vec2(-asp * 0.5 - 0.05, 0.62);
  vec2 lpB = vec2(asp * 0.5 + 0.05, 0.62);
  float gR = exp(-length((p - lpR) * vec2(0.75, 1.0)) * 2.6);
  float gB = exp(-length((p - lpB) * vec2(0.75, 1.0)) * 2.6);
  vec3 RED = vec3(1.0, 0.05, 0.07);
  vec3 BLUE = vec3(0.1, 0.28, 1.0);
  float redI = redS * uSiren + flashA * uHeat * 0.9;
  float blueI = blueS * uSiren + flashB * uHeat * 0.9;
  col += RED * redI * (gR * 1.1 + gR * fog * 0.6);
  col += BLUE * blueI * (gB * 1.1 + gB * fog * 0.6);
  // faint wash across the top edge so it reads behind content too
  float top = smoothstep(0.55, 1.0, uv.y);
  col += (RED * redS + BLUE * blueS) * uSiren * top * 0.025;


  gl_FragColor = vec4(col, 1.0);
}
`;

/** Upscale the low-res background + film grain + scanlines. */
export const compositeFrag = /* glsl */ `
uniform sampler2D tBg;
uniform float uTime;
uniform vec2 uRes;
uniform float uGrain;
varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec3 col = texture2D(tBg, vUv).rgb;
  float g = h(vUv * uRes + fract(uTime * 7.0) * 100.0) - 0.5;
  col += g * uGrain;
  col *= 1.0 - (0.5 + 0.5 * sin(vUv.y * uRes.y * 1.1)) * 0.035;
  // subtle grade: lift blacks toward olive, cool highlights
  col = col * vec3(1.02, 1.0, 0.96) + vec3(0.006, 0.007, 0.004);
  gl_FragColor = vec4(col, 1.0);
}
`;

export const logoVert = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;
varying vec2 vScreen;
void main(){
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
  vScreen = gl_Position.xy / gl_Position.w;
}
`;

/**
 * Liquid chrome lettering. Height comes from a blurred alpha atlas; normals
 * are derived per pixel and reflected into a procedural studio environment
 * that rotates with the cursor. The cursor is also a moving point light.
 */
export const logoFrag = /* glsl */ `
uniform sampler2D uMap;
uniform vec4 uRect;      // u0, vTop, u1, vBottom
uniform vec2 uTexel;
uniform float uTime;
uniform float uOpacity;
uniform float uGlitch;
uniform float uSeed;
uniform vec2 uMouse;     // -1..1
uniform float uRowY;
uniform float uCap;
uniform float uFlash;
uniform vec3 uTint;     // body colour of the metal (1,1,1 = chrome)
uniform vec3 uSpec;     // specular colour
uniform float uGloss;   // clear-coat: keeps sky reflections bright on tinted paint
uniform float uIri;     // pearl / iridescence amount
varying vec2 vUv;
varying vec3 vWorld;
varying vec2 vScreen;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 auv(vec2 uv){ return vec2(mix(uRect.x, uRect.z, uv.x), mix(uRect.w, uRect.y, uv.y)); }

void main(){
  vec2 uv = vUv;
  float tick = floor(uTime * 14.0);
  float slice = floor(uv.y * 16.0);
  float gs = step(1.0 - uGlitch * 0.45, hash(vec2(slice + uSeed, tick)));
  uv.x += (hash(vec2(slice, tick + 3.0)) - 0.5) * 0.3 * gs * uGlitch;
  // liquid wobble
  uv += vec2(sin(uv.y * 8.0 + uTime * 1.2 + uSeed), cos(uv.x * 6.0 - uTime * 0.9 + uSeed)) * 0.005;

  vec2 a = auv(uv);
  vec4 tx = texture2D(uMap, a);
  float alpha = tx.r;

  vec2 e = uTexel * 2.0;
  float hx = texture2D(uMap, a + vec2(e.x, 0.0)).g - texture2D(uMap, a - vec2(e.x, 0.0)).g;
  float hy = texture2D(uMap, a - vec2(0.0, e.y)).g - texture2D(uMap, a + vec2(0.0, e.y)).g;
  vec2 E = uTexel * 7.0;
  float bx = texture2D(uMap, a + vec2(E.x, 0.0)).b - texture2D(uMap, a - vec2(E.x, 0.0)).b;
  float by = texture2D(uMap, a - vec2(0.0, E.y)).b - texture2D(uMap, a + vec2(0.0, E.y)).b;

  vec3 n = normalize(vec3(-(hx * 3.2 + bx * 1.6), -(hy * 3.2 + by * 1.6), 1.0));
  // slow liquid perturbation
  n.xy += 0.09 * vec2(sin(vWorld.y * 2.6 + uTime * 0.8 + vWorld.x * 1.1), cos(vWorld.x * 2.0 - uTime * 0.6));
  n = normalize(n);

  vec3 R = reflect(vec3(0.0, 0.0, -1.0), n);
  float ly = (vWorld.y - uRowY) / uCap;
  float ry = R.y + ly * 1.35 - uMouse.y * 0.28 + 0.06 * sin(vWorld.x * 0.9 + uTime * 0.7);
  float rx = R.x + uMouse.x * 0.4;

  vec3 sky = mix(vec3(0.62, 0.66, 0.74), vec3(1.0), smoothstep(0.05, 0.75, ry));
  vec3 ground = mix(vec3(0.03, 0.03, 0.035), vec3(0.42, 0.36, 0.27), smoothstep(-1.0, -0.15, ry));
  vec3 env = mix(ground, sky, smoothstep(-0.03, 0.03, ry));
  env *= 1.0 - 0.8 * exp(-pow((ry - 0.02) * 12.0, 2.0));                   // dark horizon band
  env += vec3(1.0, 0.64, 0.3) * exp(-pow((ry + 0.1) * 11.0, 2.0)) * 0.55;  // sodium kiss
  env += vec3(0.7, 0.8, 1.0) * smoothstep(0.93, 1.0, sin(rx * 5.0 + uTime * 0.25)) * 0.5; // studio strip lights

  // cursor = moving point light
  vec3 L = normalize(vec3((uMouse - vScreen) * vec2(1.6, 1.0), 0.55));
  float spec = pow(max(dot(R, L), 0.0), 36.0) * 1.6;
  float fres = pow(1.0 - n.z, 2.5);

  vec3 body = env * uTint;
  // pearl: hue drifts with the surface normal
  vec3 iri = 0.55 + 0.45 * cos(6.2832 * (n.x * 0.7 + n.y * 0.5 + ry * 0.3 + vec3(0.0, 0.33, 0.67)));
  body = mix(body, env * iri, uIri);
  // clear-coat over coloured paint: bright sky streaks stay near-white
  vec3 coat = max(env - 0.62, 0.0) / 0.38;
  body += coat * coat * 0.75 * uGloss;
  vec3 col = body + spec * uSpec + fres * 0.3 * mix(vec3(1.0), uTint, 0.6) + uFlash;
  col *= mix(0.35, 1.0, smoothstep(0.0, 0.25, tx.g)); // darken the extreme edge

  // RGB split on glitch
  float ar = texture2D(uMap, auv(uv + vec2(0.02 * uGlitch, 0.0))).r;
  float ab = texture2D(uMap, auv(uv - vec2(0.02 * uGlitch, 0.0))).r;
  vec3 rgb = col * alpha;
  rgb.r += max(ar - alpha, 0.0) * 0.9;
  rgb.b += max(ab - alpha, 0.0) * 1.0;
  float outA = max(alpha, max(ar, ab) * step(0.01, uGlitch));
  if (outA < 0.004) discard;
  gl_FragColor = vec4(rgb, outA) * uOpacity;
}
`;

/** Textured plane (hero reveal piece) with chromatic aberration. */
export const pieceFrag = /* glsl */ `
uniform sampler2D uMap;
uniform float uOpacity;
uniform float uAberr;
uniform float uBright;
uniform float uTime;
varying vec2 vUv;
varying vec3 vWorld;
varying vec2 vScreen;
void main(){
  vec2 uv = vUv;
  vec2 off = (uv - 0.5) * uAberr;
  // texture is premultiplied (clean filtering at transparent edges)
  vec4 c = texture2D(uMap, uv);
  vec4 cr = texture2D(uMap, uv + off);
  vec4 cb = texture2D(uMap, uv - off);
  vec3 col = vec3(cr.r, c.g, cb.b) * uBright;
  gl_FragColor = vec4(col, c.a) * uOpacity;
}
`;

/**
 * Image logo (chrome blade lettering). One mesh per letter strip; each mesh
 * keeps only the pixels inside its slanted band so the strips tile exactly at
 * rest. Effects use image-space coordinates so nothing seams between strips:
 * cursor glint, slow light sweep, sparkle twinkle, liquid shimmer, glitch.
 */
export const logoImageFrag = /* glsl */ `
uniform sampler2D uMap;
uniform vec4 uRect;      // u0, vTop, u1, vBottom (texture space, v up)
uniform vec2 uSize;      // image size in px
uniform vec3 uBand;      // cutLeft, cutRight, slope (px)
uniform float uTime;
uniform float uOpacity;
uniform float uGlitch;
uniform float uSeed;
uniform vec2 uMouse;     // -1..1
uniform float uFlash;
uniform vec3 uTint;
uniform float uTintAmt;
varying vec2 vUv;
varying vec2 vScreen;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

void main(){
  vec2 a0 = vec2(mix(uRect.x, uRect.z, vUv.x), mix(uRect.w, uRect.y, vUv.y));
  vec2 p = vec2(a0.x * uSize.x, (1.0 - a0.y) * uSize.y);   // image px, y down
  float xp = p.x + (p.y - uSize.y * 0.5) * uBand.z;
  float inBand = step(uBand.x, xp) * (1.0 - step(uBand.y, xp));
  if (inBand < 0.5) discard;

  // glitch: horizontal slice tears + liquid shimmer (image space → seamless)
  float tick = floor(uTime * 14.0);
  float slice = floor(p.y / uSize.y * 18.0);
  float gs = step(1.0 - uGlitch * 0.45, hash(vec2(slice + uSeed, tick)));
  vec2 a = a0;
  a.x += (hash(vec2(slice, tick + 3.0)) - 0.5) * 0.05 * gs * uGlitch;
  a += vec2(sin(p.y * 0.02 + uTime * 1.1), cos(p.x * 0.012 - uTime * 0.8)) * 0.0009;

  vec4 tx = texture2D(uMap, a);
  float alpha = tx.a;
  vec3 col = tx.rgb / max(alpha, 1e-4);   // texture is premultiplied
  float lum = dot(col, vec3(0.333));

  // tint (finishes) — keep highlights white-hot
  vec3 tinted = lum * uTint * 1.55 + pow(lum, 6.0) * 0.9;
  col = mix(col, tinted, uTintAmt);

  // light sweep across the metal every ~11s
  float gx = p.x / uSize.x + (p.y / uSize.y) * 0.22;
  float sw = fract(uTime * 0.09) * 1.8 - 0.4;
  col += vec3(1.0, 0.98, 0.95) * exp(-pow((gx - sw) * 13.0, 2.0)) * pow(lum, 1.4) * 0.8;

  // cursor = moving light: brightens the chrome near it
  float d = length((vScreen - uMouse) * vec2(1.6, 1.0));
  col += vec3(1.0, 0.97, 0.92) * pow(lum, 2.2) * exp(-d * 2.6) * 0.9;

  // sparkle twinkle on the brightest points
  float tw = 0.5 + 0.5 * sin(uTime * 3.0 + hash(floor(p / 40.0)) * 6.28);
  col += vec3(1.0) * smoothstep(0.86, 1.0, lum) * tw * 0.35;

  col += uFlash;

  // RGB split on glitch
  float ar = texture2D(uMap, a + vec2(0.006 * uGlitch, 0.0)).a;
  float ab = texture2D(uMap, a - vec2(0.006 * uGlitch, 0.0)).a;
  vec3 rgb = col * alpha;
  rgb.r += max(ar - alpha, 0.0) * 0.9;
  rgb.b += max(ab - alpha, 0.0) * 1.0;
  float outA = max(alpha, max(ar, ab) * step(0.01, uGlitch));
  if (outA < 0.003) discard;
  gl_FragColor = vec4(rgb, outA) * uOpacity;
}
`;
