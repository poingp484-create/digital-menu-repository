import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { device } from './device.js';
import { state } from './state.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

let lenis = null;

export function initScroll() {
  if (!device.touch && !device.reduced) {
    lenis = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4), wheelMultiplier: 0.9, touchMultiplier: 1.4 });
    lenis.on('scroll', (e) => {
      state.scroll.velocity = e.velocity;
      state.scroll.y = e.scroll;
      ScrollTrigger.update();
    });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    let last = window.scrollY;
    let lastT = performance.now();
    window.addEventListener(
      'scroll',
      () => {
        const now = performance.now();
        const y = window.scrollY;
        state.scroll.velocity = ((y - last) / Math.max(now - lastT, 1)) * 16;
        state.scroll.y = y;
        last = y;
        lastT = now;
      },
      { passive: true },
    );
    // let velocity decay when scrolling stops
    gsap.ticker.add(() => (state.scroll.velocity *= 0.9));
  }
  return lenis;
}

export function scrollTo(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  const y = typeof target === 'number' ? target : el ? el.getBoundingClientRect().top + window.scrollY + (opts.offset || 0) : 0;
  if (lenis) lenis.scrollTo(y, { duration: opts.duration ?? 2.2, immediate: !!opts.immediate });
  else window.scrollTo({ top: y, behavior: opts.immediate ? 'auto' : 'smooth' });
}

export const stopScroll = () => (lenis ? lenis.stop() : document.documentElement.classList.add('no-scroll'));
export const startScroll = () => (lenis ? lenis.start() : document.documentElement.classList.remove('no-scroll'));

export { gsap, ScrollTrigger };
