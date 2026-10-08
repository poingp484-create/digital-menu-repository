/**
 * Shared, mutable runtime state. Written by input/scroll handlers,
 * read every frame by WebGL + UI. Plain object on purpose (no reactivity cost).
 */
export const state = {
  time: 0,
  mouse: {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    // normalised -1..1, smoothed
    nx: 0,
    ny: 0,
    // raw normalised target
    tx: 0,
    ty: 0,
    // movement energy 0..1 (drives cursor ripples)
    energy: 0,
    active: false,
  },
  scroll: { y: 0, velocity: 0, speed: 0 },
  hero: { progress: 0, intro: 0 },
  theme: 'hero',
  /** Extra env controls sections may drive (lerped in stage). */
  env: { heatBoost: 0, brightBoost: 0, streakBoost: 0 },
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function onMove(x, y) {
  const m = state.mouse;
  const dx = x - m.x;
  const dy = y - m.y;
  m.x = x;
  m.y = y;
  m.tx = (x / window.innerWidth) * 2 - 1;
  m.ty = (y / window.innerHeight) * 2 - 1;
  m.energy = clamp(m.energy + Math.hypot(dx, dy) / 600, 0, 1);
  m.active = true;
}

window.addEventListener('pointermove', (e) => onMove(e.clientX, e.clientY), { passive: true });
window.addEventListener('touchmove', (e) => e.touches[0] && onMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

/** Per-frame smoothing; called from the main ticker. */
export function tickState(dt) {
  const m = state.mouse;
  const k = 1 - Math.pow(0.0009, dt); // frame-rate independent lerp
  m.nx += (m.tx - m.nx) * k;
  m.ny += (m.ty - m.ny) * k;
  m.energy *= Math.pow(0.18, dt);
  const s = state.scroll;
  s.speed += (Math.min(Math.abs(s.velocity) / 45, 1.4) - s.speed) * (1 - Math.pow(0.02, dt));
}
