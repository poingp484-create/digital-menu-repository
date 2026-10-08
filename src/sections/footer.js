/** 09 — FOOTER. Extremely minimal: the mark, four links, the end credits. */
import { gsap } from '../core/scroll.js';
import { logoHTML } from '../brand/logo.js';
import { state } from '../core/state.js';
import { scrollTo } from '../core/scroll.js';

const LINKS = [
  { label: 'SHOP', action: 'index' },
  { label: 'INSTAGRAM', href: 'https://instagram.com/' },
  { label: 'CONTACT', action: 'contact' },
  { label: 'TERMS', action: 'terms' },
];

export function renderFooter(el) {
  el.innerHTML = `
    <div class="fo__logo" aria-hidden="true">${logoHTML()}</div>
    <nav class="fo__links" aria-label="Footer">
      ${LINKS.map((l) => `<a href="${l.href || '#'}" ${l.action ? `data-action="${l.action}"` : 'target="_blank" rel="noopener"'} data-cursor="link" data-magnetic=".3"><span>[</span>${l.label}<span>]</span></a>`).join('')}
    </nav>
    <div class="fo__base">
      <span>© 2026 YAKUZA — BUILT AFTER MIDNIGHT</span>
      <span>TOKYO — MUMBAI — NEW YORK</span>
      <button type="button" class="fo__top" data-cursor="link">BACK TO START ↑</button>
    </div>`;
}

export function buildFooter(el, { onIndex, onTerms, onContact }) {
  el.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (a) {
      e.preventDefault();
      if (a.dataset.action === 'index') onIndex();
      if (a.dataset.action === 'terms') onTerms();
      if (a.dataset.action === 'contact') onContact();
    }
    if (e.target.closest('.fo__top')) scrollTo(0, { duration: 3 });
  });
  const logo = el.querySelector('.fo__logo');
  gsap.fromTo(logo, { clipPath: 'inset(0% 100% 0% 0%)', filter: 'blur(10px)' }, { clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 20%', scrub: 0.8 } });
  gsap.fromTo(el.querySelectorAll('.fo__links a, .fo__base > *'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: el, start: 'top 60%', end: 'top 10%', scrub: 0.8 } });
  return {
    tick() {
      logo.style.setProperty('--sx', `${((state.mouse.nx + 1) * 50).toFixed(1)}%`);
    },
  };
}
