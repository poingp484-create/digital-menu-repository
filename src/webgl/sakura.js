/**
 * Botanical sakura set for the intro — two procedural cherry branches that
 * grow in (bloom reveal) and sway, plus drifting petals that tumble, flip and
 * scatter away from the cursor. Lives in the WebGL scene behind the chrome
 * letters; a few petals fall in front for depth.
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

/** Paint one branch (root at the canvas top-left corner, growing toward the centre). */
function branchCanvas(seed, size = 1024) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size / 2;
  const ctx = c.getContext('2d');
  const rnd = mulberry(seed);
  const s = size / 1024;
  const tips = [];

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  function grow(x, y, ang, len, w, depth) {
    const segs = 4;
    let px = x;
    let py = y;
    for (let i = 0; i < segs; i++) {
      ang += (rnd() - 0.5) * 0.3;
      const nx = px + Math.cos(ang) * (len / segs);
      const ny = py + Math.sin(ang) * (len / segs);
      const mx = (px + nx) / 2 + (rnd() - 0.5) * 14 * s;
      const my = (py + ny) / 2 + (rnd() - 0.5) * 14 * s;
      // bark: dark core + faint warm rim so it reads on a dark city
      ctx.strokeStyle = '#2a171b';
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(mx, my, nx, ny);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(190, 110, 118, 0.6)';
      ctx.lineWidth = Math.max(1, w * 0.2);
      ctx.beginPath();
      ctx.moveTo(px - w * 0.18, py - w * 0.3);
      ctx.quadraticCurveTo(mx - w * 0.18, my - w * 0.3, nx - w * 0.18, ny - w * 0.3);
      ctx.stroke();
      if (depth <= 1 && rnd() > 0.6) tips.push([nx, ny, 0.5 + rnd() * 0.4]);
      px = nx;
      py = ny;
      w *= 0.9;
    }
    if (depth > 0) {
      const kids = depth > 2 ? 2 : 2 + (rnd() > 0.5 ? 1 : 0);
      for (let k = 0; k < kids; k++) {
        // branches fan mostly sideways and droop a little — they frame, never cross the name
        const spread = (k - (kids - 1) / 2) * (0.35 + rnd() * 0.3) + 0.12;
        grow(px, py, ang + spread, len * (0.6 + rnd() * 0.14), w * 0.64, depth - 1);
      }
    } else tips.push([px, py, 1]);
  }
  grow(-30 * s, 70 * s, 0.1, 330 * s, 22 * s, 4);

  // blossoms
  const flower = (x, y, r, rot, open) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.shadowColor = 'rgba(255, 150, 180, 0.55)';
    ctx.shadowBlur = 14 * s;
    for (let p = 0; p < 5; p++) {
      ctx.save();
      ctx.rotate((p / 5) * Math.PI * 2);
      const g = ctx.createLinearGradient(0, 0, 0, -r);
      g.addColorStop(0, '#ff7fa2');
      g.addColorStop(0.45, '#ffc2d2');
      g.addColorStop(1, '#fff1f5');
      ctx.fillStyle = g;
      ctx.beginPath();
      // petal with the characteristic notch at the tip
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-r * 0.62 * open, -r * 0.25, -r * 0.55 * open, -r * 0.95, -r * 0.12, -r);
      ctx.lineTo(0, -r * 0.84);
      ctx.lineTo(r * 0.12, -r);
      ctx.bezierCurveTo(r * 0.55 * open, -r * 0.95, r * 0.62 * open, -r * 0.25, 0, 0);
      ctx.fill();
      ctx.restore();
    }
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(190, 40, 80, 0.8)';
    ctx.lineWidth = 1.2 * s;
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42);
      ctx.stroke();
      ctx.fillStyle = '#ffd36b';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42, 1.6 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };
  tips.forEach(([x, y, k]) => {
    if (y > 400 * s) return;
    const n = 1 + Math.round(rnd() * 2.4 * k);
    for (let i = 0; i < n; i++) {
      const fx = x + (rnd() - 0.5) * 60 * s;
      const fy = y + (rnd() - 0.5) * 44 * s;
      if (rnd() > 0.82) {
        ctx.fillStyle = '#d94a72';
        ctx.beginPath();
        ctx.ellipse(fx, fy, 5 * s, 8 * s, rnd() * 3, 0, Math.PI * 2);
        ctx.fill();
      } else flower(fx, fy, (14 + rnd() * 12) * s, rnd() * 6.28, 0.85 + rnd() * 0.3);
    }
  });
  return c;
}

const branchVert = /* glsl */ `
uniform float uTime;
uniform float uSway;
varying vec2 vUv;
void main(){
  vUv = uv;
  vec3 p = position;
  // distance from the root (top-left of the texture) — tips sway most
  float d = length(vec2(uv.x, 1.0 - uv.y));
  float w = d * d;
  p.x += sin(uTime * 0.7 + d * 3.0) * 0.06 * w * uSway;
  p.y += cos(uTime * 0.9 + d * 2.4) * 0.05 * w * uSway;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const branchFrag = /* glsl */ `
