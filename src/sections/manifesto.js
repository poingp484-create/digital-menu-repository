/** 02 — COLLECTION INTRO. A short, loud statement + the rules of the list. */
import { gsap, ScrollTrigger, scrollTo } from '../core/scroll.js';
import { splitChars, splitWords } from '../core/split.js';
import { ALL_PRODUCTS, CATEGORIES } from '../data/products.js';

export function renderManifesto(el) {
  el.innerHTML = `
    <div class="mf__marquee" aria-hidden="true"><div class="mf__track">${'YAKUZA ヤクザ '.repeat(6)}</div></div>
    <div class="mf__inner">
      <div class="mf__label"><span>02</span> THE BLACKLIST — DROP 01</div>
      <h2 class="mf__title">
        <span class="mf__line">${ALL_PRODUCTS.length} PIECES.</span>
        <span class="mf__line">${CATEGORIES.length} DISTRICTS.</span>
        <span class="mf__line mf__line--chrome">ONE CITY</span>
        <span class="mf__line">AFTER MIDNIGHT.</span>
      </h2>
      <p class="mf__copy">YAKUZA is streetwear for the after-hours city — chrome, leather and noise, cut for the ones who move fast and never stop for the lights. Every piece on this list carries a bounty. Climb it from #${ALL_PRODUCTS.length} to #01.</p>
      <ol class="mf__districts" aria-label="Districts">
        ${CATEGORIES.map(
          (c) => `<li><a href="#cat-${c.id}" data-cursor="link">
            <span class="mfd__img"><img src="${c.products[0].image}" alt="" loading="lazy" decoding="async" /></span>
            <span class="mfd__txt"><small>${c.index}</small><b>${c.title}</b><i>${c.products.length} PIECES</i></span>
          </a></li>`,
        ).join('')}
      </ol>
    </div>`;
}

export function buildManifesto(el) {
  const lines = [...el.querySelectorAll('.mf__line')];
  const lineChars = lines.map((l) => splitChars(l));
  const words = splitWords(el.querySelector('.mf__copy'));

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  lineChars.forEach((chars, i) => {
    tl.fromTo(chars, { yPercent: 120, rotation: 8, opacity: 0, filter: 'blur(10px)' }, { yPercent: 0, rotation: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.02, duration: 0.5, ease: 'power3.out' }, i * 0.22);
  });
  tl.fromTo(el.querySelector('.mf__label'), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.4 }, 0)
    .fromTo(words, { opacity: 0.08 }, { opacity: 1, stagger: 0.02, duration: 0.2 }, 0.7)
    .fromTo(el.querySelectorAll('.mf__districts li'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.3, ease: 'power3.out' }, 1.0)
    .addLabel('shown')
    .to({}, { duration: 0.6 })
    .to(el.querySelector('.mf__inner'), { yPercent: -10, opacity: 0, filter: 'blur(8px)', duration: 0.5, ease: 'power2.in' });

  // reveal starts while the section is still rising into view, then holds under the pin
  ScrollTrigger.create({ trigger: el, start: 'top top', end: '+=160%', pin: true });
  const reveal = ScrollTrigger.create({ trigger: el, start: 'top 70%', end: () => `+=${window.innerHeight * (0.7 + 1.6)}`, scrub: 0.8, animation: tl, invalidateOnRefresh: true });

  el.querySelectorAll('.mf__districts a').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      scrollTo(a.getAttribute('href'));
    }),
  );
  /** Scroll position where everything in this section is fully visible. */
  return { target: () => reveal.start + (reveal.end - reveal.start) * ((tl.labels.shown + 0.25) / tl.duration()) };
  gsap.fromTo(el.querySelector('.mf__track'), { xPercent: 0 }, { xPercent: -40, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom+=160% top', scrub: true } });
}
