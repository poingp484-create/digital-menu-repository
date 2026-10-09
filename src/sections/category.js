/**
 * 03–06 — Category scenes. Each category is ONE pinned stage; every product
 * becomes a full-viewport scene on a single scroll-scrubbed timeline, so the
 * previous piece is still leaving while the next one arrives.
 */
import { gsap, ScrollTrigger } from '../core/scroll.js';
import { device } from '../core/device.js';
import { state } from '../core/state.js';
import { splitChars } from '../core/split.js';
import { productVisual } from '../art/renders.js';
import { formatPrice } from '../ui/store.js';
import { ENTER, EXIT, TEXT_IN, textOut, metaIn, metaOut, hold } from './choreo.js';

const TILT = { jacket: 7, tee: 6, pants: 8, shoe: 16, kicks: 14, cap: 14, hat: 10, shades: 18, jewelry: 20 };
const FX = { lightSweep: 'sheen', visor: 'sheen', drift: 'speed' };

/** Extra views of a product (stacked, hidden) for the hover slideshow. */
function galleryHTML(p) {
  if (!p.gallery || p.gallery.length < 2) return '';
  const alt = `${p.name.join(' ')} — YAKUZA`;
  return p.gallery
    .slice(1)
    .map((src, k) => `<img class="render render--photo render--${p.art.type} render--alt" src="${src}" alt="${alt}, view ${k + 2}" loading="lazy" decoding="async" draggable="false" />`)
    .join('');
}

/**
 * Hover slideshow for products with a gallery: one view at a time; while the
 * cursor is on the product it switches view every few seconds (chrome glint
 * sweep + a quick turn). On touch screens it cycles while the scene is active.
 */
const SLIDE_EVERY = 2400;
function makeSlideshow(e) {
  const frames = [...e.img.querySelectorAll('.render')];
  const dots = [...e.media.querySelectorAll('.piece__dots i')];
  const glint = e.media.querySelector('.piece__glint');
  let cur = 0;
  let timer = 0;
  const show = (n) => {
    const prev = frames[cur];
    cur = (n + frames.length) % frames.length;
    const next = frames[cur];
    gsap.to(prev, { opacity: 0, xPercent: -10, rotationY: 28, duration: 0.55, ease: 'power2.in', overwrite: true });
    gsap.fromTo(
      next,
      { opacity: 0, xPercent: 12, rotationY: -32 },
      { opacity: 1, xPercent: 0, rotationY: 0, duration: 0.85, ease: 'expo.out', delay: 0.2, overwrite: true },
    );
    gsap.fromTo(glint, { xPercent: -130, opacity: 1 }, { xPercent: 130, opacity: 1, duration: 0.75, ease: 'power2.inOut', delay: 0.25, onComplete: () => gsap.set(glint, { opacity: 0 }) });
    dots.forEach((d, k) => d.classList.toggle('on', k === cur));
  };
  const start = () => {
    if (!timer) timer = setInterval(() => show(cur + 1), SLIDE_EVERY);
  };
  const stop = () => {
    clearInterval(timer);
    timer = 0;
  };
  if (!device.touch) {
    e.media.addEventListener('pointerenter', start);
    e.media.addEventListener('pointerleave', stop);
  }
  return { start, stop };
}

