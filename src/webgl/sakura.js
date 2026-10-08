/**
 * One sakura tree on the left of the intro. The trunk rises from the bottom
 * edge, its limbs reach toward the right over the name, and petals blow off
 * the canopy, drifting right on the wind and tumbling as they fall. They
 * scatter away from the cursor.
 */
import * as THREE from 'three';

function mulberry(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Texture-space layout of the tree (0..1). Used to place the petal emitter. */
const CANOPY = { x: 0.52, y: 0.66, w: 0.85, h: 0.38 }; // centre + extent, uv (y up)
const ROOT_U = 0.07;

/** Catmull-Rom through points → dense polyline. */
function spline(pts, steps = 24) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/**
 * Illustrated sakura tree: smooth tapered dark limbs that wave from the trunk
 * on the left out to the right, twigs along them, and flat rose blossoms + buds
 * in clusters all the way along (after the reference illustration).
 */
function treeCanvas(width) {
  const W = width;
  const H = Math.round(width / 2);
  const s = W / 2048;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  const rnd = mulberry(41);
  const BARK = '#4f2026';
  const BARK_LIT = 'rgba(176, 104, 110, 0.7)';
  const sites = []; // where blossoms go: [x, y, weight]

  /** Filled, tapered stroke along a polyline (no cap artefacts). */
  function taper(line, w0, w1, lit = true) {
    const L = [];
    const R = [];
    line.forEach((p, i) => {
      const a = line[Math.max(0, i - 1)];
      const b = line[Math.min(line.length - 1, i + 1)];
      let nx = -(b[1] - a[1]);
      let ny = b[0] - a[0];
      const len = Math.hypot(nx, ny) || 1;
      nx /= len;
      ny /= len;
      const w = (w0 + (w1 - w0) * (i / (line.length - 1))) / 2;
      L.push([p[0] + nx * w, p[1] + ny * w]);
      R.push([p[0] - nx * w, p[1] - ny * w]);
    });
    ctx.fillStyle = BARK;
    ctx.beginPath();
    L.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
    ctx.closePath();
    ctx.fill();
    if (!lit) return;
    // soft highlight along the upper edge (skipped near the trunk joint)
    L.splice(0, Math.floor(L.length * 0.12));
    ctx.strokeStyle = BARK_LIT;
    ctx.lineWidth = Math.max(1, w0 * 0.12);
    ctx.beginPath();
    L.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }

  /** A limb: waving spline from start to end, with twigs sprouting along it. */
  function limb(start, end, w0, w1, wave, twigs) {
    const n = 6;
    const pts = [start];
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const x = start[0] + (end[0] - start[0]) * t;
      const y = start[1] + (end[1] - start[1]) * t + Math.sin(t * Math.PI * 2.2 + rnd() * 0.6) * wave * s;
      pts.push([x, y]);
    }
    pts.push(end);
    const line = spline(pts, 20);
    taper(line, w0, w1);
    // rounded joint so the limb grows out of the trunk instead of butting into it
    ctx.fillStyle = BARK;
    ctx.beginPath();
    ctx.arc(start[0], start[1], w0 * 0.52, 0, Math.PI * 2);
    ctx.fill();
    // blossoms ride along the limb, denser toward its outer half
    for (let i = Math.floor(line.length * 0.22); i < line.length; i += Math.round(10 + rnd() * 12)) sites.push([line[i][0], line[i][1], 0.55 + (i / line.length) * 0.5]);
    sites.push([end[0], end[1], 1]);
    // twigs
    for (let k = 0; k < twigs; k++) {
      const i = Math.floor(line.length * (0.3 + 0.68 * (k / twigs) + rnd() * 0.04));
      const [x, y] = line[Math.min(i, line.length - 1)];
      const up = rnd() > 0.45 ? -1 : 1;
      const len = (60 + rnd() * 120) * s;
      const ang = up * (0.5 + rnd() * 0.7) - 0.15;
      const ex = x + Math.cos(ang) * len;
      const ey = y + Math.sin(ang) * len;
      const tw = spline([[x, y], [(x + ex) / 2 + (rnd() - 0.5) * 18 * s, (y + ey) / 2 + (rnd() - 0.5) * 18 * s], [ex, ey]], 10);
      const ww = Math.max(6 * s, w0 * 0.3 * (1 - i / line.length));
      taper(tw, ww, ww * 0.35);
      sites.push([ex, ey, 0.85]);
    }
  }

  // trunk: rises from the bottom-left, then the limbs fan out to the right
  // limbs first (their roots sit inside the trunk), trunk drawn over the joints
  limb([0.1 * W, 0.5 * H], [0.97 * W, 0.2 * H], 50 * s, 8 * s, 46, 10); // long upper limb, all the way across
  limb([0.088 * W, 0.6 * H], [0.7 * W, 0.47 * H], 38 * s, 6 * s, 34, 7); // middle limb
  limb([0.1 * W, 0.52 * H], [0.42 * W, 0.08 * H], 32 * s, 6 * s, 26, 5); // rising limb
  limb([0.08 * W, 0.68 * H], [0.22 * W, 0.7 * H], 24 * s, 7 * s, 14, 1); // low short limb
  const trunk = spline([[0.075 * W, H + 30 * s], [0.085 * W, 0.82 * H], [0.07 * W, 0.67 * H], [0.1 * W, 0.5 * H]], 24);
  taper(trunk, 86 * s, 50 * s, false);
  ctx.fillStyle = BARK;
  ctx.beginPath();
  ctx.arc(0.1 * W, 0.5 * H, 26 * s, 0, Math.PI * 2);
  ctx.fill();

  // flat illustrated blossoms (reference: rose pink, darker centre, notched petals)
  const PETAL = ['#f6a0b4', '#ec6d8c', '#e2547a'];
  const blossom = (x, y, r, rot) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    for (let p = 0; p < 5; p++) {
      ctx.save();
      ctx.rotate((p / 5) * Math.PI * 2);
      const g = ctx.createLinearGradient(0, -r, 0, 0);
      g.addColorStop(0, PETAL[0]);
      g.addColorStop(0.55, PETAL[1]);
      g.addColorStop(1, PETAL[2]);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-r * 0.75, -r * 0.2, -r * 0.7, -r * 1.02, -r * 0.16, -r);
      ctx.lineTo(0, -r * 0.88);
      ctx.lineTo(r * 0.16, -r);
      ctx.bezierCurveTo(r * 0.7, -r * 1.02, r * 0.75, -r * 0.2, 0, 0);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#b8294f';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd1dc';
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.22, Math.sin(a) * r * 0.22, r * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };
  const bud = (x, y, r, rot) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = '#d6466c';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.6, r * 0.55, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = BARK;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.35, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  sites.forEach(([x, y, k]) => {
    const n = 2 + Math.round(rnd() * 3 * k);
    for (let i = 0; i < n; i++) {
      const ox = x + (rnd() - 0.5) * 84 * s;
      const oy = y + (rnd() - 0.5) * 62 * s;
      if (ox > W * 0.955 || oy < H * 0.07) continue;
      if (rnd() < 0.2) bud(ox, oy, (11 + rnd() * 7) * s, (rnd() - 0.5) * 1.6);
      else blossom(ox, oy, (19 + rnd() * 13) * s * (0.8 + k * 0.25), rnd() * 6.28);
    }
  });
  return c;
}

