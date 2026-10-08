/**
 * Floating navigation — no bar, no box. A chrome mark top-left, a bracketed
 * vertical index on the left edge, utilities top-right. On mobile the index
 * collapses into a full-screen menu.
 */
import { logoHTML } from '../brand/logo.js';
import { CURRENCIES, store, setCurrency, subscribe, bagCount } from './store.js';
import { scrollTo } from '../core/scroll.js';
import { randomGlyph } from '../core/split.js';
import { magnetize } from './magnetic.js';
import { isSoundOn, setSound, onSoundChange } from './sound.js';

export const NAV_ITEMS = [
  { label: 'SHOP', action: 'index', key: 'shop' },
  { label: 'COLLECTION', href: '#collection', key: 'collection' },
  { label: 'JACKETS', href: '#cat-jackets', key: 'jackets' },
  { label: 'TEES', href: '#cat-tees', key: 'tees' },
  { label: 'SHOES', href: '#cat-shoes', key: 'shoes' },
  { label: 'JEWELRY', href: '#cat-jewelry', key: 'jewelry' },
];

function scramble(el) {
  const text = el.dataset.text;
  let frame = 0;
  cancelAnimationFrame(el._raf);
  const run = () => {
    frame++;
    el.textContent = [...text].map((ch, i) => (i < frame / 2 ? ch : randomGlyph())).join('');
    if (frame / 2 < text.length) el._raf = requestAnimationFrame(run);
    else el.textContent = text;
  };
  run();
}

export function initNav({ onIndex, onBag }) {
  const nav = document.getElementById('nav');
  nav.innerHTML = `
    <a class="nav__logo" href="#intro" data-cursor="link" aria-label="YAKUZA — back to start">${logoHTML()}</a>
    <nav class="nav__index" aria-label="Primary">
      <ol>
        ${NAV_ITEMS.map(
          (it, i) => `<li><a href="${it.href || '#'}" data-key="${it.key}" ${it.action ? `data-action="${it.action}"` : ''} data-cursor="link">
            <span class="nav__num">0${i + 1}</span><span class="nav__br">[</span><span class="nav__txt" data-text="${it.label}">${it.label}</span><span class="nav__br">]</span>
          </a></li>`,
        ).join('')}
      </ol>
    </nav>
    <div class="nav__utils">
      <div class="nav__cur" role="group" aria-label="Currency">
        ${CURRENCIES.map((c) => `<button type="button" data-sfx="tick" data-cur="${c.code}" data-cursor="link" aria-label="${c.code}">${c.symbol}</button>`).join('<i>/</i>')}
      </div>
      <button class="nav__snd" type="button" data-sfx="none" data-cursor="link" aria-pressed="true" aria-label="Toggle sound"><i></i><i></i><i></i><i></i><span>SND</span></button>
      <button class="nav__bag" type="button" data-sfx="whoosh" data-cursor="link" data-magnetic=".4" aria-label="Open bag">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2L5 8Z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
        <span class="nav__count" id="bagCount">0</span>
      </button>
      <button class="nav__menu" type="button" aria-expanded="false" aria-controls="mobileMenu">[ MENU ]</button>
    </div>
    <div class="mmenu" id="mobileMenu" aria-hidden="true">
      <ol>${NAV_ITEMS.map((it, i) => `<li><a href="${it.href || '#'}" data-key="${it.key}" ${it.action ? `data-action="${it.action}"` : ''}><small>0${i + 1}</small>${it.label}</a></li>`).join('')}</ol>
      <div class="mmenu__foot"><span>ヤクザ — DROP 01</span><span>NO RULES AFTER MIDNIGHT</span></div>
    </div>`;

  const menuBtn = nav.querySelector('.nav__menu');
  const mmenu = nav.querySelector('.mmenu');
  const toggleMenu = (open = !nav.classList.contains('menu-open')) => {
    nav.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? '[ CLOSE ]' : '[ MENU ]';
    mmenu.setAttribute('aria-hidden', String(!open));
  };
  menuBtn.addEventListener('click', () => toggleMenu());

  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    toggleMenu(false);
    if (a.dataset.action === 'index') return onIndex();
    const href = a.getAttribute('href');
    scrollTo(href === '#intro' ? 0 : href);
  });

  nav.querySelectorAll('.nav__index a').forEach((a) => {
    a.addEventListener('pointerenter', () => scramble(a.querySelector('.nav__txt')));
  });

  nav.querySelector('.nav__bag').addEventListener('click', onBag);
  nav.querySelectorAll('[data-cur]').forEach((b) => b.addEventListener('click', () => setCurrency(b.dataset.cur)));

  const sync = () => {
    nav.querySelectorAll('[data-cur]').forEach((b) => b.classList.toggle('is-on', b.dataset.cur === store.currency));
    const n = bagCount();
    const c = nav.querySelector('#bagCount');
    if (c.textContent !== String(n)) {
      c.textContent = n;
      c.classList.remove('bump');
      void c.offsetWidth;
      c.classList.add('bump');
    }
  };
  subscribe(sync);
  sync();

  const snd = nav.querySelector('.nav__snd');
  const syncSnd = (on) => {
    snd.classList.toggle('is-off', !on);
    snd.setAttribute('aria-pressed', String(on));
  };
  snd.addEventListener('click', () => setSound(!isSoundOn()));
  onSoundChange(syncSnd);
  syncSnd(isSoundOn());
  magnetize(nav);

  return {
    setActive(key) {
      nav.querySelectorAll('[data-key]').forEach((a) => a.classList.toggle('is-active', a.dataset.key === key));
    },
    setRevealed(on) {
      nav.classList.toggle('is-revealed', on);
    },
  };
}