function pieceHTML(p, i, n) {
  const num = String(i + 1).padStart(2, '0');
  const fx = FX[p.enter] || '';
  return `
  <article class="piece piece--${p.art.type} layout-${p.layout} text-${p.text}" data-id="${p.id}" style="--tilt:${TILT[p.art.type]}deg" aria-label="${p.name.join(' ')}">
    <div class="piece__ghost" aria-hidden="true">${num}</div>
    <div class="piece__jp" aria-hidden="true">${p.jp}</div>
    ${p.enter === 'behindType' ? `<div class="piece__cover" aria-hidden="true"><span>${p.name[0]}</span><span>${p.name[1].split(' ')[0]}</span></div>` : ''}
    ${p.enter === 'motionBlur' || p.exit === 'whoosh' ? `<svg class="sr-defs" aria-hidden="true"><filter id="mb-${p.id}" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="0 0"/></filter></svg>` : ''}
    <div class="piece__media" data-cursor="view" data-enter="${p.id}" role="button" tabindex="-1" aria-label="View ${p.name.join(' ')}">
      <div class="piece__vel"><div class="piece__img">${productVisual(p)}${galleryHTML(p)}</div></div>
      ${p.gallery?.length > 1 ? `<div class="piece__glint" aria-hidden="true"></div><div class="piece__dots" aria-hidden="true">${p.gallery.map((_, k) => `<i class="${k ? '' : 'on'}"></i>`).join('')}</div>` : ''}
      ${p.art.type === 'shoe' ? '<div class="piece__floor" aria-hidden="true"></div>' : ''}
      <div class="piece__fx ${fx ? `fx--${fx}` : ''}" aria-hidden="true"></div>
    </div>
    <div class="piece__info">
      <div class="piece__rank"><span>BLACKLIST</span><b>#${String(p.rank).padStart(2, '0')}</b></div>
      <h3 class="piece__name" style="--chars:${p.name[0].length}"><span class="l1">${p.name[0]}</span><span class="l2">${p.name[1]}</span></h3>
      <div class="piece__count"><b>${num}</b><i>/</i>${String(n).padStart(2, '0')}</div>
      <ul class="piece__specs">${p.specs.map((s) => `<li>${s}</li>`).join('')}</ul>
      <div class="piece__price" data-price="${p.id}">${formatPrice(p.price)}</div>
      <button class="btn piece__cta" type="button" data-enter="${p.id}" data-magnetic=".35" data-cursor="link"><span>[ ENTER PIECE ]</span></button>
    </div>
  </article>`;
}

function categoryHTML(cat) {
  return `
  <section class="cat cat--${cat.id}" id="cat-${cat.id}" data-theme="${cat.theme}" data-label="${cat.index} — ${cat.title}" aria-label="${cat.title}">
    <div class="cat__title">
      <div class="ct__index">${cat.index}</div>
      <div class="ct__district">${cat.district}</div>
      <h2 class="ct__word" style="--chars:${cat.title.length}">${cat.title}</h2>
      <div class="ct__jp" aria-hidden="true">${cat.jp}</div>
      <p class="ct__blurb">${cat.blurb}</p>
    </div>
    ${cat.products.map((p, i) => pieceHTML(p, i, cat.products.length)).join('')}
    <div class="cat__ticks" aria-hidden="true">${cat.products.map((_, i) => `<i data-i="${i}">${String(i + 1).padStart(2, '0')}</i>`).join('')}</div>
  </section>`;
}

function parts(piece) {
  const nameEls = piece.querySelectorAll('.piece__name .l1, .piece__name .l2');
  const chars = [...nameEls].flatMap((el) => splitChars(el));
  const mbId = piece.querySelector('filter')?.id;
  return {
    piece,
    media: piece.querySelector('.piece__media'),
    vel: piece.querySelector('.piece__vel'),
    img: piece.querySelector('.piece__img'),
    fx: piece.querySelector('.piece__fx'),
    reflect: piece.querySelector('.piece__floor'),
    ghost: piece.querySelector('.piece__ghost'),
    jp: piece.querySelector('.piece__jp'),
    cover: piece.querySelector('.piece__cover'),
    chars,
    rank: piece.querySelector('.piece__rank'),
    count: piece.querySelector('.piece__count'),
    specs: [...piece.querySelectorAll('.piece__specs li')],
    price: piece.querySelector('.piece__price'),
    cta: piece.querySelector('.piece__cta'),
    mbId,
    mb: mbId ? piece.querySelector('feGaussianBlur') : null,
  };
}

