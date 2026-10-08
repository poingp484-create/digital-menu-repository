/**
 * Choreography library. Every product names an `enter`, `exit` and `text`
 * preset in src/data/products.js — each one adds tweens to the category's
 * scroll-scrubbed timeline at a given position `at` lasting `D` units.
 *
 * Elements (`e`): piece, media, vel, img, fx, ghost, jp, cover, chars,
 * rank, count, specs, price, cta, mb (motion-blur feGaussianBlur).
 */
import { scrambleTo } from '../core/split.js';

const NOBLUR = 'blur(0px)';
/** fromTo that does NOT render its start state at build time (for exits / later tweens). */
const ft = (tl, t, from, to, at) => tl.fromTo(t, from, { ...to, immediateRender: false }, at);

const staircase = (p, bands = 9, reverse = false) => {
  // polygon whose right edge is a staircase of bands revealing at staggered times
  const pts = ['0% 0%'];
  for (let k = 0; k < bands; k++) {
    const kk = reverse ? bands - 1 - k : k;
    const local = Math.min(1, Math.max(0, p * 1.8 - kk * (0.8 / bands)));
    const w = (1 - Math.pow(1 - local, 3)) * 100;
    const y0 = (k / bands) * 100;
    const y1 = ((k + 1) / bands) * 100;
    pts.push(`${w}% ${y0}%`, `${w}% ${y1}%`);
  }
  pts.push('0% 100%');
  return `polygon(${pts.join(',')})`;
};

/* ─── ENTER ─────────────────────────────────────────────────────────────── */

