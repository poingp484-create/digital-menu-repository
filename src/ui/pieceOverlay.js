/** "ENTER PIECE" — full-screen product scene with sizes + add to bag. */
import gsap from 'gsap';
import { findProduct } from '../data/products.js';
import { productVisual } from '../art/renders.js';
import { formatPrice, addToBag } from './store.js';
import { stopScroll, startScroll } from '../core/scroll.js';
import { state } from '../core/state.js';
import { magnetize } from './magnetic.js';
import { toast } from './toast.js';
import { splitChars } from '../core/split.js';
import { play } from './sound.js';

const SIZES = {
  jacket: ['S', 'M', 'L', 'XL', 'XXL'],
  tee: ['S', 'M', 'L', 'XL', 'XXL'],
  pants: ['28', '30', '32', '34', '36'],
  cap: ['ONE SIZE — ADJUSTABLE'],
  hat: ['S / M', 'L / XL'],
  shades: ['ONE SIZE'],
  shoe: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
  chain: ['50 CM', '60 CM'],
  cross: ['ONE SIZE'],
  signet: ['7', '8', '9', '10', '11', '12'],
  dogtag: ['ONE SIZE'],
};
const sizesFor = (p) => SIZES[p.art.type] || SIZES[p.art.variant] || ['ONE SIZE'];

export function initPieceOverlay() {
  const el = document.getElementById('pieceOverlay');
  let open = false;
  let current = null;
  let lastFocus = null;
  let raf = 0;

  function render(p) {
    const sizes = sizesFor(p);
    el.dataset.type = p.art.type;
    el.innerHTML = `
      <div class="po__bg"></div>
      <div class="po__lines" aria-hidden="true"></div>
      <div class="po__ghost" aria-hidden="true">${p.jp}</div>
      <div class="po__media"><div class="po__tilt">${productVisual(p, { eager: true })}</div></div>
      <div class="po__info">
        <div class="po__rank">BLACKLIST <b>#${String(p.rank).padStart(2, '0')}</b> <span>${p.category.toUpperCase()}</span></div>
        <h2 class="po__name"><span class="n1">${p.name[0]}</span><span class="n2">${p.name[1]}</span></h2>
        <div class="po__price" data-price="${p.id}">${formatPrice(p.price)}</div>
        <p class="po__desc">${p.description}</p>
        <ul class="po__specs">${p.specs.map((s) => `<li>${s}</li>`).join('')}</ul>
        <fieldset class="po__sizes"><legend>SIZE</legend>
          ${sizes.map((s, i) => `<label data-cursor="link" data-sfx="tick"><input type="radio" name="size" value="${s}" ${sizes.length === 1 && i === 0 ? 'checked' : ''}/><span>${s}</span></label>`).join('')}
        </fieldset>
        <button class="btn btn--solid po__add" type="button" data-sfx="none" data-magnetic=".25" data-cursor="link"><span>ADD TO BAG</span><i>→</i></button>
        <div class="po__meta"><span>FREE EXPRESS OVER ₹15,000</span><span>SHIPS IN 48H — TOKYO / MUMBAI / NYC</span></div>
      </div>
      <button class="po__close" type="button" data-sfx="back" data-cursor="link" aria-label="Close">[ ESC ]</button>`;

    el.querySelector('.po__close').addEventListener('click', close);
    el.querySelector('.po__add').addEventListener('click', () => {
      const size = el.querySelector('input[name=size]:checked');
      if (!size) {
        el.querySelector('.po__sizes').classList.remove('shake');
        void el.offsetWidth;
        el.querySelector('.po__sizes').classList.add('shake');
        toast('SELECT A SIZE FIRST');
        play('error');
        return;
      }
      play('confirm');
      addToBag(p.id, size.value);
      toast(`${p.name.join(' ')} — ${size.value} — ADDED TO BAG`);
    });
    magnetize(el);
  }

  function tilt() {
    const t = el.querySelector('.po__tilt');
    if (!t) return;
    const { nx, ny } = state.mouse;
    const k = el.dataset.type === 'shoe' ? 16 : el.dataset.type === 'jewelry' ? 20 : 8;
    t.style.transform = `perspective(1400px) rotateY(${nx * k}deg) rotateX(${-ny * k * 0.6}deg) translate3d(${nx * -14}px, ${ny * -10}px, 0)`;
    raf = requestAnimationFrame(tilt);
  }

  function show(id, origin) {
    const p = findProduct(id);
    if (!p || open) return;
    current = p;
    open = true;
    lastFocus = document.activeElement;
    render(p);
    el.setAttribute('aria-hidden', 'false');
    el.classList.add('is-open');
    document.documentElement.classList.add('overlay-open');
    stopScroll();

    const x = origin ? origin.x : window.innerWidth / 2;
    const y = origin ? origin.y : window.innerHeight / 2;
    const name = el.querySelectorAll('.po__name .n1, .po__name .n2');
    const chars = [...name].flatMap((n) => splitChars(n));
    gsap.timeline()
      .fromTo(el, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(150vmax at ${x}px ${y}px)`, duration: 0.9, ease: 'expo.inOut' })
      .from(el.querySelector('.po__media'), { scale: 1.25, xPercent: -8, filter: 'blur(16px)', duration: 1.1, ease: 'expo.out' }, 0.25)
      .from(chars, { yPercent: 110, opacity: 0, duration: 0.7, stagger: 0.015, ease: 'power4.out' }, 0.45)
      .from(el.querySelectorAll('.po__rank, .po__price, .po__desc, .po__specs li, .po__sizes, .po__add, .po__meta'), { y: 24, opacity: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out' }, 0.55)
      .from(el.querySelector('.po__ghost'), { xPercent: 20, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0.3);
    raf = requestAnimationFrame(tilt);
    setTimeout(() => el.querySelector('.po__close')?.focus({ preventScroll: true }), 50);
  }

  function close() {
    if (!open) return;
    open = false;
    cancelAnimationFrame(raf);
    gsap.to(el, {
      clipPath: `circle(0px at ${window.innerWidth - 60}px 40px)`,
      duration: 0.7,
      ease: 'expo.inOut',
      onComplete: () => {
        el.classList.remove('is-open');
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = '';
        document.documentElement.classList.remove('overlay-open');
        startScroll();
        lastFocus?.focus?.({ preventScroll: true });
      },
    });
  }

  window.addEventListener('keydown', (e) => e.key === 'Escape' && open && (play('back'), close()));
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-enter]');
    if (!t) return;
    e.preventDefault();
    show(t.dataset.enter, { x: e.clientX, y: e.clientY });
  });

  return { show, close, get open() { return open; }, get current() { return current; } };
}