/* Category title treatments: each district has its own identity. */
const TITLE_IN = {
  jackets: (c) => ({ from: { yPercent: (i) => (i % 2 ? 140 : -140), rotationX: 90, opacity: 0 }, to: { yPercent: 0, rotationX: 0, opacity: 1, stagger: 0.04, ease: 'power3.out' } }),
  tees: () => ({ from: { clipPath: 'inset(50% 0% 50% 0%)', scaleY: 2.4, yPercent: -8, opacity: 0.4 }, to: { clipPath: 'inset(0% 0% 0% 0%)', scaleY: 1, yPercent: 0, opacity: 1, stagger: { each: 0.05, from: 'center' }, ease: 'expo.out' } }),
  shoes: () => ({ from: { xPercent: 420, scaleX: 3.2, opacity: 0 }, to: { xPercent: 0, scaleX: 1, opacity: 1, stagger: 0.035, ease: 'expo.out' } }),
  denim: () => ({ from: { yPercent: -170, rotation: () => gsap.utils.random(-24, 24), opacity: 0 }, to: { yPercent: 0, rotation: 0, opacity: 1, stagger: 0.05, ease: 'back.out(1.6)' } }),
  headgear: () => ({ from: { yPercent: 130, scaleY: 0.2, opacity: 0, transformOrigin: '50% 100%' }, to: { yPercent: 0, scaleY: 1, opacity: 1, stagger: { each: 0.04, from: 'center' }, ease: 'expo.out' } }),
  jewelry: () => ({ from: { opacity: 0, filter: 'blur(20px)', letterSpacing: '0.5em', y: 30 }, to: { opacity: 1, filter: 'blur(0px)', letterSpacing: '0em', y: 0, stagger: 0.03, ease: 'power2.out' } }),
};
const TITLE_OUT = {
  headgear: { yPercent: -140, scaleY: 2.2, opacity: 0, stagger: { each: 0.03, from: 'edges' }, ease: 'power3.in' },
  denim: { y: () => window.innerHeight * 0.9, rotation: () => gsap.utils.random(-30, 30), opacity: 0, stagger: { each: 0.03, from: 'random' }, ease: 'power2.in' },
  jackets: { y: (i) => (i % 2 ? -1 : 1) * window.innerHeight, rotation: (i) => (i % 2 ? -18 : 18), opacity: 0, stagger: 0.02, ease: 'power2.in' },
  tees: { clipPath: 'inset(50% 0% 50% 0%)', scaleY: 2.2, opacity: 0, stagger: { each: 0.035, from: 'edges' }, ease: 'power3.in' },
  shoes: { xPercent: -520, scaleX: 3, opacity: 0, stagger: 0.025, ease: 'expo.in' },
  jewelry: { opacity: 0, filter: 'blur(24px)', scale: 1.4, stagger: { each: 0.02, from: 'center' }, ease: 'power2.in' },
};

export function renderCategories(root, categories) {
  root.innerHTML = categories.map(categoryHTML).join('');
}

/**
 * Build the scrubbed timeline for one category.
 * Returns helpers for nav/index (scroll position of each piece) + a per-frame tick.
 */