export const ENTER = {
  // 01: slides in from the right, rotates, settles centre
  slideRotate(tl, e, at, D) {
    tl.fromTo(e.img, { xPercent: 135, rotation: 26, scale: 0.84, filter: 'blur(18px)' }, { xPercent: 0, rotation: -4, scale: 1, filter: NOBLUR, duration: D * 0.78, ease: 'power3.out' }, at);
    ft(tl, e.img, { rotation: -4 }, { rotation: 0, duration: D * 0.22, ease: 'sine.inOut' }, at + D * 0.78);
    tl.set(e.img, { filter: 'none' }, at + D);
  },
  // 02: emerges from below, 70% → 110% → settles
  riseScale(tl, e, at, D) {
    tl.fromTo(e.img, { yPercent: 115, scale: 0.7, rotationX: 35, filter: 'blur(10px)' }, { yPercent: -5, scale: 1.1, rotationX: 0, filter: NOBLUR, duration: D * 0.65, ease: 'power2.out' }, at);
    ft(tl, e.img, { yPercent: -5, scale: 1.1 }, { yPercent: 0, scale: 1, duration: D * 0.35, ease: 'power2.inOut' }, at + D * 0.65);
    tl.set(e.img, { filter: 'none' }, at + D);
  },
  // 03: horizontal motion blur, becomes sharp
  motionBlur(tl, e, at, D) {
    const proxy = { b: 90 };
    tl.set(e.img, { filter: `url(#${e.mbId})` }, at);
    tl.fromTo(e.img, { xPercent: -170, skewX: -28, scaleX: 1.5 }, { xPercent: 0, skewX: 0, scaleX: 1, duration: D * 0.85, ease: 'expo.out' }, at);
    tl.fromTo(proxy, { b: 90 }, { b: 0, duration: D * 0.85, ease: 'expo.out', onUpdate: () => e.mb?.setAttribute('stdDeviation', `${proxy.b.toFixed(1)} 0`) }, at);
    tl.set(e.img, { filter: 'none' }, at + D);
  },
  // 04: hidden behind its own name — the typography parts to reveal it
  behindType(tl, e, at, D) {
    const [a, b] = e.cover.children;
    tl.fromTo(e.cover, { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: D * 0.3, ease: 'power3.out' }, at);
    tl.fromTo(a, { xPercent: 0 }, { xPercent: -130, filter: 'blur(6px)', duration: D * 0.6, ease: 'power3.inOut' }, at + D * 0.35);
    tl.fromTo(b, { xPercent: 0 }, { xPercent: 130, filter: 'blur(6px)', duration: D * 0.6, ease: 'power3.inOut' }, at + D * 0.35);
    tl.fromTo(e.img, { scale: 0.82, filter: 'brightness(0.15) contrast(1.4)' }, { scale: 1, filter: 'brightness(1) contrast(1)', duration: D * 0.8, ease: 'power2.out' }, at + D * 0.2);
    tl.set(e.cover, { opacity: 0 }, at + D);
    tl.set(e.img, { filter: 'none' }, at + D);
  },
  // tees 01: starts right against the lens, pulls back
  cameraPull(tl, e, at, D) {
    tl.fromTo(e.img, { scale: 3.6, yPercent: 18, opacity: 0, filter: 'blur(22px)' }, { scale: 1, yPercent: 0, opacity: 1, filter: NOBLUR, duration: D, ease: 'power3.out' }, at);
    tl.set(e.img, { filter: 'none' }, at + D);
  },
  // tees 02: staircase scan reveal
  sliceReveal(tl, e, at, D) {
    const pr = { p: 0 };
    tl.fromTo(pr, { p: 0 }, { p: 1, duration: D, ease: 'none', onUpdate: () => (e.img.style.clipPath = staircase(pr.p)) }, at);
    tl.fromTo(e.img, { xPercent: -12, opacity: 1 }, { xPercent: 0, duration: D, ease: 'power2.out' }, at);
    tl.set(e.img, { clipPath: 'none' }, at + D);
  },
  // tees 03: glitch in — stepped jitter + RGB split
  glitch(tl, e, at, D) {
    tl.fromTo(
      e.img,
      { x: 60, skewX: 24, opacity: 0, clipPath: 'inset(32% 0% 41% 0%)', filter: 'drop-shadow(-34px 0 rgba(255,0,70,.9)) drop-shadow(34px 0 rgba(0,210,255,.9))' },
      { x: 0, skewX: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', filter: 'drop-shadow(0px 0 rgba(255,0,70,0)) drop-shadow(0px 0 rgba(0,210,255,0))', duration: D, ease: 'steps(11)' },
      at,
    );
    tl.set(e.img, { filter: 'none', clipPath: 'none' }, at + D);
  },
  // tees 04: echoes converge into the body
  ghostEcho(tl, e, at, D) {
    tl.fromTo(
      e.img,
      { x: -140, opacity: 0, filter: 'drop-shadow(90px 0 rgba(215,255,233,.4)) drop-shadow(180px 0 rgba(215,255,233,.2)) blur(4px)' },
      { x: 0, opacity: 1, filter: 'drop-shadow(0px 0 rgba(215,255,233,0)) drop-shadow(0px 0 rgba(215,255,233,0)) blur(0px)', duration: D, ease: 'power3.out' },
      at,
    );
    tl.set(e.img, { filter: 'none' }, at + D);
  },
  // shoes 01: spins in from the left across the viewport
  spinAcross(tl, e, at, D) {
    tl.fromTo(e.img, { xPercent: -150, rotationY: -400, rotation: -18, scale: 0.55, z: -300 }, { xPercent: 0, rotationY: 0, rotation: 0, scale: 1, z: 0, duration: D, ease: 'power3.out' }, at);
  },
  // shoes 02: dropped from above, bounces on the floor
  dropBounce(tl, e, at, D) {
    tl.fromTo(e.img, { yPercent: -170, rotation: -28, rotationX: 50 }, { yPercent: 0, rotation: 0, rotationX: 0, duration: D, ease: 'bounce.out' }, at);
    tl.fromTo(e.reflect, { opacity: 0 }, { opacity: 1, duration: D * 0.4 }, at + D * 0.5);
  },
  // shoes 03: emerges from darkness, a light blade passes over
  lightSweep(tl, e, at, D) {
    tl.fromTo(e.img, { filter: 'brightness(0) contrast(1.6)', rotationX: 26, scale: 0.92 }, { filter: 'brightness(1) contrast(1)', rotationX: 0, scale: 1, duration: D, ease: 'power2.inOut' }, at);
    tl.fromTo(e.fx, { xPercent: -140, opacity: 1 }, { xPercent: 140, opacity: 1, duration: D * 0.9, ease: 'power2.inOut' }, at + D * 0.1);
    tl.set(e.img, { filter: 'none' }, at + D);
    tl.set(e.fx, { opacity: 0 }, at + D);
  },
  // shoes 04: drifts in sideways and catches itself
  drift(tl, e, at, D) {
    tl.fromTo(e.img, { xPercent: 160, rotation: 16, skewX: -16, rotationY: 40 }, { xPercent: -7, rotation: -7, skewX: 4, rotationY: -10, duration: D * 0.7, ease: 'power3.out' }, at);
    ft(tl, e.img, { xPercent: -7, rotation: -7, skewX: 4, rotationY: -10 }, { xPercent: 0, rotation: 0, skewX: 0, rotationY: 0, duration: D * 0.3, ease: 'power2.inOut' }, at + D * 0.7);
    tl.fromTo(e.fx, { opacity: 0, xPercent: 40 }, { opacity: 0.9, xPercent: 0, duration: D * 0.4 }, at);
    ft(tl, e.fx, { opacity: 0.9 }, { opacity: 0, duration: D * 0.4 }, at + D * 0.55);
  },
  // jewelry 01: swings down like a pendulum
  pendulum(tl, e, at, D) {
    tl.fromTo(e.img, { yPercent: -120, rotation: -75, transformOrigin: '50% -10%' }, { yPercent: 0, rotation: 0, duration: D, ease: 'elastic.out(1, 0.38)' }, at);
  },
  // jewelry 02: flips like a coin from edge-on
  coinFlip(tl, e, at, D) {
    tl.fromTo(e.img, { rotationY: -630, scale: 0.5, yPercent: 40, opacity: 0 }, { rotationY: 0, scale: 1, yPercent: 0, opacity: 1, duration: D, ease: 'power3.out' }, at);
  },
  // jewelry 03: from a distant point, spinning
  farSpin(tl, e, at, D) {
    tl.fromTo(e.img, { scale: 0.04, rotation: -560, opacity: 0, filter: 'brightness(3)' }, { scale: 1, rotation: 0, opacity: 1, filter: 'brightness(1)', duration: D, ease: 'expo.out' }, at);
    tl.set(e.img, { filter: 'none' }, at + D);
  },
  // jewelry 04: tossed in on an arc
  toss(tl, e, at, D) {
    tl.fromTo(e.img, { xPercent: -140 }, { xPercent: 0, duration: D, ease: 'power1.out' }, at);
    tl.fromTo(e.img, { yPercent: 140, rotation: -220 }, { yPercent: 0, rotation: 0, duration: D, ease: 'back.out(1.6)' }, at);
  },
  // shades: sweep in at an angle like a visor snapping down, turn into place,
  // then a chrome glint races across the frame and the lens flashes
  visor(tl, e, at, D) {
    tl.fromTo(
      e.img,
      { xPercent: 120, yPercent: -18, rotationY: -75, rotation: 9, scale: 0.78, filter: 'blur(10px) brightness(0.5)' },
      { xPercent: 0, yPercent: 0, rotationY: 0, rotation: 0, scale: 1, filter: 'blur(0px) brightness(1)', duration: D * 0.7, ease: 'expo.out' },
      at,
    );
    tl.fromTo(e.fx, { xPercent: -130, opacity: 1 }, { xPercent: 130, opacity: 1, duration: D * 0.45, ease: 'power2.inOut' }, at + D * 0.5);
    tl.fromTo(e.img, { filter: 'brightness(1)' }, { filter: 'brightness(1.45)', duration: D * 0.12, ease: 'power2.out', yoyo: true, repeat: 1, immediateRender: false }, at + D * 0.72);
    tl.set(e.img, { filter: 'none' }, at + D);
    tl.set(e.fx, { opacity: 0 }, at + D);
  },
  fadeIn(tl, e, at, D) {
    tl.fromTo(e.img, { opacity: 0 }, { opacity: 1, duration: D }, at);
  },
};

/* ─── EXIT ──────────────────────────────────────────────────────────────── */

export const EXIT = {
  slideOutLeft(tl, e, at, D) {
    ft(tl, e.img, { filter: NOBLUR }, { xPercent: -150, rotation: -14, filter: 'blur(14px)', duration: D, ease: 'power2.in' }, at);
  },
  scaleThrough(tl, e, at, D) {
    ft(tl, e.img, { filter: NOBLUR, opacity: 1 }, { scale: 2.8, opacity: 0, filter: 'blur(24px)', duration: D, ease: 'power2.in' }, at);
  },
  whoosh(tl, e, at, D) {
    const proxy = { b: 0 };
    tl.set(e.img, { filter: `url(#${e.mbId})` }, at);
    ft(tl, e.img, { xPercent: 0 }, { xPercent: 190, skewX: 30, scaleX: 1.6, duration: D, ease: 'expo.in' }, at);
    tl.fromTo(proxy, { b: 0 }, { b: 110, duration: D, ease: 'expo.in', immediateRender: false, onUpdate: () => e.mb?.setAttribute('stdDeviation', `${proxy.b.toFixed(1)} 0`) }, at);
  },
  drop(tl, e, at, D) {
    ft(tl, e.img, { yPercent: 0 }, { yPercent: 140, rotation: 9, duration: D, ease: 'power3.in' }, at);
  },
  slideUp(tl, e, at, D) {
    ft(tl, e.img, { yPercent: 0, filter: NOBLUR }, { yPercent: -140, scale: 0.9, filter: 'blur(10px)', duration: D, ease: 'power3.in' }, at);
  },
  sliceOut(tl, e, at, D) {
    const pr = { p: 1 };
    tl.fromTo(pr, { p: 1 }, { p: 0, duration: D, ease: 'none', immediateRender: false, onUpdate: () => (e.img.style.clipPath = staircase(pr.p, 9, true)) }, at);
    ft(tl, e.img, { xPercent: 0 }, { xPercent: 14, duration: D, ease: 'power2.in' }, at);
  },
  glitchOut(tl, e, at, D) {
    ft(
      tl,
      e.img,
      { x: 0, opacity: 1, filter: 'drop-shadow(0px 0 rgba(255,0,70,0)) drop-shadow(0px 0 rgba(0,210,255,0))', clipPath: 'inset(0% 0% 0% 0%)' },
      { x: -80, skewX: -20, opacity: 0, filter: 'drop-shadow(-40px 0 rgba(255,0,70,.9)) drop-shadow(40px 0 rgba(0,210,255,.9))', clipPath: 'inset(45% 0% 38% 0%)', duration: D, ease: 'steps(9)' },
      at,
    );
  },
  fadeDissolve(tl, e, at, D) {
    ft(tl, e.img, { opacity: 1, filter: 'blur(0px) brightness(1)' }, { opacity: 0, scale: 1.08, filter: 'blur(18px) brightness(2.2)', duration: D, ease: 'power2.in' }, at);
  },
  spinOut(tl, e, at, D) {
    ft(tl, e.img, { xPercent: 0, rotationY: 0 }, { xPercent: 170, rotationY: 380, rotation: 14, scale: 0.6, duration: D, ease: 'power3.in' }, at);
  },
  flipUp(tl, e, at, D) {
    ft(tl, e.img, { yPercent: 0, rotationX: 0 }, { yPercent: -160, rotationX: -80, rotation: 10, duration: D, ease: 'power3.in' }, at);
    ft(tl, e.reflect, { opacity: 1 }, { opacity: 0, duration: D * 0.3 }, at);
  },
  intoDark(tl, e, at, D) {
    ft(tl, e.img, { filter: 'brightness(1)' }, { filter: 'brightness(0)', scale: 0.86, rotationX: -20, duration: D, ease: 'power2.in' }, at);
  },
  driftOut(tl, e, at, D) {
    ft(tl, e.img, { xPercent: 0 }, { xPercent: -190, rotation: -12, skewX: 22, rotationY: -30, duration: D, ease: 'power3.in' }, at);
  },
  liftUp(tl, e, at, D) {
    ft(tl, e.img, { yPercent: 0, rotation: 0 }, { yPercent: -150, rotation: 24, duration: D, ease: 'back.in(1.4)' }, at);
  },
  coinOut(tl, e, at, D) {
    ft(tl, e.img, { rotationY: 0, opacity: 1 }, { rotationY: 450, scale: 0.4, opacity: 0, duration: D, ease: 'power3.in' }, at);
  },
  zoomPast(tl, e, at, D) {
    ft(tl, e.img, { scale: 1, opacity: 1, filter: NOBLUR }, { scale: 4.2, opacity: 0, filter: 'blur(26px)', duration: D, ease: 'power3.in' }, at);
  },
  tossOut(tl, e, at, D) {
    ft(tl, e.img, { xPercent: 0 }, { xPercent: 150, duration: D, ease: 'power1.in' }, at);
    ft(tl, e.img, { yPercent: 0, rotation: 0 }, { yPercent: -140, rotation: 240, duration: D, ease: 'power3.in' }, at);
  },
  visorOut(tl, e, at, D) {
    ft(tl, e.img, { xPercent: 0, rotationY: 0, filter: 'brightness(1)' }, { xPercent: -140, yPercent: 10, rotationY: 70, rotation: -8, scale: 0.8, filter: 'brightness(2.2)', duration: D, ease: 'power3.in' }, at);
  },
  fadeOut(tl, e, at, D) {
    ft(tl, e.img, { opacity: 1 }, { opacity: 0, duration: D }, at);
  },
};

/* ─── HOLD — never fully static while on stage ──────────────────────────── */

export function hold(tl, e, at, D, type) {
  if (type === 'shades') {
    ft(tl, e.img, { rotationY: 0, rotation: 0, y: 0 }, { rotationY: -14, rotation: 2, y: -14, duration: D, ease: 'sine.inOut' }, at);
  } else if (type === 'shoe') {
    ft(tl, e.img, { rotationY: 0, rotation: 0, y: 0 }, { rotationY: -16, rotation: -3, y: -18, duration: D, ease: 'sine.inOut' }, at);
  } else if (type === 'jewelry') {
    ft(tl, e.img, { rotationY: 0, y: 0 }, { rotationY: 22, y: -14, duration: D, ease: 'sine.inOut' }, at);
  } else {
    ft(tl, e.img, { y: 0, scale: 1 }, { y: -18, scale: 1.035, duration: D, ease: 'sine.inOut' }, at);
  }
}

/* ─── TEXT ──────────────────────────────────────────────────────────────── */

export const TEXT_IN = {
  split(tl, e, at, D) {
    const n = e.chars.length;
    tl.fromTo(e.chars, { x: (i) => (i - n / 2) * 46, opacity: 0, filter: 'blur(8px)' }, { x: 0, opacity: 1, filter: NOBLUR, duration: D, ease: 'expo.out', stagger: { each: 0.012, from: 'center' } }, at);
  },
  slide(tl, e, at, D) {
    tl.fromTo(e.chars, { yPercent: 118 }, { yPercent: 0, duration: D, ease: 'power4.out', stagger: 0.022 }, at);
  },
  stretch(tl, e, at, D) {
    tl.fromTo(e.chars, { scaleX: 4, scaleY: 0.35, opacity: 0, transformOrigin: '0% 60%' }, { scaleX: 1, scaleY: 1, opacity: 1, duration: D, ease: 'expo.out', stagger: 0.02 }, at);
  },
  blur(tl, e, at, D) {
    tl.fromTo(e.chars, { opacity: 0, filter: 'blur(14px)', y: 26 }, { opacity: 1, filter: NOBLUR, y: 0, duration: D, ease: 'power3.out', stagger: { each: 0.02, from: 'random' } }, at);
  },
  scramble(tl, e, at, D) {
    const pr = { p: 0 };
    tl.fromTo(e.chars, { opacity: 0 }, { opacity: 1, duration: 0.05 }, at);
    tl.fromTo(pr, { p: 0 }, { p: 1, duration: D, ease: 'none', onUpdate: () => scrambleTo(e.chars, pr.p) }, at);
  },
};

export function textOut(tl, e, at, D, kind) {
  const c = e.chars;
  if (kind === 'split') ft(tl, c, { x: 0, opacity: 1 }, { x: (i) => (i - c.length / 2) * -60, opacity: 0, duration: D, ease: 'power2.in', stagger: { each: 0.01, from: 'edges' } }, at);
  else if (kind === 'slide') ft(tl, c, { yPercent: 0 }, { yPercent: -118, duration: D, ease: 'power3.in', stagger: 0.015 }, at);
  else if (kind === 'stretch') ft(tl, c, { scaleX: 1, opacity: 1 }, { scaleX: 4, scaleY: 0.3, opacity: 0, transformOrigin: '100% 60%', duration: D, ease: 'power3.in', stagger: 0.015 }, at);
  else if (kind === 'scramble') {
    const pr = { p: 1 };
    tl.fromTo(pr, { p: 1 }, { p: 0.001, duration: D, ease: 'none', immediateRender: false, onUpdate: () => scrambleTo(c, pr.p) }, at);
    ft(tl, c, { opacity: 1 }, { opacity: 0, duration: 0.05 }, at + D);
  } else ft(tl, c, { opacity: 1, filter: NOBLUR }, { opacity: 0, filter: 'blur(14px)', y: -20, duration: D, ease: 'power2.in', stagger: { each: 0.015, from: 'random' } }, at);
}

/** Supporting info: rank, counter, specs (typed reveal), price, CTA, ghost numeral, kanji. */
export function metaIn(tl, e, at, dir) {
  tl.fromTo([e.rank, e.count], { opacity: 0, x: -24 * dir }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out' }, at);
  tl.fromTo(e.specs, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.4, stagger: 0.07, ease: 'power2.out' }, at + 0.08);
  tl.fromTo(e.price, { opacity: 0, y: 18, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: NOBLUR, duration: 0.4, ease: 'power3.out' }, at + 0.18);
  tl.fromTo(e.cta, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, at + 0.26);
  tl.fromTo(e.ghost, { opacity: 0, xPercent: 30 * dir }, { opacity: 1, xPercent: 0, duration: 0.9, ease: 'power2.out' }, at - 0.4);
  tl.fromTo(e.jp, { opacity: 0, yPercent: 40 }, { opacity: 1, yPercent: 0, duration: 0.8, ease: 'power2.out' }, at - 0.3);
}

export function metaOut(tl, e, at, dir) {
  ft(tl, [e.rank, e.count, ...e.specs, e.price, e.cta], { opacity: 1, y: 0 }, { opacity: 0, y: -16, duration: 0.3, stagger: 0.025, ease: 'power2.in' }, at);
  ft(tl, e.ghost, { opacity: 1, xPercent: 0 }, { opacity: 0, xPercent: -30 * dir, duration: 0.7, ease: 'power2.in' }, at);
  ft(tl, e.jp, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: -40, duration: 0.6, ease: 'power2.in' }, at);
}
