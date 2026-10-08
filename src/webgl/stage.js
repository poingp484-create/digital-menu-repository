/**
 * One WebGL canvas for the whole site:
 *  1. living background (low-res render target → upscaled with grain)
 *  2. liquid-chrome YAKUZA logotype (one mesh per glyph)
 *  3. hero reveal piece that the camera flies toward through the letters
 */
import * as THREE from 'three';
import { state } from '../core/state.js';
import { device } from '../core/device.js';
import { THEMES, MOODS, SIREN } from '../data/themes.js';
import { FEATURED } from '../data/products.js';
import { productSVGString } from '../art/renders.js';
import { buildLogoAtlas } from './logoAtlas.js';
import { LOGO_FAMILY, LOGO_FINISH, LOGO_FINISHES, logoCanvasFont } from '../brand/logo.js';
import logoFontUrl from '@fontsource-variable/archivo/files/archivo-latin-standard-italic.woff2?url';
import * as S from './shaders.js';
import { Sakura } from './sakura.js';

const QUALITY = {
  high: { dpr: 1.75, bg: 0.5, oct: 5, atlas: 2.2 },
  mid: { dpr: 1.3, bg: 0.4, oct: 4, atlas: 1.8 },
  low: { dpr: 1, bg: 0.3, oct: 3, atlas: 1.5 },
};

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const expoOut = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const lerp = (a, b, t) => a + (b - a) * t;
const FOV = 35;
const CAM_Z = 10;