const treeVert = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
void main(){
  vUv = uv;
  vec3 p = position;
  // the further along the limbs (right) and higher up, the more it moves in the wind
  float h = smoothstep(0.1, 1.0, uv.x) * smoothstep(0.1, 0.6, uv.y);
  float w = h * h;
  p.x += (sin(uTime * 0.55 + uv.y * 2.0) * 0.07 + sin(uTime * 1.3 + uv.x * 5.0) * 0.02) * w;
  p.y += cos(uTime * 0.8 + uv.x * 3.0) * 0.025 * w;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const treeFrag = /* glsl */ `
uniform sampler2D uMap;
uniform float uReveal;
uniform float uOpacity;
varying vec2 vUv;
void main(){
  vec4 c = texture2D(uMap, vUv);
  // grows from the root upward and outward
  float d = length((vUv - vec2(${ROOT_U.toFixed(2)}, 0.0)) * vec2(2.0, 1.0)) / 2.1;
  float grow = smoothstep(d - 0.05, d + 0.02, uReveal * 1.12);
  float edge = smoothstep(1.0, 0.97, vUv.x) * smoothstep(1.0, 0.97, vUv.y);
  float a = c.a * grow * edge * uOpacity;
  if (a < 0.003) discard;
  gl_FragColor = vec4(c.rgb, a);
}`;

const petalVert = /* glsl */ `
attribute vec4 aSeed;
uniform float uTime;
uniform float uSize;
uniform float uPR;
uniform vec2 uOrigin;    // canopy centre (world)
uniform vec2 uSpread;    // canopy extent (world)
uniform vec2 uTravel;    // how far a petal blows over its life (world)
uniform vec2 uMouse;
uniform float uZ0;
uniform float uZ1;
varying float vRot;
varying float vFlip;
varying float vA;
varying float vTint;
void main(){
  float speed = 0.05 + aSeed.w * 0.06;
  float life = fract(aSeed.y + uTime * speed);
  // leaves the canopy, rides the wind to the right, falls, flutters
  vec2 o = uOrigin + (aSeed.xz - 0.5) * uSpread;
  float gust = 0.55 + 0.45 * sin(uTime * 0.35 + aSeed.x * 6.28);
  float x = o.x + life * uTravel.x * gust + sin(uTime * (0.7 + aSeed.z) + aSeed.w * 6.28) * 0.25;
  float y = o.y - life * life * uTravel.y + sin(life * 9.0 + aSeed.x * 6.28) * 0.18;
  float z = mix(uZ0, uZ1, aSeed.z);
  vec2 d = vec2(x, y) - uMouse;
  float dl = length(d);
  vec2 push = normalize(d + 1e-4) * 0.9 * exp(-dl * dl * 1.4);
  vec4 mv = modelViewMatrix * vec4(x + push.x, y + push.y, z, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.55 + aSeed.w * 0.8) * uPR * (10.0 / -mv.z);
  vRot = uTime * (0.7 + aSeed.w * 1.6) + aSeed.x * 6.28;
  vFlip = cos(uTime * (1.1 + aSeed.y * 1.8) + aSeed.z * 6.28);
  vA = smoothstep(0.0, 0.08, life) * (1.0 - smoothstep(0.82, 1.0, life));
  vTint = aSeed.x;
}`;

const petalFrag = /* glsl */ `
uniform float uOpacity;
varying float vRot;
varying float vFlip;
varying float vA;
varying float vTint;
void main(){
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float s = sin(vRot), co = cos(vRot);
  c = mat2(co, -s, s, co) * c;
  c.x /= max(abs(vFlip), 0.22);
  float d = length(vec2(c.x * 1.55, c.y * 1.05 + 0.08));
  float shape = 1.0 - smoothstep(0.78, 0.9, d);
  float notch = smoothstep(0.0, 0.12, abs(c.x) * 1.4 - (c.y - 0.62));
  shape *= mix(1.0, notch, step(0.55, c.y));
  if (shape < 0.01) discard;
  vec3 deep = mix(vec3(0.89, 0.33, 0.48), vec3(0.93, 0.43, 0.55), vTint);
  vec3 col = mix(deep, vec3(0.97, 0.66, 0.74), smoothstep(-0.9, 0.8, c.y));
  col *= 0.7 + 0.3 * abs(vFlip);
  gl_FragColor = vec4(col, shape * vA * uOpacity);
}`;

export class Sakura {
  constructor(scene, tier) {
    this.group = new THREE.Group();
    scene.add(this.group);

    const tex = new THREE.CanvasTexture(treeCanvas(tier === 'low' ? 1400 : 2048));
    tex.colorSpace = THREE.NoColorSpace;
    this.tree = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, 24, 30),
      new THREE.ShaderMaterial({
        vertexShader: treeVert,
        fragmentShader: treeFrag,
        uniforms: { uMap: { value: tex }, uTime: { value: 0 }, uReveal: { value: 0 }, uOpacity: { value: 0 } },
        transparent: true,
        depthWrite: false,
      }),
    );
    this.tree.renderOrder = -2;
    this.group.add(this.tree);

    const make = (count, z0, z1, size, order) => {
      const geo = new THREE.BufferGeometry();
      const seeds = new Float32Array(count * 4);
      const rnd = mulberry(count * 7 + order);
      for (let i = 0; i < seeds.length; i++) seeds[i] = rnd();
      geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      const pts = new THREE.Points(
        geo,
        new THREE.ShaderMaterial({
          vertexShader: petalVert,
          fragmentShader: petalFrag,
          uniforms: {
            uTime: { value: 0 },
            uSize: { value: size },
            uPR: { value: 1 },
            uOrigin: { value: new THREE.Vector2() },
            uSpread: { value: new THREE.Vector2(1, 1) },
            uTravel: { value: new THREE.Vector2(10, 5) },
            uMouse: { value: new THREE.Vector2(99, 99) },
            uZ0: { value: z0 },
            uZ1: { value: z1 },
            uOpacity: { value: 0 },
          },
          transparent: true,
          depthWrite: false,
        }),
      );
      pts.frustumCulled = false;
      pts.renderOrder = order;
      this.group.add(pts);
      return pts;
    };
    const n = tier === 'high' ? 120 : tier === 'mid' ? 80 : 50;
    this.back = make(n, -1.4, -0.4, 20, -1);
    this.front = make(Math.round(n * 0.15), 1.5, 3.5, 24, 3);
  }

  resize(visW, visH, pr) {
    const portrait = visW / visH < 0.9;
    // the tree stands on the bottom-left edge; its limbs run left → right across the name
    // anchored bottom-left; big enough that the long limb runs past the right edge
    const h = portrait ? visH * 0.92 : Math.max(visH * 1.0, visW * 0.56);
    const w = h * 2;
    const x = -visW / 2 + w * 0.5 - w * 0.045;
    const y = -visH / 2 + h * 0.5 - visH * 0.02;
    this.tree.scale.set(w, h, 1);
    this.tree.position.set(x, y, -1.2);

    const origin = new THREE.Vector2(x + (CANOPY.x - 0.5) * w, y + (CANOPY.y - 0.5) * h);
    [this.back, this.front].forEach((p) => {
      const u = p.material.uniforms;
      u.uOrigin.value.copy(origin);
      u.uSpread.value.set(CANOPY.w * w, CANOPY.h * h);
      u.uTravel.value.set(visW * 1.05, visH * 0.85);
      u.uPR.value = pr;
    });
    this.visW = visW;
    this.visH = visH;
  }

  /** bloom 0..1 grows the tree in; fade 0..1 hides the whole set. */
  update(t, bloom, fade, mouse) {
    const vis = bloom * (1 - fade);
    this.group.visible = vis > 0.001;
    if (!this.group.visible) return;
    const tu = this.tree.material.uniforms;
    tu.uTime.value = t;
    tu.uReveal.value = bloom;
    tu.uOpacity.value = 1 - fade;
    const mx = mouse.nx * (this.visW / 2);
    const my = -mouse.ny * (this.visH / 2);
    [this.back, this.front].forEach((p) => {
      const u = p.material.uniforms;
      u.uTime.value = t;
      u.uMouse.value.set(mx, my);
      u.uOpacity.value = Math.min(1, Math.max(0, bloom * 1.6 - 0.4)) * (1 - fade);
    });
    this.group.position.set(mouse.nx * -0.12, mouse.ny * 0.08, 0);
  }

  get visible() {
    return this.group.visible;
  }
}
