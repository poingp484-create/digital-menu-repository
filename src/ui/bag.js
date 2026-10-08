/** Bag drawer — slanted panel from the right. */
import { findProduct } from '../data/products.js';
import { productVisual } from '../art/renders.js';
import { store, subscribe, setQty, bagTotal, formatAmount, formatPrice } from './store.js';
import { stopScroll, startScroll } from '../core/scroll.js';
import { toast } from './toast.js';

export function initBag() {
  const el = document.getElementById('bag');
  let isOpen = false;

  function render() {
    const lines = store.bag;
    el.innerHTML = `
      <div class="bag__scrim" data-close data-sfx="back"></div>
      <div class="bag__panel">
        <header class="bag__head"><span>BAG</span><small>${lines.reduce((n, l) => n + l.qty, 0)} PIECES</small><button type="button" data-close data-sfx="back" data-cursor="link" aria-label="Close bag">[ CLOSE ]</button></header>
        <div class="bag__lines">
          ${
            lines.length
              ? lines
                  .map((l, i) => {
                    const p = findProduct(l.id);
                    return `<div class="bag__line">
                      <div class="bag__thumb">${productVisual(p)}</div>
                      <div class="bag__txt"><b>${p.name.join(' ')}</b><span>${l.size} — #${String(p.rank).padStart(2, '0')}</span><span data-price="${p.id}">${formatPrice(p.price)}</span></div>
                      <div class="bag__qty"><button type="button" data-i="${i}" data-d="-1" data-sfx="tick" aria-label="Decrease">−</button><span>${l.qty}</span><button type="button" data-i="${i}" data-d="1" data-sfx="tick" aria-label="Increase">+</button></div>
                    </div>`;
                  })
                  .join('')
              : `<div class="bag__empty"><span>EMPTY</span><p>Nothing on you yet. The city is full of pieces worth running for.</p></div>`
          }
        </div>
        <footer class="bag__foot">
          <div class="bag__total"><span>SUBTOTAL</span><b>${formatAmount(bagTotal())}</b></div>
          <button class="btn btn--solid bag__checkout" type="button" ${lines.length ? '' : 'disabled'} data-cursor="link"><span>CHECKOUT</span><i>→</i></button>
          <small>TAXES + SHIPPING CALCULATED AT CHECKOUT</small>
        </footer>
      </div>`;
  }

  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return close();
    const q = e.target.closest('[data-d]');
    if (q) {
      const i = +q.dataset.i;
      setQty(i, store.bag[i].qty + +q.dataset.d);
    }
    if (e.target.closest('.bag__checkout')) toast('CHECKOUT IS NOT CONNECTED YET — HOOK UP YOUR PAYMENT PROVIDER');
  });

  function open() {
    render();
    isOpen = true;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    stopScroll();
  }
  function close() {
    isOpen = false;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    startScroll();
  }
  subscribe(() => isOpen && render());
  window.addEventListener('keydown', (e) => e.key === 'Escape' && isOpen && close());
  return { open, close };
}