uniform sampler2D uMap;
uniform float uReveal;
uniform float uOpacity;
varying vec2 vUv;
void main(){
  vec4 c = texture2D(uMap, vUv);
  float d = length(vec2(vUv.x, (1.0 - vUv.y) * 0.5)) / 1.12;
  float grow = smoothstep(d - 0.06, d + 0.02, uReveal * 1.1);
  // soft fade at the far texture edges so nothing ever shows a hard cut
  float edge = smoothstep(1.0, 0.82, vUv.x) * smoothstep(0.0, 0.16, vUv.y);
  float a = c.a * grow * edge * uOpacity;
  if (a < 0.003) discard;
  gl_FragColor = vec4(c.rgb, a);
}`;

const petalVert = /* glsl */ `
attribute vec4 aSeed;
uniform float uTime;
uniform float uSize;
uniform float uPR;
uniform vec2 uVis;
uniform vec2 uMouse;
uniform float uZ0;
uniform float uZ1;
varying float vRot;
varying float vFlip;
varying float vA;
varying float vTint;
void main(){
  float speed = 0.045 + aSeed.w * 0.06;
  float fall = fract(aSeed.y + uTime * speed);
  float y = uVis.y * 0.62 - fall * uVis.y * 1.3;
  float x = (aSeed.x - 0.5) * uVis.x * 1.2 + sin(uTime * (0.5 + aSeed.z) + aSeed.w * 6.28) * 0.5 + fall * uVis.x * 0.18;
  float z = mix(uZ0, uZ1, aSeed.z);
  vec2 d = vec2(x, y) - uMouse;
  float dl = length(d);
  vec2 push = normalize(d + 1e-4) * 0.9 * exp(-dl * dl * 1.4);
  vec4 mv = modelViewMatrix * vec4(x + push.x, y + push.y, z, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.6 + aSeed.w * 0.8) * uPR * (10.0 / -mv.z);
  vRot = uTime * (0.6 + aSeed.w * 1.4) + aSeed.x * 6.28;
  vFlip = cos(uTime * (1.0 + aSeed.y * 1.8) + aSeed.z * 6.28);
  vA = smoothstep(0.0, 0.06, fall) * (1.0 - smoothstep(0.88, 1.0, fall));
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
  // notch at the tip
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
    const texSize = tier === 'low' ? 768 : 1024;

    this.branches = [11, 29].map((seed, i) => {
      const tex = new THREE.CanvasTexture(branchCanvas(seed, texSize * 1.5));
      tex.colorSpace = THREE.NoColorSpace;
      const mat = new THREE.ShaderMaterial({
        vertexShader: branchVert,
        fragmentShader: branchFrag,
        uniforms: { uMap: { value: tex }, uTime: { value: 0 }, uSway: { value: 1 }, uReveal: { value: 0 }, uOpacity: { value: 0 } },
        transparent: true,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 24, 24), mat);
      mesh.renderOrder = -2;
      mesh.userData.flip = i === 1;
      this.group.add(mesh);
      return mesh;
    });

    const make = (count, z0, z1, size, order) => {
      const geo = new THREE.BufferGeometry();
      const seeds = new Float32Array(count * 4);
      const rnd = mulberry(count * 7 + order);
      for (let i = 0; i < seeds.length; i++) seeds[i] = rnd();
      geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      const mat = new THREE.ShaderMaterial({
        vertexShader: petalVert,
        fragmentShader: petalFrag,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: size },
          uPR: { value: 1 },
          uVis: { value: new THREE.Vector2(10, 6) },
          uMouse: { value: new THREE.Vector2(99, 99) },
          uZ0: { value: z0 },
          uZ1: { value: z1 },
          uOpacity: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
      });
      const pts = new THREE.Points(geo, mat);
      pts.frustumCulled = false;
      pts.renderOrder = order;
      this.group.add(pts);
      return pts;
    };
    const n = tier === 'high' ? 140 : tier === 'mid' ? 90 : 55;
    this.back = make(n, -5, -0.6, 22, -1);
    this.front = make(Math.round(n * 0.12), 1.5, 4, 26, 3);
  }

  resize(visW, visH, pr) {
    const portrait = visW / visH < 0.9;
    // wide planes (2:1), root just off the corner: top-left branch runs along the top,
    // bottom-right branch (rotated 180°) runs along the bottom
    const w = portrait ? visW * 1.05 : Math.min(visW * 0.62, visH * 1.5);
    const h = w / 2;
    const [a, b] = this.branches;
    a.scale.set(w, h, 1);
    a.position.set(-visW / 2 + w * 0.47, visH / 2 - h * 0.42, -1.6);
    b.scale.set(w * 0.85, h * 0.85, 1);
    b.rotation.z = Math.PI;
    b.position.set(visW / 2 - w * 0.85 * 0.47, -visH / 2 + h * 0.85 * 0.42, -1.8);
    [this.back, this.front].forEach((p) => {
      p.material.uniforms.uVis.value.set(visW, visH);
      p.material.uniforms.uPR.value = pr;
    });
    this.visW = visW;
    this.visH = visH;
  }

  /** bloom 0..1 grows the branches in; fade 0..1 hides the whole set. */
  update(t, bloom, fade, mouse) {
    const vis = bloom * (1 - fade);
    this.group.visible = vis > 0.001;
    if (!this.group.visible) return;
    this.branches.forEach((b) => {
      const u = b.material.uniforms;
      u.uTime.value = t;
      u.uReveal.value = bloom;
      u.uOpacity.value = 1 - fade;
    });
    const mx = mouse.nx * (this.visW / 2);
    const my = -mouse.ny * (this.visH / 2);
    [this.back, this.front].forEach((p) => {
      const u = p.material.uniforms;
      u.uTime.value = t;
      u.uMouse.value.set(mx, my);
      u.uOpacity.value = Math.min(1, bloom * 1.5) * (1 - fade);
    });
    this.group.position.set(mouse.nx * -0.15, mouse.ny * 0.1, 0);
  }

  get visible() {
    return this.group.visible;
  }
}
