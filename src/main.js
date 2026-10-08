/**
 * YAKUZA — entry point. Boots the WebGL stage, renders every section from
 * data, then wires the scroll timelines in top-to-bottom order (required for
 * ScrollTrigger pin spacing) and runs a single shared ticker.
 */
import './styles/fonts.js';
import './styles/main.css';

import { device } from './core/device.js';
import { state, tickState } from './core/state.js';
import { initScroll, gsap, ScrollTrigger, scrollTo } from './core/scroll.js';
import { Stage } from './webgl/stage.js';
import { CATEGORIES } from './data/products.js';

import { initCursor } from './ui/cursor.js';
import { initNav } from './ui/nav.js';
import { initHud, setMood } from './ui/hud.js';
import { initSound } from './ui/sound.js';
import { initBag } from './ui/bag.js';
import { initPieceOverlay } from './ui/pieceOverlay.js';
import { initIndexOverlay } from './ui/indexOverlay.js';
import { magnetize } from './ui/magnetic.js';
import { toast } from './ui/toast.js';

import { runBoot } from './sections/boot.js';
import { renderTransmission, runTransmission, TRANSMISSION_TEXT } from './sections/transmission.js';
import { loadScriptFonts } from './styles/scriptFonts.js';
import { renderHero, buildHero, playIntro } from './sections/hero.js';
import { renderManifesto, buildManifesto } from './sections/manifesto.js';
import { renderCategories, buildCategory } from './sections/category.js';
import { renderFeatured, buildFeatured } from './sections/featured.js';
import { renderStatement, buildStatement } from './sections/statement.js';
import { renderFooter, buildFooter } from './sections/footer.js';

const $ = (s) => document.querySelector(s);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ── WebGL ─────────────────────────────────────────────────────────────── */
const stage = new Stage($('#gl'));

/* ── render sections from data ─────────────────────────────────────────── */
document.documentElement.classList.add('pre-intro');
renderTransmission($('#tx'));
renderHero($('#intro'));
renderManifesto($('#collection'));
renderCategories($('#categories'), CATEGORIES);
renderFeatured($('#featured'));
renderStatement($('#statement'));
renderFooter($('#footer'));

/* ── UI ────────────────────────────────────────────────────────────────── */
const lenis = initScroll();
const cursorTick = initCursor();
initSound();
const hud = initHud();
const bag = initBag();
const overlay = initPieceOverlay();
const categories = [];
const index = initIndexOverlay({
  onPick(id) {
    if (id === 'bounty-01-racer') return scrollTo(featured.st.start + (featured.st.end - featured.st.start) * 0.62);
    const cat = categories.find((c) => c.ids.includes(id));
    if (cat) scrollTo(cat.posFor(cat.ids.indexOf(id)), { duration: 2.6 });
  },
});
const nav = initNav({ onIndex: () => index.open(), onBag: () => bag.open() });
if (lenis) lenis.stop();
else document.documentElement.classList.add('no-scroll');

/* ── scroll choreography (top → bottom) ────────────────────────────────── */
buildHero($('#intro'), { onReveal: (on) => nav.setRevealed(on) });
buildManifesto($('#collection'));
CATEGORIES.forEach((cat) => {
  categories.push(
    buildCategory($(`#cat-${cat.id}`), cat, {
      onPiece: (p, i, c) => hud.setPiece(p ? `${String(i + 1).padStart(2, '0')}/${String(c.products.length).padStart(2, '0')} — ${p.name.join(' ')}` : ''),
    }),
  );
});
const featured = buildFeatured($('#featured'));
buildStatement($('#statement'));
const footer = buildFooter($('#footer'), {
  onIndex: () => index.open(),
  onTerms: () => toast('TERMS — ALL SALES FINAL AFTER MIDNIGHT. (PLACEHOLDER COPY)'),
  onContact: () => toast('CONTACT — HELLO@YAKUZA.EXAMPLE (PLACEHOLDER)'),
});
magnetize(document);

/* Theme / nav / HUD per section — measured on pin spacers so pinned lengths count. */
const NAV_KEY = { collection: 'collection', 'cat-jackets': 'jackets', 'cat-tees': 'tees', 'cat-denim': 'denim', 'cat-shoes': 'shoes', 'cat-jewelry': 'jewelry' };
document.querySelectorAll('main section, main footer').forEach((sec) => {
  const wrap = sec.parentElement.classList.contains('pin-spacer') ? sec.parentElement : sec;
  const activate = () => {
    state.theme = sec.dataset.theme;
    nav.setActive(NAV_KEY[sec.id] || '');
    hud.setSection(sec.dataset.label, sec.dataset.theme);
    document.documentElement.dataset.section = sec.dataset.theme;
  };
  ScrollTrigger.create({ trigger: wrap, start: 'top 55%', end: 'bottom 55%', onEnter: activate, onEnterBack: activate });
});

/* ── ticker ────────────────────────────────────────────────────────────── */
let clockT = 0;
const clocks = () => document.querySelectorAll('[data-clock]');
gsap.ticker.add((time, deltaMS) => {
  const dt = Math.min(deltaMS / 1000, 0.05);
  state.time = time;
  tickState(dt);
  stage.render(dt);
  cursorTick(dt);
  hud.tick();
  categories.forEach((c) => c.tick(time));
  featured.tick(time);
  footer.tick();
  clockT += dt;
  if (clockT > 1) {
    clockT = 0;
    const now = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Tokyo', hour12: false });
    clocks().forEach((c) => (c.textContent = now));
  }
});

/* ── boot ──────────────────────────────────────────────────────────────── */
const ready = Promise.race([Promise.all([document.fonts.ready, stage.buildLogo()]), new Promise((r) => setTimeout(r, 3500))]);
// Japanese + the 22 intro scripts: one tiny Google Fonts request subset to the exact glyphs used
loadScriptFonts(document.body.textContent + TRANSMISSION_TEXT);

runBoot(ready)
  .then(() => {
    ScrollTrigger.refresh();
    // sakura grows in behind the name while the transmission plays
    gsap.to(state.hero, { bloom: 1, duration: 3.4, ease: 'power2.inOut' });
    return runTransmission($('#tx'), { onLand: () => playIntro($('#intro')) });
  })
  .then(() => {
    if (lenis) lenis.start();
    else document.documentElement.classList.remove('no-scroll');
  });

window.addEventListener('load', () => ScrollTrigger.refresh());
// Expose for debugging / QA in the console.
window.__yakuza = { state, stage, device, ScrollTrigger, setMood };
