/**
 * 01 — INTRO. The chrome logotype lives in WebGL (src/webgl/stage.js); this
 * section owns the pinned scroll distance, the HUD copy around it and the
 * teaser framing of the piece the camera flies toward.
 */
import { gsap, ScrollTrigger } from '../core/scroll.js';
import { state } from '../core/state.js';
import { logoSVG } from '../brand/logo.js';
import { FEATURED } from '../data/products.js';

export function renderHero(el) {
  el.innerHTML = `
    <div class="hero__fallback" aria-hidden="true">${logoSVG({ id: 'herofb' })}</div>
    <h1 class="sr-only">YAKUZA — underground Y2K streetwear</h1>
    <div class="hero__hud hero__hud--tl"><span>TOKYO / 35.6762° N 139.6503° E</span><span>LOCAL <b data-clock>--:--:--</b></span></div>
    <div class="hero__hud hero__hud--tr"><span>DROP 01 — THE BLACKLIST</span><span>SEASON 2026 // 17 PIECES</span></div>
    <div class="hero__hud hero__hud--bl"><span>ヤクザ</span><span>UNDERGROUND STREETWEAR — EST. 2000</span></div>
    <div class="hero__scroll" aria-hidden="true"><span>SCROLL TO ENTER</span><i></i></div>
    <div class="hero__target" aria-hidden="true">
      <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
      <span class="hero__target-label">SUSPECT SPOTTED — ${FEATURED.name.join(' ')}</span>
      <span class="hero__target-meta">BOUNTY PENDING — HEAT 5</span>
    </div>
    <div class="hero__enter" aria-hidden="true"><span>ENTERING</span><b>THE BLACKLIST</b></div>`;
}

export function buildHero(el, { onReveal }) {
  const hud = el.querySelectorAll('.hero__hud, .hero__scroll');
  const target = el.querySelector('.hero__target');
  const enter = el.querySelector('.hero__enter');

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.to(hud, { opacity: 0, y: -20, filter: 'blur(6px)', duration: 0.12, stagger: 0.01 }, 0.02)
    .fromTo(target, { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'power3.out' }, 0.4)
    .to(target, { opacity: 0, scale: 1.6, duration: 0.12, ease: 'power2.in' }, 0.66)
    .fromTo(enter, { opacity: 0, letterSpacing: '1.2em', filter: 'blur(10px)' }, { opacity: 1, letterSpacing: '0.3em', filter: 'blur(0px)', duration: 0.14 }, 0.74)
    .to(enter, { opacity: 0, y: -40, duration: 0.1 }, 0.9);

  let revealed = false;
  const st = ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    end: '+=230%',
    pin: true,
    scrub: true,
    animation: tl,
    onUpdate(self) {
      state.hero.progress = self.progress;
      const r = self.progress > 0.42;
      if (r !== revealed) {
        revealed = r;
        onReveal(r);
      }
    },
  });
  // read every frame too: a long jump (nav / index) can skip onUpdate
  gsap.ticker.add(() => (state.hero.progress = st.progress));
  return st;
}

/** Intro choreography after boot: drives state.hero.intro for the WebGL logo. */
export function playIntro(el) {
  const tl = gsap.timeline();
  tl.to(state.hero, { intro: 1, duration: 2.6, ease: 'power2.out' }, 0)
    .from(el.querySelectorAll('.hero__hud span'), { opacity: 0, y: 12, duration: 0.8, stagger: 0.06, ease: 'power3.out' }, 1.2)
    .from(el.querySelector('.hero__scroll'), { opacity: 0, y: 20, duration: 0.8 }, 1.8)
    .from(el.querySelector('.hero__fallback'), { opacity: 0, scale: 1.4, filter: 'blur(20px)', duration: 1.6, ease: 'expo.out' }, 0);
  return tl;
}
