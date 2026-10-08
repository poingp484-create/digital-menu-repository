/** 08 — BRAND STATEMENT. Three lines, one at a time, in the fog. */
import { gsap, ScrollTrigger } from '../core/scroll.js';
import { splitChars } from '../core/split.js';

const LINES = ['BUILT AFTER MIDNIGHT.', 'WORN AT FULL SPEED.', 'WANTED IN EVERY CITY.'];

export function renderStatement(el) {
  el.innerHTML = `
    <div class="st__jp" aria-hidden="true">真夜中に生まれた</div>
    <div class="st__lines">${LINES.map((l, i) => `<p class="st__line st__line--${i}">${l}</p>`).join('')}</div>
    <div class="st__sig">— YAKUZA, 2026</div>`;
}

export function buildStatement(el) {
  const lines = [...el.querySelectorAll('.st__line')];
  const chars = lines.map((l) => splitChars(l));
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  chars.forEach((c, i) => {
    const at = i * 1.1;
    tl.fromTo(c, { opacity: 0, filter: 'blur(18px)', x: (k) => (k - c.length / 2) * 14 }, { opacity: 1, filter: 'blur(0px)', x: 0, stagger: 0.015, duration: 0.6, ease: 'power3.out' }, at);
    if (i < chars.length - 1) tl.to(lines[i], { opacity: 0.12, scale: 0.92, filter: 'blur(3px)', duration: 0.5 }, at + 0.9);
  });
  tl.fromTo(el.querySelector('.st__sig'), { opacity: 0, letterSpacing: '1em' }, { opacity: 1, letterSpacing: '0.4em', duration: 0.6 }, 2.6)
    .fromTo(el.querySelector('.st__jp'), { opacity: 0, yPercent: 20 }, { opacity: 1, yPercent: -10, duration: 3.2 }, 0)
    .to({}, { duration: 0.5 });
  ScrollTrigger.create({ trigger: el, start: 'top top', end: '+=220%', pin: true, scrub: 0.8, animation: tl });
}
