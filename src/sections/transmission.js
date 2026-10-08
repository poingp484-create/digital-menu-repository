/**
 * Intro "transmission": the name cuts through 22 scripts — fast at first,
 * flickering, slowing for the last Japanese beats — then lands on the
 * WebGL chrome YAKUZA. Every cut is a glitch-in with a red/blue split, a
 * slash, and a metallic tick. No buttons: it plays, lands, and you scroll.
 */
import gsap from 'gsap';
import { play } from '../ui/sound.js';
import { device } from '../core/device.js';

export const WORDS = [
  ['やくざ', 'JAPANESE — HIRAGANA'],
  ['야쿠자', 'KOREAN'],
  ['Якудза', 'RUSSIAN'],
  ['ياكوزا', 'ARABIC'],
  ['雅庫札', 'CHINESE — TRADITIONAL'],
  ['Γιακούζα', 'GREEK'],
  ['ยากูซ่า', 'THAI'],
  ['יאקוזה', 'HEBREW'],
  ['Јакуза', 'SERBIAN'],
  ['یاکوزا', 'PERSIAN'],
  ['იაკუძა', 'GEORGIAN'],
  ['雅库扎', 'CHINESE — SIMPLIFIED'],
  ['Յակուձա', 'ARMENIAN'],
  ['ያኩዛ', 'AMHARIC'],
  ['ຢາກູຊ່າ', 'LAO'],
  ['Якуза', 'MONGOLIAN'],
  ['ယာကူဇာ', 'BURMESE'],
  ['යකුසා', 'SINHALA'],
  ['យ៉ាគូហ្សា', 'KHMER'],
  ['極道', 'JAPANESE — KANJI'],
  ['ヤクザ', 'JAPANESE — KATAKANA'],
  ['YAKUZA', 'ENGLISH'],
];

/** Hold time (ms) for each word before the next cut. */
function holdFor(i) {
  const n = WORDS.length;
  if (i === n - 3) return 260; // kanji
  if (i === n - 2) return 480; // katakana
  return Math.max(65, Math.round(240 * Math.pow(0.8, i)));
}

export function renderTransmission(el) {
  el.innerHTML = `
    <div class="tx__dim"></div>
    <div class="tx__scan"></div>
    <div class="tx__frame">
      <span class="tl">YKZ-OS // TRANSMISSION</span>
      <span class="tr"><b id="txCount">00</b> / ${String(WORDS.length).padStart(2, '0')}</span>
      <span class="bl">SIGNAL <i>●</i> LIVE</span>
      <span class="br">DROP 01 — THE BLACKLIST</span>
    </div>
    <div class="tx__ghost" id="txGhost"></div>
    <div class="tx__stage">
      <div class="tx__lang" id="txLang">&nbsp;</div>
      <div class="tx__word" id="txWord"></div>
    </div>
    <i class="tx__slash" id="txSlash"></i>
    <div class="tx__bar"><i id="txBar"></i></div>
    <div class="tx__flash"></div>`;
}

/**
 * Runs the sequence. `onLand` fires on the final English beat (the WebGL
 * logo takes over there); resolves when the overlay has cleared.
 */
export function runTransmission(el, { onLand }) {
  const word = el.querySelector('#txWord');
  const lang = el.querySelector('#txLang');
  const ghost = el.querySelector('#txGhost');
  const count = el.querySelector('#txCount');
  const bar = el.querySelector('#txBar');
  const slash = el.querySelector('#txSlash');
  const flash = el.querySelector('.tx__flash');
  const n = WORDS.length;
  el.classList.add('is-on');

  const fit = () => {
    word.style.fontSize = '';
    const max = window.innerWidth * 0.86;
    const w = word.scrollWidth;
    if (w > max) word.style.fontSize = `${(parseFloat(getComputedStyle(word).fontSize) * max) / w}px`;
  };

  const cut = (i) => {
    const [text, label] = WORDS[i];
    word.textContent = text;
    word.dir = /[֐-ۿ]/.test(text) ? 'rtl' : 'ltr';
    word.classList.toggle('is-latin', i === n - 1);
    lang.textContent = label;
    ghost.textContent = [...text][0];
    count.textContent = String(i + 1).padStart(2, '0');
    bar.style.transform = `scaleX(${(i + 1) / n})`;
    fit();
    const dx = 4 + Math.random() * 8;
    word.style.setProperty('--ca', `${dx}px`);
    gsap.fromTo(
      word,
      { filter: 'blur(10px)', skewX: -22 + Math.random() * 10, clipPath: 'inset(100% 0% 0% 0%)', x: (Math.random() - 0.5) * 30 },
      { filter: 'blur(0px)', skewX: -8, clipPath: 'inset(0% 0% 0% 0%)', x: 0, duration: 0.1, ease: 'power3.out', overwrite: true },
    );
    gsap.fromTo(ghost, { opacity: 0.0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out', overwrite: true });
    gsap.fromTo(
      slash,
      { scaleX: 0, opacity: 1, rotation: -18 + Math.random() * 36, y: (Math.random() - 0.5) * window.innerHeight * 0.4 },
      { scaleX: 1, duration: 0.12, ease: 'power2.out', overwrite: true, onComplete: () => gsap.to(slash, { opacity: 0, duration: 0.12 }) },
    );
  };

  return new Promise((resolve) => {
    const reduced = device.reduced;
    let i = reduced ? n - 2 : 0;
    const finish = () => {
      // landing: the overlay word gets out of the way, WebGL chrome slams in
      word.textContent = '';
      ghost.textContent = '極';
      lang.textContent = 'ENGLISH';
      count.textContent = String(n).padStart(2, '0');
      bar.style.transform = 'scaleX(1)';
      play('land');
      onLand?.();
      gsap
        .timeline({
          onComplete: () => {
            el.classList.remove('is-on');
            el.remove();
            resolve();
          },
        })
        .fromTo(flash, { opacity: 0.9 }, { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0)
        .to(ghost, { opacity: 0, scale: 1.3, duration: 0.8, ease: 'power2.out' }, 0)
        .to(el.querySelectorAll('.tx__frame, .tx__stage, .tx__bar, .tx__scan'), { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, 0.5)
        .to(el.querySelector('.tx__dim'), { opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 0.2);
    };
    const step = () => {
      if (i >= n - 1) return finish();
      cut(i);
      play('cut', i);
      const wait = holdFor(i);
      i += 1;
      setTimeout(step, wait);
    };
    gsap.fromTo(el.querySelector('.tx__frame'), { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
    setTimeout(step, reduced ? 100 : 300);
  });
}

/** Characters this sequence needs (fed to the Google Fonts text= subset). */
export const TRANSMISSION_TEXT = WORDS.map((w) => w[0]).join('') + '極';
