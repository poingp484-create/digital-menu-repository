/** Device capability + quality tier detection. */
const mq = (q) => window.matchMedia(q).matches;

const touch = mq('(hover: none), (pointer: coarse)');
const reduced = mq('(prefers-reduced-motion: reduce)');
const cores = navigator.hardwareConcurrency || 4;
const memory = navigator.deviceMemory || 4;

let tier = 'high';
if (reduced) tier = 'low';
else if (touch) tier = cores >= 6 && memory >= 4 ? 'mid' : 'low';
else if (cores < 6 || memory < 4) tier = 'mid';

export const device = {
  touch,
  reduced,
  tier,
  get mobile() {
    return window.innerWidth < 760;
  },
  get portrait() {
    return window.innerHeight > window.innerWidth;
  },
  /** Downgrade at runtime (called by the FPS monitor). */
  downgrade() {
    if (this.tier === 'high') this.tier = 'mid';
    else if (this.tier === 'mid') this.tier = 'low';
    document.documentElement.dataset.tier = this.tier;
    return this.tier;
  },
};

document.documentElement.dataset.tier = tier;
document.documentElement.classList.toggle('is-touch', touch);
document.documentElement.classList.toggle('is-reduced', reduced);
