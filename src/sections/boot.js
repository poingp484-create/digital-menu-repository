/** Game-style boot screen. Resolves once fonts + WebGL are ready (min ~1.5s). */
import gsap from 'gsap';

const LOG = [
  'MOUNTING DISTRICT 01 — DOCKS',
  'MOUNTING DISTRICT 02 — NEON ROW',
  'MOUNTING DISTRICT 03 — HIGHWAY',
  'MOUNTING DISTRICT 04 — VAULT',
  'POLISHING CHROME',
  'SYNCING POLICE SCANNER',
  'LOADING THE BLACKLIST',
];

export function runBoot(ready) {
  const el = document.getElementById('boot');
  const log = document.getElementById('bootLog');
  const bar = document.getElementById('bootBar');
  const pct = document.getElementById('bootPct');
  const reduced = document.documentElement.classList.contains('is-reduced');
  const prog = { v: 0 };
  const minTime = reduced ? 0.3 : 1.6;

  LOG.forEach((line, i) => {
    const row = document.createElement('div');
    row.innerHTML = `<span>&gt; ${line}</span><b>OK</b>`;
    log.appendChild(row);
    gsap.fromTo(row, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.2, delay: (i * minTime) / LOG.length });
  });

  const fill = gsap.to(prog, {
    v: 0.86,
    duration: minTime,
    ease: 'power1.inOut',
    onUpdate: () => {
      bar.style.transform = `scaleX(${prog.v})`;
      pct.textContent = `${String(Math.round(prog.v * 100)).padStart(3, '0')}%`;
    },
  });

  return Promise.all([ready, new Promise((r) => setTimeout(r, minTime * 1000))]).then(
    () =>
      new Promise((resolve) => {
        fill.kill();
        gsap
          .timeline({ onComplete: () => (el.remove(), resolve()) })
          .to(prog, {
            v: 1,
            duration: 0.35,
            ease: 'power2.out',
            onUpdate: () => {
              bar.style.transform = `scaleX(${prog.v})`;
              pct.textContent = `${String(Math.round(prog.v * 100)).padStart(3, '0')}%`;
            },
          })
          .to(el, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', duration: 0.9, ease: 'expo.inOut' }, '+=0.1')
          .add(() => document.body.classList.remove('is-booting'), '-=0.6');
      }),
  );
}
