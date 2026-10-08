/**
 * UI sound effects — synthesised live with the Web Audio API (no audio files).
 * Game-menu flavoured: a metallic "select" tick for clicks, a confirm chirp for
 * add-to-bag, a whoosh for overlays, a short buzz for errors.
 *
 * Browsers only allow audio after a user gesture; every sound here is played
 * from a click, so it just works. Toggle persists in localStorage.
 */
const KEY = 'yakuza:sound';
let ctx = null;
let master = null;
let noiseBuf = null;
let enabled = (() => {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
})();
const subs = new Set();

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function env(node, t, a, peak, d) {
  node.gain.setValueAtTime(0.0001, t);
  node.gain.exponentialRampToValueAtTime(peak, t + a);
  node.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

function tone({ type = 'sine', f0, f1 = f0, t, a = 0.002, d = 0.08, peak = 0.3, dest = master }) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + a + d);
  env(g, t, a, peak, d);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + a + d + 0.02);
}

function noise({ t, a = 0.001, d = 0.05, peak = 0.3, type = 'bandpass', f0 = 3000, f1 = f0, q = 1.2 }) {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + a + d);
  const g = ctx.createGain();
  env(g, t, a, peak, d);
  s.connect(f).connect(g).connect(master);
  s.start(t);
  s.stop(t + a + d + 0.02);
}

const SFX = {
  // metallic menu "select": transient click + bright ping + low thump
  click(t) {
    noise({ t, d: 0.03, peak: 0.35, f0: 4200, q: 2 });
    tone({ type: 'triangle', f0: 1900, f1: 1300, t, d: 0.06, peak: 0.16 });
    tone({ type: 'sine', f0: 140, f1: 70, t, d: 0.07, peak: 0.25 });
  },
  // softer tick for toggles / sizes / currency
  tick(t) {
    noise({ t, d: 0.018, peak: 0.22, f0: 5200, q: 3 });
    tone({ type: 'square', f0: 2600, f1: 2200, t, d: 0.025, peak: 0.04 });
  },
  // add to bag — two-step rising chirp
  confirm(t) {
    tone({ type: 'square', f0: 660, t, d: 0.07, peak: 0.07 });
    tone({ type: 'square', f0: 990, t: t + 0.075, d: 0.12, peak: 0.07 });
    tone({ type: 'sine', f0: 1980, t: t + 0.075, d: 0.25, peak: 0.08 });
    noise({ t, d: 0.03, peak: 0.2, f0: 4000 });
  },
  // overlay open — filtered noise sweep up
  whoosh(t) {
    noise({ t, a: 0.12, d: 0.32, peak: 0.28, f0: 300, f1: 3200, q: 0.8 });
    tone({ type: 'sine', f0: 90, f1: 45, t, a: 0.02, d: 0.35, peak: 0.18 });
  },
  // close / back — sweep down
  back(t) {
    noise({ t, a: 0.02, d: 0.22, peak: 0.2, f0: 2600, f1: 400, q: 0.9 });
    tone({ type: 'triangle', f0: 1200, f1: 600, t, d: 0.09, peak: 0.1 });
  },
  // error — short low buzz
  error(t) {
    tone({ type: 'square', f0: 150, t, d: 0.09, peak: 0.08 });
    tone({ type: 'square', f0: 150, t: t + 0.12, d: 0.09, peak: 0.08 });
  },
};

export function play(name = 'click') {
  if (!enabled) return;
  const c = ensure();
  if (!c || !SFX[name]) return;
  SFX[name](c.currentTime + 0.005);
}

export const isSoundOn = () => enabled;
export function setSound(on) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  if (on) play('tick');
  subs.forEach((fn) => fn(on));
}
export const onSoundChange = (fn) => (subs.add(fn), () => subs.delete(fn));

/**
 * Every click on something interactive makes a sound. Elements can choose
 * their sound with data-sfx="click|tick|confirm|whoosh|back|error|none".
 */
export function initSound() {
  document.addEventListener(
    'click',
    (e) => {
      const el = e.target.closest('[data-sfx], button, a, [data-enter], label, [role="button"]');
      if (!el || e.target.tagName === 'INPUT') return;
      let name = el.dataset.sfx;
      if (!name) name = el.matches('[data-enter]') ? 'whoosh' : 'click';
      if (name !== 'none') play(name);
    },
    { capture: true },
  );
}
