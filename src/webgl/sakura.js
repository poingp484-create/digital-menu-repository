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
  const BARK = '#24171a';
  const BARK_LIT = 'rgba(255, 176, 150, 0.32)'; // warm lantern light from below
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
      // a little irregularity so bark never looks like a vector stroke
      const j = 1 + (rnd() - 0.5) * 0.12;
      L.push([p[0] + nx * w * j, p[1] + ny * w * j]);
      R.push([p[0] - nx * w * (2 - j), p[1] - ny * w * (2 - j)]);
    });
    ctx.fillStyle = BARK;
    ctx.beginPath();
    L.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
    ctx.closePath();
    ctx.fill();
    if (!lit) return;
    // warm rim light on the underside (skipped near the trunk joint)
    L.splice(0, Math.floor(L.length * 0.12));
    ctx.strokeStyle = BARK_LIT;
    ctx.lineWidth = Math.max(1, w0 * 0.1);
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

  // bark grain — only lands on the wood (source-atop)
  ctx.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 9000; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(0,0,0,0.35)' : 'rgba(150,110,105,0.14)';
    ctx.fillRect(x, y, (2 + rnd() * 10) * s, (1 + rnd() * 2) * s);
  }
  ctx.globalCompositeOperation = 'source-over';

  // ── yozakura blossoms: pale, translucent, each tilted at its own angle,
  //    in three depth layers (soft background → crisp → luminous front)
  const blurred = (blur, fn) => {
    // blur via an offset shadow so it works in every browser (no ctx.filter)
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,1)';
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = 20000;
    ctx.translate(-20000, 0);
    fn(true);
    ctx.restore();
  };
  const blossom = (x, y, r, rot, tilt, tone, alpha, shadowTone) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(1, tilt); // seen at an angle
    ctx.globalAlpha = alpha;
    for (let p = 0; p < 5; p++) {
      ctx.save();
      ctx.rotate((p / 5) * Math.PI * 2 + (rnd() - 0.5) * 0.18);
      const pr = r * (0.9 + rnd() * 0.18);
      const g = ctx.createRadialGradient(0, 0, 0, 0, -pr * 0.55, pr);
      g.addColorStop(0, tone[0]);
      g.addColorStop(0.45, tone[1]);
      g.addColorStop(1, tone[2]);
      ctx.fillStyle = shadowTone || g;
      if (ctx.shadowBlur) ctx.shadowColor = shadowTone || tone[1];
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-pr * 0.7, -pr * 0.18, -pr * 0.66, -pr * 1.0, -pr * 0.14, -pr * 0.98);
      ctx.quadraticCurveTo(0, -pr * 0.82, pr * 0.14, -pr * 0.98);
      ctx.bezierCurveTo(pr * 0.66, -pr * 1.0, pr * 0.7, -pr * 0.18, 0, 0);
      ctx.fill();
      if (!shadowTone) {
        // translucent rim + a faint vein
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.lineWidth = Math.max(0.6, pr * 0.05);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(214,110,140,0.25)';
        ctx.beginPath();
        ctx.moveTo(0, -pr * 0.15);
        ctx.lineTo(0, -pr * 0.7);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (!shadowTone) {
      ctx.fillStyle = tone[3];
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f6d88a';
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3, r * 0.045, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };
  const bud = (x, y, r, rot) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const g = ctx.createLinearGradient(0, -r * 1.4, 0, 0);
    g.addColorStop(0, '#f3b7c6');
    g.addColorStop(1, '#c4486c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.65, r * 0.5, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2024';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.32, r * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const MID = ['#c5587a', '#f2b9c8', '#fdeef2', '#b23a62'];
  const FRONT = ['#d36a8a', '#f9d3dd', '#fff8fa', '#c0436b'];
  const keep = (x, y) => x < W * 0.955 && y > H * 0.07;
  const puffs = sites.map(([x, y, k]) => ({ x, y, k, n: Math.round(5 + rnd() * 9 * k) }));

  // 1) soft lantern glow behind the canopy
  puffs.forEach(({ x, y, k }) => {
    const r = (90 + rnd() * 60) * s * k;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255, 196, 210, 0.13)');
    g.addColorStop(1, 'rgba(255, 196, 210, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  // 2) out-of-focus blossoms behind (depth of field)
  blurred(7 * s, () => {
    puffs.forEach(({ x, y, k, n }) => {
      for (let i = 0; i < n * 0.6; i++) {
        const bx = x + (rnd() - 0.5) * 120 * s;
        const by = y + (rnd() - 0.5) * 80 * s;
        if (keep(bx, by)) blossom(bx, by, (14 + rnd() * 10) * s, rnd() * 6.28, 0.6 + rnd() * 0.4, MID, 0.55, 'rgba(214, 128, 152, 0.9)');
      }
    });
  });
  // 3) crisp blossoms and buds
  puffs.forEach(({ x, y, k, n }) => {
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2;
      const d = Math.sqrt(rnd()) * 52 * s * (0.6 + k * 0.5);
      const bx = x + Math.cos(a) * d * 1.3;
      const by = y + Math.sin(a) * d * 0.8;
      if (!keep(bx, by)) continue;
      if (rnd() < 0.14) bud(bx, by, (8 + rnd() * 5) * s, (rnd() - 0.5) * 1.8);
      else blossom(bx, by, (13 + rnd() * 9) * s, rnd() * 6.28, 0.5 + rnd() * 0.5, MID, 0.94);
    }
  });
  // 4) a few luminous front blossoms catching the light
  ctx.shadowColor = 'rgba(255, 220, 230, 0.7)';
  ctx.shadowBlur = 12 * s;
  puffs.forEach(({ x, y, k }) => {
    if (rnd() > 0.55) return;
    const bx = x + (rnd() - 0.5) * 60 * s;
    const by = y + (rnd() - 0.5) * 40 * s;
    if (keep(bx, by)) blossom(bx, by, (16 + rnd() * 8) * s, rnd() * 6.28, 0.7 + rnd() * 0.3, FRONT, 1);
  });
  ctx.shadowBlur = 0;
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
uniform float uSoft;
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
  float shape = 1.0 - smoothstep(0.78 - uSoft, 0.9 + uSoft * 0.3, d);
  float notch = smoothstep(0.0, 0.12, abs(c.x) * 1.4 - (c.y - 0.62));
  shape *= mix(1.0, notch, step(0.55, c.y));
  if (shape < 0.01) discard;
  vec3 deep = mix(vec3(0.86, 0.45, 0.56), vec3(0.93, 0.6, 0.68), vTint);
  vec3 col = mix(deep, vec3(1.0, 0.93, 0.95), smoothstep(-0.9, 0.7, c.y));
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

    const make = (count, z0, z1, size, order, soft = 0) => {
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
            uSoft: { value: soft },
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
    // a few big, defocused petals drift right past the lens
    this.front = make(Math.round(n * 0.12), 2.5, 5, 30, 3, 0.45);
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