export function buildCategory(section, cat, { onPiece }) {
  const pieces = [...section.querySelectorAll('.piece')];
  const els = pieces.map(parts);
  const slideshows = els.map((e, i) => (cat.products[i].gallery?.length > 1 ? makeSlideshow(e) : null));
  const reduced = device.reduced;
  const E = 1;
  const H = 0.9;
  const X = 0.9;
  const O = 0.45;

  // ── title (enters while the section scrolls into view)
  const title = section.querySelector('.cat__title');
  const word = title.querySelector('.ct__word');
  const wChars = splitChars(word);
  // inner spans: the scroll-in animates the outer char, the pinned exit animates the inner one,
  // so the two scrubbed timelines never fight over the same properties
  const wInner = wChars.map((c) => {
    const i = document.createElement('span');
    i.className = 'ci';
    i.textContent = c.textContent;
    c.textContent = '';
    c.appendChild(i);
    return i;
  });
  const tIn = (TITLE_IN[cat.id] || TITLE_IN.jackets)();
  const titleTl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: device.touch ? 0.4 : 0.8 } });
  if (!reduced) {
    titleTl.fromTo(title.querySelectorAll('.ct__index, .ct__district, .ct__blurb'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, 0.3);
    titleTl.fromTo(title.querySelector('.ct__jp'), { opacity: 0, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.8 }, 0.2);
  }

  // ── main stage timeline
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  // the district word builds once the stage is pinned, so the whole transition plays in view
  // the district word builds as it rises into view (played, not scrubbed, so the
  // whole transition is seen even on a quick scroll); reverses when scrolling back up
  const TIN = 0;
  if (!reduced) {
    const titleIn = gsap.fromTo(wChars, tIn.from, { ...tIn.to, duration: 1.1, paused: true });
    ScrollTrigger.create({ trigger: section, start: 'top 55%', onEnter: () => titleIn.play(), onLeaveBack: () => titleIn.reverse() });
  }
  tl.fromTo(wInner, { opacity: 1 }, { ...TITLE_OUT[cat.id], duration: 0.9, immediateRender: false }, 0.05 + TIN);
  tl.fromTo(title, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -40, duration: 0.45, immediateRender: false }, 0.6 + TIN);

  const marks = [];
  let at = 0.55 + TIN;
  els.forEach((e, i) => {
    const p = cat.products[i];
    const dir = p.layout === 'right' ? -1 : 1;
    gsap.set(e.piece, { autoAlpha: 0 });
    tl.set(e.piece, { autoAlpha: 1 }, at);
    (ENTER[reduced ? 'fadeIn' : p.enter] || ENTER.fadeIn)(tl, e, at, E);
    (TEXT_IN[reduced ? 'blur' : p.text] || TEXT_IN.blur)(tl, e, at + 0.3, 0.75);
    metaIn(tl, e, at + 0.55, dir);
    if (!reduced) hold(tl, e, at + E, H, p.art.type);
    const exitAt = at + E + H;
    textOut(tl, e, exitAt - 0.1, 0.55, reduced ? 'blur' : p.text);
    metaOut(tl, e, exitAt - 0.15, dir);
    (EXIT[reduced ? 'fadeOut' : p.exit] || EXIT.fadeOut)(tl, e, exitAt, X);
    tl.set(e.piece, { autoAlpha: 0 }, exitAt + X);
    marks.push({ start: at, settle: at + E, exitAt, end: exitAt + X });
    at = exitAt + X - O;
  });
  tl.to({}, { duration: 0.15 }); // tail

  const total = tl.duration();
  const ticks = [...section.querySelectorAll('.cat__ticks i')];
  let active = -1;

  const st = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${total * window.innerHeight * (device.mobile ? 0.7 : 0.85)}`,
    pin: true,
    scrub: device.touch ? 0.5 : 0.9,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    animation: tl,
  });

  // active scene follows the (scrub-smoothed) timeline, not the raw scroll position
  tl.eventCallback('onUpdate', () => {
    const t = tl.time();
    let idx = -1;
    marks.forEach((m, i) => {
      if (t >= m.start + 0.4 && t < m.exitAt + 0.35) idx = i;
    });
    if (idx !== active) {
      active = idx;
      pieces.forEach((pc, i) => pc.classList.toggle('is-active', i === idx));
      slideshows.forEach((sl, i) => sl && (i === idx && device.touch ? sl.start() : i !== idx && sl.stop()));
      ticks.forEach((tk, i) => tk.classList.toggle('on', i === idx));
      if (idx < 0) els.forEach((e) => (e.vel.style.transform = ''));
      onPiece?.(idx >= 0 ? cat.products[idx] : null, idx, cat);
    }
  });

  // per-frame: cursor depth + velocity blur on the active scene only
  let mx = 0;
  let my = 0;
  const tick = (time) => {
    if (!st.isActive) return;
    const m = state.mouse;
    const tx = device.touch ? Math.sin(time * 0.6) * 0.35 : m.nx;
    const ty = device.touch ? Math.cos(time * 0.45) * 0.25 : m.ny;
    mx += (tx - mx) * 0.08;
    my += (ty - my) * 0.08;
    section.style.setProperty('--mx', mx.toFixed(4));
    section.style.setProperty('--my', my.toFixed(4));
    if (active >= 0 && device.tier !== 'low') {
      const v = Math.max(-1, Math.min(1, state.scroll.velocity / 60));
      // skew only: a per-frame blur filter on a large photo is too expensive
      els[active].vel.style.transform = `skewY(${(v * -3).toFixed(2)}deg)`;
    }
  };

  const posFor = (i) => {
    const m = marks[i];
    const tm = (m.settle + 0.3) / total;
    return st.start + (st.end - st.start) * tm;
  };

  return { st, tick, posFor, ids: cat.products.map((p) => p.id) };
}
