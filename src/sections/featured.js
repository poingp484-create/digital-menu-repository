/**
 * 08 — MOST WANTED. Police-strobe pursuit scene: the #01 piece turns in 3D,
 * spec call-outs wire themselves to the garment, the bounty counts up.
 */
import { gsap, ScrollTrigger } from '../core/scroll.js';
import { state } from '../core/state.js';
import { device } from '../core/device.js';
import { splitChars } from '../core/split.js';
import { FEATURED } from '../data/products.js';
import { productVisual } from '../art/renders.js';
import { formatPrice, formatAmount, store, subscribe } from '../ui/store.js';

export function renderFeatured(el) {
  const p = FEATURED;
  el.innerHTML = `
    <div class="ft__alert" aria-hidden="true"><div class="ft__alert-track">${'⚠ PURSUIT IN PROGRESS — ALL UNITS RESPOND — SUSPECT WEARING CHROME — '.repeat(4)}</div></div>
    <div class="ft__word ft__word--a" aria-hidden="true">MOST</div>
    <div class="ft__word ft__word--b" aria-hidden="true">WANTED</div>
    <div class="ft__media" data-cursor="view" data-enter="${p.id}">
      <div class="ft__tilt">
        <div class="ft__img">${productVisual(p)}</div>
        ${p.callouts
          .map(
            (c, i) => `<div class="co ${c.x < 50 ? 'co--l' : 'co--r'}" style="left:${c.x}%;top:${c.y}%"><i class="co__dot"></i><span class="co__line"></span><span class="co__label"><small>0${i + 1}</small>${c.label}</span></div>`,
          )
          .join('')}
      </div>
    </div>
    <div class="ft__bounty"><small>BOUNTY</small><b data-bounty>${formatAmount(0)}</b></div>
    <div class="ft__heat" aria-hidden="true"><small>HEAT</small><span><i></i><i></i><i></i><i></i><i></i></span></div>
    <div class="ft__info">
      <div class="ft__rank">BLACKLIST <b>#01</b></div>
      <h2 class="ft__name"><span class="n1">${p.name[0]}</span><span class="n2">${p.name[1]}</span></h2>
      <div class="ft__jp">${p.jp}</div>
      <div class="ft__price" data-price="${p.id}">${formatPrice(p.price)}</div>
      <button class="btn btn--solid ft__cta" type="button" data-enter="${p.id}" data-magnetic=".3" data-cursor="link"><span>ENTER PIECE</span><i>→</i></button>
    </div>
    <div class="ft__stamp" aria-hidden="true">EVADED</div>`;
}

export function buildFeatured(el) {
  const p = FEATURED;
  const nameChars = [...el.querySelectorAll('.ft__name .n1, .ft__name .n2')].flatMap((s) => splitChars(s));
  const bounty = el.querySelector('[data-bounty]');
  const proxy = { v: 0 };
  const setBounty = () => (bounty.textContent = formatAmount(Math.round((proxy.v * p.price[store.currency]) / 100) * 100));
  subscribe(setBounty);

  const img = el.querySelector('.ft__img');
  const cos = [...el.querySelectorAll('.co')];
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.fromTo(el.querySelector('.ft__alert'), { yPercent: -100 }, { yPercent: 0, duration: 0.3, ease: 'power3.out' }, 0)
    .fromTo(el.querySelector('.ft__word--a'), { xPercent: -160, skewX: 30, opacity: 0 }, { xPercent: 0, skewX: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, 0.15)
    .fromTo(el.querySelector('.ft__word--b'), { xPercent: 160, skewX: -30, opacity: 0 }, { xPercent: 0, skewX: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, 0.25)
    .fromTo(img, { yPercent: 70, rotationY: 88, scale: 0.6, filter: 'brightness(0.2)' }, { yPercent: 0, rotationY: 0, scale: 1, filter: 'brightness(1)', duration: 1.1, ease: 'power3.out' }, 0.5)
    .set(img, { filter: 'none' }, 1.62)
    .fromTo(el.querySelectorAll('.ft__heat i'), { opacity: 0.12 }, { opacity: 1, stagger: 0.18, duration: 0.05 }, 0.6)
    .fromTo(el.querySelector('.ft__bounty'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 1.3)
    .fromTo(proxy, { v: 0 }, { v: 1, duration: 1.5, ease: 'power1.out', onUpdate: setBounty }, 1.4);
  cos.forEach((c, i) => {
    const at = 1.6 + i * 0.32;
    tl.fromTo(c.querySelector('.co__dot'), { scale: 0 }, { scale: 1, duration: 0.15, ease: 'back.out(3)' }, at)
      .fromTo(c.querySelector('.co__line'), { scaleX: 0 }, { scaleX: 1, duration: 0.2 }, at + 0.08)
      .fromTo(c.querySelector('.co__label'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.25 }, at + 0.2);
  });
  tl.fromTo(el.querySelector('.ft__rank'), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.3 }, 2.6)
    .fromTo(nameChars, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.02, duration: 0.5, ease: 'power4.out' }, 2.65)
    .fromTo(el.querySelectorAll('.ft__jp, .ft__price, .ft__cta'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.3 }, 2.9)
    .to({}, { duration: 1.3 })
    .addLabel('exit')
    .to(cos, { opacity: 0, duration: 0.3 }, 'exit+=0.45')
    .fromTo(el.querySelector('.ft__stamp'), { opacity: 0, scale: 3, rotation: -25 }, { opacity: 1, scale: 1, rotation: -12, duration: 0.25, ease: 'power4.in' }, 'exit+=0.05')
    .to(img, { scale: 1.25, yPercent: -10, opacity: 0, filter: 'blur(14px)', duration: 0.8, ease: 'power2.in' }, 'exit+=0.3')
    .to(el.querySelector('.ft__word--a'), { xPercent: -140, opacity: 0, duration: 0.7, ease: 'power2.in' }, 'exit+=0.3')
    .to(el.querySelector('.ft__word--b'), { xPercent: 140, opacity: 0, duration: 0.7, ease: 'power2.in' }, 'exit+=0.3')
    .to(el.querySelectorAll('.ft__info, .ft__bounty, .ft__heat, .ft__stamp, .ft__alert'), { opacity: 0, y: -30, duration: 0.5, stagger: 0.03 }, 'exit+=0.5');

  const st = ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    end: () => `+=${window.innerHeight * 4.4}`,
    pin: true,
    scrub: device.touch ? 0.5 : 0.9,
    animation: tl,
    onToggle: (self) => (state.env.heatBoost = self.isActive ? 0.25 : 0),
  });

  const tilt = el.querySelector('.ft__tilt');
  let mx = 0;
  let my = 0;
  return {
    st,
    tick(time) {
      if (!st.isActive) return;
      const tx = device.touch ? Math.sin(time * 0.5) * 0.5 : state.mouse.nx;
      const ty = device.touch ? Math.cos(time * 0.4) * 0.3 : state.mouse.ny;
      mx += (tx - mx) * 0.07;
      my += (ty - my) * 0.07;
      tilt.style.transform = `perspective(1400px) rotateY(${(mx * 22).toFixed(2)}deg) rotateX(${(-my * 12).toFixed(2)}deg)`;
    },
  };
}
