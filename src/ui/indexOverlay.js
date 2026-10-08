/**
 * SHOP — the Blacklist index. A typographic list of every piece (no grid);
 * hovering a row floats its render beside the cursor.
 */
import { ALL_PRODUCTS } from '../data/products.js';
import { productVisual } from '../art/renders.js';
import { formatPrice } from './store.js';
import { stopScroll, startScroll } from '../core/scroll.js';
import { state } from '../core/state.js';

export function initIndexOverlay({ onPick }) {
  const el = document.getElementById('indexOverlay');
  const rows = [...ALL_PRODUCTS].sort((a, b) => a.rank - b.rank);
  el.innerHTML = `
    <div class="ix__head"><span>THE BLACKLIST</span><small>${rows.length} PIECES — DROP 01</small><button type="button" class="ix__close" data-sfx="back" data-cursor="link">[ CLOSE ]</button></div>
    <ol class="ix__list">
      ${rows
        .map(
          (p) => `<li><button type="button" class="ix__row" data-id="${p.id}" data-cursor="link">
            <span class="ix__rank">#${String(p.rank).padStart(2, '0')}</span>
            <span class="ix__name">${p.name.join(' ')}</span>
            <span class="ix__cat">${p.category}</span>
            <span class="ix__price" data-price="${p.id}">${formatPrice(p.price)}</span>
          </button></li>`,
        )
        .join('')}
    </ol>
    <div class="ix__peek" aria-hidden="true"></div>`;

  const peek = el.querySelector('.ix__peek');
  let raf = 0;
  let px = 0;
  let py = 0;
  const follow = () => {
    px += (state.mouse.x - px) * 0.14;
    py += (state.mouse.y - py) * 0.14;
    peek.style.transform = `translate3d(${px + 40}px, ${py - 140}px, 0) rotate(${(state.mouse.nx * 6).toFixed(2)}deg)`;
    raf = requestAnimationFrame(follow);
  };

  el.querySelectorAll('.ix__row').forEach((row) => {
    row.addEventListener('pointerenter', () => {
      const p = ALL_PRODUCTS.find((x) => x.id === row.dataset.id);
      peek.innerHTML = productVisual(p);
      peek.classList.add('on');
    });
    row.addEventListener('pointerleave', () => peek.classList.remove('on'));
    row.addEventListener('click', () => {
      close();
      onPick(row.dataset.id);
    });
  });
  el.querySelector('.ix__close').addEventListener('click', () => close());
  window.addEventListener('keydown', (e) => e.key === 'Escape' && el.classList.contains('is-open') && close());

  function open() {
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    stopScroll();
    px = state.mouse.x;
    py = state.mouse.y;
    raf = requestAnimationFrame(follow);
  }
  function close() {
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    cancelAnimationFrame(raf);
    startScroll();
  }
  return { open, close };
}
