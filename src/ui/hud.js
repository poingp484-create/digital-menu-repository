/**
 * Game-style HUD, deliberately faint: section + heat bars bottom-left,
 * speed readout + route progress bottom-right. Speed = scroll velocity.
 */
import { state } from '../core/state.js';
import { HEAT } from '../data/themes.js';

export function initHud() {
  const hud = document.getElementById('hud');
  hud.innerHTML = `
    <div class="hud__l">
      <div class="hud__sec" id="hudSec">01 — INTRO</div>
      <div class="hud__heat"><span>HEAT</span><b></b><b></b><b></b><b></b><b></b></div>
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