export class Stage {
  constructor(canvas) {
    this.canvas = canvas;
    this.ok = false;
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false, depth: true });
    } catch (e) {
      console.warn('[YAKUZA] WebGL unavailable — using DOM fallback.', e);
      document.documentElement.classList.add('no-webgl');
      return;
    }
    this.ok = true;
    this.q = QUALITY[device.tier];
    this.renderer.setClearColor(0x050506, 1);
    this.renderer.autoClear = false;

    this.time = 0;
    this.heroP = 0;
    this.env = { ...structuredClone(THEMES.hero) };
    this.frameTimes = [];
    this.lastDowngrade = 0;
    this.glitch = 0;
    this.nextGlitch = 2;

    this.#initBackground();
    this.#initScene();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  /* ── setup ─────────────────────────────────────────────────────────────── */

  #initBackground() {
    this.rt = new THREE.WebGLRenderTarget(4, 4, { depthBuffer: false, type: THREE.UnsignedByteType });
    const quad = new THREE.PlaneGeometry(2, 2);
    this.bgUniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseE: { value: 0 },
      uBase: { value: new THREE.Vector3() },
      uFog: { value: new THREE.Vector3() },
      uAccent: { value: new THREE.Vector3() },
      uHeat: { value: 0 },
      uSiren: { value: SIREN.intensity },
      uSirenPeriod: { value: SIREN.period },
      uStreaks: { value: 0 },
      uSpeed: { value: 0 },
      uSky: { value: 1 },
      uBright: { value: 0 },
      uScroll: { value: 0 },
    };
    this.bgMat = new THREE.ShaderMaterial({
      vertexShader: S.fullscreenVert,
      fragmentShader: S.backgroundFrag,
      uniforms: this.bgUniforms,
      defines: { OCTAVES: this.q.oct },
      depthTest: false,
      depthWrite: false,
    });
    this.bgScene = new THREE.Scene();
    this.bgScene.add(new THREE.Mesh(quad, this.bgMat));

    this.compUniforms = { tBg: { value: this.rt.texture }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uGrain: { value: 0.07 } };
    this.compScene = new THREE.Scene();
    this.compScene.add(
      new THREE.Mesh(
        quad,
        new THREE.ShaderMaterial({ vertexShader: S.fullscreenVert, fragmentShader: S.compositeFrag, uniforms: this.compUniforms, depthTest: false, depthWrite: false }),
      ),
    );
    this.flatCam = new THREE.Camera();
  }

  #initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    this.camera.position.z = CAM_Z;

    this.logo = new THREE.Group();
    this.scene.add(this.logo);

    // sakura set behind the logo
    this.sakura = new Sakura(this.scene, device.tier);

    // glyph meshes are built once the logo font has loaded (buildLogo)
    this.glyphs = [];
    this.atlas = null;

    // spray-paint dust behind the logo
    const spray = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sprayCanvas()), transparent: true, opacity: 0, depthWrite: false, color: 0xb9ad94 }),
    );
    spray.position.z = -1.2;
    this.spray = spray;
    this.scene.add(spray);

    // hero reveal piece
    this.pieceUniforms = { uMap: { value: null }, uOpacity: { value: 0 }, uAberr: { value: 0 }, uBright: { value: 1 }, uTime: { value: 0 } };
    this.piece = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        vertexShader: S.logoVert,
        fragmentShader: S.pieceFrag,
        uniforms: this.pieceUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
      }),
    );
    this.piece.visible = false;
    this.piece.renderOrder = -1;
    this.scene.add(this.piece);
    this.#loadPieceTexture();
  }


  /** Build the chrome glyph meshes. Needs the logo font, so it runs after fonts load. */
  async buildLogo() {
    if (!this.ok) return;
    try {
      await document.fonts.load(logoCanvasFont(100), 'YAKUZA');
    } catch {
      /* fall through with whatever font is available */
    }
    const atlas = buildLogoAtlas(this.q.atlas);
    this.atlas = atlas;
    const tex = new THREE.DataTexture(atlas.data, atlas.width, atlas.height, THREE.RGBAFormat);
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;

    const plane = new THREE.PlaneGeometry(1, 1);
    this.glyphs = atlas.cells.map((cell, i) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: S.logoVert,
        fragmentShader: S.logoFrag,
        uniforms: {
          uMap: { value: tex },
          uRect: { value: new THREE.Vector4(...cell.rect) },
          uTexel: { value: new THREE.Vector2(1 / atlas.width, 1 / atlas.height) },
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uGlitch: { value: 0 },
          uSeed: { value: i * 7.13 },
          uMouse: { value: new THREE.Vector2() },
          uRowY: { value: 0 },
          uCap: { value: 1 },
          uFlash: { value: 0 },
          uTint: { value: new THREE.Vector3() },
          uSpec: { value: new THREE.Vector3() },
          uGloss: { value: 0 },
          uIri: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
      });
      const mesh = new THREE.Mesh(plane, mat);
      mesh.userData = { cell, i, base: new THREE.Vector3(), swoosh: cell.char === 'swoosh' };
      this.logo.add(mesh);
      return mesh;
    });

    this.setLogoFinish(LOGO_FINISH);
    this.resize();
  }

  /** Switch the metal finish of the 3D logo (see LOGO_FINISHES in brand/logo.js). */
  setLogoFinish(name) {
    const f = LOGO_FINISHES[name] || LOGO_FINISHES.chrome;
    this.glyphs.forEach((m) => {
      const u = m.material.uniforms;
      u.uTint.value.fromArray(f.tint);
      u.uSpec.value.fromArray(f.spec);
      u.uGloss.value = f.gloss;
      u.uIri.value = f.iri;
    });
    document.documentElement.dataset.finish = name;
  }

  async #loadPieceTexture() {
    try {
      let tex;
      if (FEATURED.image) {
        tex = await new THREE.TextureLoader().loadAsync(FEATURED.image);
      } else {
        // SVG-as-image can't see page fonts, so embed the logo face as a data URI
        let fontCSS = '';
        try {
          const buf = await (await fetch(logoFontUrl)).arrayBuffer();
          let bin = '';
          const bytes = new Uint8Array(buf);
          for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
          fontCSS = `<style>@font-face{font-family:'${LOGO_FAMILY}';font-style:italic;font-weight:100 900;font-stretch:62% 125%;src:url(data:font/woff2;base64,${btoa(bin)}) format('woff2');}</style>`;
        } catch {
          /* fallback font */
        }
        const svgText = productSVGString(FEATURED).replace(/(<svg[^>]*>)/, `$1${fontCSS}`);
        const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
        const img = new Image();
        img.src = url;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = 960;
        c.height = 1200;
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        tex = new THREE.CanvasTexture(c);
      }
      tex.colorSpace = THREE.NoColorSpace;
      tex.minFilter = THREE.LinearFilter;
      this.pieceUniforms.uMap.value = tex;
      const img = tex.image;
      this.pieceAspect = img.width / img.height;
      this.piece.visible = true;
      this.resize();
    } catch (e) {
      console.warn('[YAKUZA] hero piece texture failed', e);
    }
  }

  /* ── layout ────────────────────────────────────────────────────────────── */

  resize() {
    if (!this.ok) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, this.q.dpr);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.rt.setSize(Math.max(2, Math.round(w * this.q.bg)), Math.max(2, Math.round(h * this.q.bg)));
    this.bgUniforms.uRes.value.set(w, h);
    this.compUniforms.uRes.value.set(w * dpr, h * dpr);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    const visH = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const visW = visH * this.camera.aspect;
    this.visH = visH;
    this.visW = visW;
    this.#layoutLogo(visW, visH);
    this.sakura.resize(visW, visH, dpr);

    if (this.pieceAspect) {
      const ph = visH * 0.86;
      this.piece.scale.set(ph * this.pieceAspect, ph, 1);
    }
  }

  #layoutLogo(visW, visH) {
    if (!this.atlas) return;
    const cells = this.atlas.cells;
    const wordW = this.atlas.wordWidth;
    const portrait = visW / visH < 0.9;
    this.portrait = portrait;
    let U;
    const rows = [];
    if (!portrait) {
      U = Math.min((visW * 0.86) / (wordW + 40), (visH * 0.46) / 130);
      rows.push({ from: 0, to: 5, offsetX: -wordW / 2, y: 0.03 * visH });
    } else {
      const g = cells;
      const rowA = g[2].cxU + g[2].wU / 2 - (g[0].cxU - g[0].wU / 2) - 56;
      const rowB = g[5].cxU + g[5].wU / 2 - (g[3].cxU - g[3].wU / 2) - 56;
      U = Math.min((visW * 0.86) / Math.max(rowA, rowB), (visH * 0.2) / 130);
      const xa = g[0].cxU - g[0].wU / 2 + 28;
      const xb = g[3].cxU - g[3].wU / 2 + 28;
      rows.push({ from: 0, to: 2, offsetX: -xa - rowA / 2, y: 70 * U + 0.03 * visH });
      rows.push({ from: 3, to: 5, offsetX: -xb - rowB / 2, y: -70 * U + 0.03 * visH });
    }
    this.U = U;
    this.glyphs.forEach((m) => {
      const { cell, i, swoosh } = m.userData;
      if (swoosh) {
        const last = rows[rows.length - 1];
        const sx = portrait ? 0.48 : 1;
        m.scale.set(cell.wU * U * sx, cell.hU * U, 1);
        m.userData.base.set((cell.cxU - wordW / 2) * U * sx, last.y - (cell.cyU - 50) * U, 0);
        m.material.uniforms.uRowY.value = last.y;
        m.material.uniforms.uCap.value = 100 * U;
        return;
      }
      const row = rows.find((r) => i >= r.from && i <= r.to);
      m.scale.set(cell.wU * U, cell.hU * U, 1);
      m.userData.base.set((cell.cxU + row.offsetX) * U, row.y - (cell.cyU - 50) * U, 0);
      m.material.uniforms.uRowY.value = row.y;
      m.material.uniforms.uCap.value = 100 * U;
    });
    const sprayW = portrait ? visW * 1.3 : Math.min(visW * 1.1, wordW * U * 1.35);
    this.spray.scale.set(sprayW, sprayW * 0.5, 1);
    this.spray.position.y = 0.03 * visH;
  }

  /** Called once if the FPS monitor wants cheaper rendering. */
  applyQuality() {
    this.q = QUALITY[device.tier];
    this.bgMat.defines.OCTAVES = this.q.oct;
    this.bgMat.needsUpdate = true;
    this.resize();
  }

  /* ── frame ─────────────────────────────────────────────────────────────── */

  render(dt) {
    if (!this.ok) return;
    this.time += dt;
    const t = this.time;
    this.#monitor(dt);

    // environment grade
    const target = THEMES[state.theme] || THEMES.hero;
    const mood = MOODS[state.mood] || MOODS.dusk;
    const k = 1 - Math.pow(0.12, dt);
    const env = this.env;
    for (const key of ['base', 'fog', 'accent'])
      for (let i = 0; i < 3; i++) env[key][i] = lerp(env[key][i], lerp(target[key][i], mood[key][i], mood.weight), k);
    env.heat = lerp(env.heat, target.heat + state.env.heatBoost, k);
    env.streaks = lerp(env.streaks, target.streaks + state.env.streakBoost, k);
    env.sky = lerp(env.sky, target.sky, k);
    env.bright = lerp(env.bright, target.bright + state.env.brightBoost, k);

    // hero progress (extra smoothing for cinematic weight)
    const hp = state.hero.progress;
    // big jumps (nav / index) snap instead of replaying the whole fly-through
    if (Math.abs(hp - this.heroP) > 0.3 && (hp === 0 || hp === 1)) this.heroP = hp;
    else this.heroP = lerp(this.heroP, hp, 1 - Math.pow(0.02, dt));
    const P = this.heroP;
    const I = state.hero.intro;

    // glitch bursts
    this.nextGlitch -= dt;
    if (this.nextGlitch <= 0) {
      this.glitch = 0.35 + Math.random() * 0.5;
      this.nextGlitch = 2.5 + Math.random() * 4;
    }
    this.glitch *= Math.pow(0.004, dt);
    const transitionGlitch = Math.sin(Math.PI * smooth(0.04, 0.42, P)) * 0.55;
    const introGlitch = (1 - smooth(0.35, 0.95, I)) * 0.8;
    const glitch = Math.min(1, this.glitch + transitionGlitch + introGlitch);

    const m = state.mouse;
    const u = this.bgUniforms;
    u.uTime.value = t;
    u.uMouse.value.set((m.nx + 1) / 2, 1 - (m.ny + 1) / 2);
    u.uMouseE.value = device.touch ? m.energy * 0.6 : 0.25 + m.energy;
    u.uBase.value.fromArray(env.base);
    u.uFog.value.fromArray(env.fog);
    u.uAccent.value.fromArray(env.accent);
    u.uHeat.value = env.heat;
    u.uStreaks.value = env.streaks + Math.sin(Math.PI * smooth(0.1, 0.7, P)) * 0.8;
    u.uSpeed.value = Math.min(1.2, state.scroll.speed);
    u.uSky.value = env.sky;
    u.uBright.value = env.bright + Math.sin(Math.PI * smooth(0.15, 0.85, P)) * 0.55 - (1 - I) * 0.6;
    u.uScroll.value = state.scroll.y / window.innerHeight;
    this.compUniforms.uTime.value = t;

    // ── logo choreography
    const heroVisible = P < 0.995 && I > 0;
    this.logo.visible = heroVisible;
    if (heroVisible) this.#updateLogo(t, P, I, glitch);
    this.#updatePiece(t, P);
    this.sakura.update(t, state.hero.bloom, smooth(0.06, 0.4, P), state.mouse);

    const r = this.renderer;
    r.setRenderTarget(this.rt);
    r.render(this.bgScene, this.flatCam);
    r.setRenderTarget(null);
    r.clear();
    r.render(this.compScene, this.flatCam);
    if (heroVisible || this.sakura.visible || this.piece.material.uniforms.uOpacity.value > 0.001) r.render(this.scene, this.camera);
  }

  #updateLogo(t, P, I, glitch) {
    const m = state.mouse;
    const introE = expoOut(I);
    const spread = smooth(0.05, 0.6, P);
    const fade = 1 - smooth(0.32, 0.62, P);

    this.logo.scale.setScalar(1 + (1 - introE) * 1.6);
    this.logo.rotation.y = m.nx * 0.12;
    this.logo.rotation.x = m.ny * 0.07;

    const halfW = this.visW / 2;
    this.glyphs.forEach((mesh) => {
      const { i, base, swoosh } = mesh.userData;
      const uni = mesh.material.uniforms;
      uni.uTime.value = t;
      uni.uMouse.value.set(m.nx, -m.ny);
      uni.uGlitch.value = glitch * (0.5 + 0.5 * Math.sin(i * 12.3 + t * 3.0));

      const li = clamp01((I * 1.5 - i * 0.07) / 0.65);
      const appear = expoOut(li);
      uni.uFlash.value = Math.max(0, Math.sin(Math.PI * clamp01((I - 0.55) / 0.35))) * 0.35;

      if (swoosh) {
        mesh.position.set(base.x - smooth(0.02, 0.3, P) * this.visW * 1.4 + (1 - appear) * this.visW * 0.5, base.y, base.z);
        uni.uOpacity.value = appear * (1 - smooth(0.04, 0.24, P));
        return;
      }
      const dir = Math.sign(base.x) || (i < 3 ? -1 : 1);
      const centrality = 1 - Math.min(1, Math.abs(base.x) / halfW);
      const alt = i % 2 ? 1 : -1;
      const bob = Math.sin(t * 0.7 + i * 1.3) * 0.025;

      mesh.position.set(
        base.x * (1 + spread * 1.5) + dir * spread * 0.8,
        base.y + bob + alt * spread * 0.9 + (1 - appear) * 0.4 * alt,
        base.z + spread * (5 + 6 * centrality),
      );
      mesh.rotation.set(alt * spread * 0.35 + (1 - appear) * 0.6 * alt, -dir * spread * 1.0 + m.nx * 0.05, alt * spread * 0.12);
      const nearFade = 1 - smooth(7.5, 9.5, mesh.position.z);
      uni.uOpacity.value = appear * fade * nearFade;
    });

    this.spray.material.opacity = 0.14 * introE * (1 - smooth(0.02, 0.2, P));
    this.spray.position.x = m.nx * 0.15;
    this.spray.rotation.z = -0.04;
  }

  #updatePiece(t, P) {
    const uni = this.pieceUniforms;
    if (!uni.uMap.value) return;
    const m = state.mouse;
    const appear = smooth(0.2, 0.48, P);
    const approach = smooth(0.48, 0.86, P);
    const leave = smooth(0.84, 1.0, P);
    this.piece.position.set(m.nx * -0.2 * (1 - approach), lerp(-0.6, 0, appear) - approach * 0.4, lerp(-9, -1.5, appear) + approach * 5.5);
    this.piece.rotation.set(m.ny * 0.08 + (1 - appear) * 0.3, m.nx * 0.18 + (1 - appear) * -0.5, (1 - appear) * 0.08);
    uni.uOpacity.value = appear * (1 - leave);
    uni.uAberr.value = 0.003 + (1 - appear) * 0.04 + approach * 0.012 + Math.min(state.scroll.speed, 1) * 0.012;
    uni.uBright.value = lerp(0.2, 0.95, appear) + approach * 0.1 - leave * 0.8;
    uni.uTime.value = t;
  }

  #monitor(dt) {
    if (device.tier === 'low') return;
    this.frameTimes.push(dt);
    if (this.frameTimes.length < 120) return;
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.frameTimes.length = 0;
    if (avg > 1 / 42 && this.time - this.lastDowngrade > 4 && !document.hidden) {
      this.lastDowngrade = this.time;
      device.downgrade();
      this.applyQuality();
    }
  }
}

/** Procedural spray-paint dust for behind the logo (NFS-style splatter). */
function sprayCanvas() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');
  const rnd = mulberry(7);
  const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 2;
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 9000; i++) {
    const x = 512 + gauss() * 520;
    const y = 256 + gauss() * 150;
    const r = Math.pow(rnd(), 3) * 3.2 + 0.4;
    ctx.globalAlpha = 0.15 + rnd() * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

function mulberry(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
