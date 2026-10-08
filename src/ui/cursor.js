/**
 * Custom cursor: a small chrome dot + a lagging ring.
 *  [data-cursor="view"]   → ring expands into a "VIEW PIECE" disc
 *  [data-cursor="link"]   → ring tightens, dot grows
 *  [data-cursor="drag"]   → label variant (data-cursor-label)
 */
import { state } from '../core/state.js';
import { device } from '../core/device.js';

export function initCursor() {
  const el = document.getElementById('cursor');
  if (device.touch) {
    el.remove();
    return () => {};
  }
  const ring = el.querySelector('.cursor__ring');
  const dot = el.querySelector('.cursor__dot');
  const label = document.getElementById('cursorLabel');
  document.documentElement.classList.add('has-cursor');

  let rx = state.mouse.x;
  let ry = state.mouse.y;
  let mode = '';

  const setMode = (m, text) => {
    if (m === mode && !text) return;
    mode = m;
    el.dataset.mode = m;
    if (text) label.innerHTML = text;
  };

  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor]');
    if (!t) return setMode('');
    const m = t.dataset.cursor;
    setMode(m, t.dataset.cursorLabel || (m === 'view' ? 'VIEW<br>PIECE' : ''));
  });
  document.addEventListener('pointerdown', () => el.classList.add('is-down'));
  document.addEventListener('pointerup', () => el.classList.remove('is-down'));
  document.addEventListener('mouseleave', () => el.classList.add('is-hidden'));
  document.addEventListener('mouseenter', () => el.classList.remove('is-hidden'));

  return function tick(dt) {
    const { x, y } = state.mouse;
    const k = 1 - Math.pow(0.0001, dt);
    rx += (x - rx) * k;
    ry += (y - ry) * k;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    const vx = x - rx;
    const vy = y - ry;
    const stretch = Math.min(Math.hypot(vx, vy) / 120, 0.35);
    const ang = Math.atan2(vy, vx);
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) rotate(${ang}rad) scale(${1 + stretch}, ${1 - stretch * 0.6}) rotate(${-ang}rad)`;
  };
}
