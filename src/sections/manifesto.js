/** 02 — COLLECTION INTRO. A short, loud statement + the rules of the list. */
import { gsap, ScrollTrigger } from '../core/scroll.js';
import { splitChars, splitWords } from '../core/split.js';
import { ALL_PRODUCTS } from '../data/products.js';

export function renderManifesto(el) {
  el.innerHTML = `
    <div class="mf__marquee" aria-hidden="true"><div class="mf__track">${'YAKUZA ヤクザ '.repeat(6)}</div></div>
    <div class="mf__inner">
      <div class="mf__label"><span>02</span> THE BLACKLIST — DROP 01</div>
      <h2 class="mf__title">
        <span class="mf__line">${ALL_PRODUCTS.length} PIECES.</span>
        <span class="mf__line">4 DISTRICTS.</span>
        <span class="mf__line mf__line--chrome">ONE CITY</span>
        <span class="mf__line">AFTER MIDNIGHT.</span>
      </h2>
      <p class="mf__copy">YAKUZA is streetwear for the after-hours city — chrome, leather and noise, cut for the ones who move fast and never stop for the lights. Every piece on this list carries a bounty. Climb it from #${ALL_PRODUCTS.length} to #01.</p>
      <ul class="mf__stats">
        <li><small>RANK</small><b>#${ALL_PRODUCTS.length} → #01</b></li>
        <li><small>STATUS</small><b class="blink">WANTED</b></li>
        <li><small>RESTOCK</small><b>NEVER</b></li>
      </ul>
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
    .fromTo(el.querySelectorAll('.mf__stats li'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.3 }, 1.2)
    .to({}, { duration: 0.4 })
    .to(el.querySelector('.mf__inner'), { yPercent: -10, opacity: 0, filter: 'blur(8px)', duration: 0.5, ease: 'power2.in' });

  // reveal starts while the section is still rising into view, then holds under the pin
  ScrollTrigger.create({ trigger: el, start: 'top top', end: '+=160%', pin: true });
  ScrollTrigger.create({ trigger: el, start: 'top 70%', end: () => `+=${window.innerHeight * (0.7 + 1.6)}`, scrub: 0.8, animation: tl, invalidateOnRefresh: true });
  gsap.fromTo(el.querySelector('.mf__track'), { xPercent: 0 }, { xPercent: -40, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom+=160% top', scrub: true } });
}
