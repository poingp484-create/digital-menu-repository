/** Elements with [data-magnetic] lean toward the cursor. */
import gsap from 'gsap';
import { device } from '../core/device.js';

export function magnetize(root = document) {
  if (device.touch) return;
  root.querySelectorAll('[data-magnetic]:not([data-mag-bound])').forEach((el) => {
    el.dataset.magBound = '1';
    const strength = parseFloat(el.dataset.magnetic) || 0.35;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}
