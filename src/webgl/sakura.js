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
const CANOPY = { x: 0.45, y: 0.76, w: 0.75, h: 0.36 }; // centre + extent, uv (y up)
const ROOT_U = 0.2;

function treeCanvas(width) {
  const W = width;
  const H = Math.round(width * 1.25);
  const s = W / 1024;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  const rnd = mulberry(23);
  const tips = [];
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // limbs: tapered bezier strokes, dark bark with a cool rim light from the right
  function limb(x, y, ang, len, w, depth) {
    const segs = 5;
    let px = x;
    let py = y;
    for (let i = 0; i < segs; i++) {
      // limbs drift toward the right (angle 0) as they grow
      // limbs settle toward up-and-right (-0.45 rad) as they grow
      ang += (rnd() - 0.5) * 0.24 + (-0.45 - ang) * 0.07 * (depth < 4 ? 1 : 0.3);
      const step = len / segs;
      const nx = px + Math.cos(ang) * step;
      const ny = py + Math.sin(ang) * step;
      const mx = (px + nx) / 2 + (rnd() - 0.5) * 10 * s;
      const my = (py + ny) / 2 + (rnd() - 0.5) * 10 * s;
      const nw = w * 0.95;
      ctx.strokeStyle = '#26161a';
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(mx, my, nx, ny);
      ctx.stroke();
      if (depth === 1 && i === segs - 2 && rnd() > 0.5) tips.push([nx, ny, 0.5]);
      px = nx;
      py = ny;
      w = nw;
    }
    if (depth <= 0) {
      tips.push([px, py, 1]);
      return;
    }
    const kids = depth >= 3 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const spread = (k - (kids - 1) / 2) * (0.5 + rnd() * 0.3) - 0.05;
      limb(px, py, ang + spread, len * (0.7 + rnd() * 0.12), w * 0.66, depth - 1);
    }
  }

  // trunk: rises from the bottom, leaning right
  limb(ROOT_U * W, H + 20 * s, -Math.PI / 2 + 0.1, 380 * s, 60 * s, 4);

  // the bark gets a single soft rim light from the right instead of per-segment strokes
  ctx.globalCompositeOperation = 'source-atop';
  const rim = ctx.createLinearGradient(0, 0, W, 0);
  rim.addColorStop(0, 'rgba(0,0,0,0)');
  rim.addColorStop(1, 'rgba(160, 105, 118, 0.35)');
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';

  // keep blossoms inside the texture so nothing is ever cut by its edge
  for (let i = tips.length - 1; i >= 0; i--) if (tips[i][0] > W * 0.9 || tips[i][1] < H * 0.07) tips.splice(i, 1);

  // canopy: soft pink volume first, then three layers of blossoms (back → front)
  tips.forEach(([x, y, k]) => {
    const r = (55 + rnd() * 45) * s * k;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255, 150, 180, 0.16)');
    g.addColorStop(1, 'rgba(255, 150, 180, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  const blossom = (x, y, r, rot, tone) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    for (let p = 0; p < 5; p++) {
      ctx.save();
      ctx.rotate((p / 5) * Math.PI * 2);
      const g = ctx.createLinearGradient(0, 0, 0, -r);
      g.addColorStop(0, tone[0]);
      g.addColorStop(1, tone[1]);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-r * 0.6, -r * 0.3, -r * 0.5, -r * 0.95, -r * 0.12, -r);
      ctx.lineTo(0, -r * 0.86);
      ctx.lineTo(r * 0.12, -r);
      ctx.bezierCurveTo(r * 0.5, -r * 0.95, r * 0.6, -r * 0.3, 0, 0);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(200, 40, 90, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  const LAYERS = [
    { tone: ['#a83d60', '#d97c9a'], n: 14, r: [7, 11] },
    { tone: ['#ef7f9f', '#ffc6d5'], n: 16, r: [8, 13] },
    { tone: ['#ffb3c6', '#fff3f6'], n: 10, r: [9, 14] },
  ];
  LAYERS.forEach((L, li) => {
    ctx.shadowColor = li === 2 ? 'rgba(255, 190, 210, 0.6)' : 'transparent';
    ctx.shadowBlur = li === 2 ? 10 * s : 0;
    tips.forEach(([x, y, k]) => {
      const n = Math.round(L.n * k);
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2;
        const d = Math.sqrt(rnd()) * (50 * s) * k;
        blossom(x + Math.cos(a) * d * 1.3, y + Math.sin(a) * d * 0.85, (L.r[0] + rnd() * (L.r[1] - L.r[0])) * s, rnd() * 6.28, L.tone);
      }
    });
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
  // the higher up the tree, the more it moves in the wind
  float h = smoothstep(0.25, 1.0, uv.y);
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
  float d = length((vUv - vec2(${ROOT_U.toFixed(2)}, 0.0)) * vec2(0.8, 1.0)) / 1.05;
  float grow = smoothstep(d - 0.05, d + 0.02, uReveal * 1.12);
  float edge = smoothstep(1.0, 0.92, vUv.x) * smoothstep(1.0, 0.95, vUv.y);
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
  vec3 deep = mix(vec3(1.0, 0.45, 0.6), vec3(0.95, 0.35, 0.5), vTint);
  vec3 col = mix(deep, vec3(1.0, 0.9, 0.94), smoothstep(-0.9, 0.8, c.y));
  col *= 0.7 + 0.3 * abs(vFlip);
  gl_FragColor = vec4(col, shape * vA * uOpacity);
}`;

export class Sakura {
  constructor(scene, tier) {
    this.group = new THREE.Group();
    scene.add(this.group);

    const tex = new THREE.CanvasTexture(treeCanvas(tier === 'low' ? 900 : 1280));
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
    // the tree stands on the bottom-left edge; its canopy reaches right over the name
    const h = visH * (portrait ? 0.82 : 1.08);
    const w = h / 1.25;
    const x = -visW / 2 + w * (portrait ? 0.32 : 0.36);
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
