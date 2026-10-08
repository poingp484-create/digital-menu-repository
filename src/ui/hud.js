/**
 * Game-style HUD, deliberately faint: section + heat bars bottom-left,
 * speed readout + route progress bottom-right. Speed = scroll velocity.
 */
import { state } from '../core/state.js';
import { HEAT, MOODS, DEFAULT_MOOD, SHOW_MOOD_SWITCHER } from '../data/themes.js';

const MOOD_KEY = 'yakuza:mood';
const MOOD_IDS = Object.keys(MOODS);

function loadMood() {
  try {
    const m = localStorage.getItem(MOOD_KEY);
    if (SHOW_MOOD_SWITCHER && MOODS[m]) return m;
  } catch {
    /* ignore */
  }
  return DEFAULT_MOOD;
}

/** Switch the background mood (also callable from the console: __yakuza.setMood('midnight')). */
export function setMood(id) {
  if (!MOODS[id]) return;
  state.mood = id;
  document.documentElement.dataset.mood = id;
  try {
    localStorage.setItem(MOOD_KEY, id);
  } catch {
    /* ignore */
  }
  document.querySelectorAll('[data-mood-label]').forEach((el) => (el.textContent = MOODS[id].label));
}

export function initHud() {
  const hud = document.getElementById('hud');
  hud.innerHTML = `
    <div class="hud__l">
      <div class="hud__sec" id="hudSec">01 — INTRO</div>
      <div class="hud__heat"><span>HEAT</span><b></b><b></b><b></b><b></b><b></b></div>
      ${SHOW_MOOD_SWITCHER ? `<button class="hud__mood" type="button" data-sfx="tick" data-cursor="link" aria-label="Change background filter"><span>FILTER</span><i>◂</i><b data-mood-label>${MOODS[DEFAULT_MOOD].label}</b><i>▸</i></button>` : ''}
    </div>
    <div class="hud__r">
      <div class="hud__speed"><span id="hudSpeed">000</span><small>KM/H</small></div>
      <div class="hud__route"><i id="hudRoute"></i></div>
      <div class="hud__piece" id="hudPiece"></div>
    </div>`;
  const sec = hud.querySelector('#hudSec');
  const bars = [...hud.querySelectorAll('.hud__heat b')];
  const speed = hud.querySelector('#hudSpeed');
  const route = hud.querySelector('#hudRoute');
  const piece = hud.querySelector('#hudPiece');
  setMood(loadMood());
  hud.querySelector('.hud__mood')?.addEventListener('click', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const back = e.clientX && e.clientX < r.left + r.width * 0.45;
    const i = MOOD_IDS.indexOf(state.mood);
    setMood(MOOD_IDS[(i + (back ? -1 : 1) + MOOD_IDS.length) % MOOD_IDS.length]);
  });
  let shown = -1;
  let lastPiece = '';

  return {
    setSection(label, theme) {
      sec.textContent = label;
      const h = HEAT[theme] ?? 0;
      bars.forEach((b, i) => b.classList.toggle('on', i < h));
      hud.classList.toggle('is-pursuit', theme === 'pursuit');
    },
    setPiece(text) {
      if (text === lastPiece) return;
      lastPiece = text;
      piece.textContent = text;
    },
    tick() {
      const kmh = Math.round(Math.min(state.scroll.speed, 1.4) * 220);
      if (kmh !== shown) {
        shown = kmh;
        speed.textContent = String(kmh).padStart(3, '0');
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      route.style.transform = `scaleX(${max > 0 ? state.scroll.y / max : 0})`;
    },
  };
}
