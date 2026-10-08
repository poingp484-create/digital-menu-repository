/**
 * YAKUZA logotype — custom vector letterforms.
 *
 * Every glyph is drawn on a 100-unit cap-height grid (y grows downward,
 * cap line = 0, baseline = 100). Shapes are polygon lists rendered with the
 * even-odd rule, so counters (the holes in the A's) are just extra polygons.
 *
 * One source of truth feeds: the WebGL chrome hero logo (canvas atlas),
 * the DOM/SVG logo used in the nav + footer, and the no-WebGL fallback.
 */

const A = {
  w: 104,
  polys: [
    [[0, 100], [34, 0], [70, 0], [104, 100], [76, 100], [68, 76], [36, 76], [28, 100]],
    [[42, 56], [62, 56], [55, 26], [49, 26]],
  ],
};

export const GLYPHS = [
  {
    char: 'Y',
    w: 100,
    polys: [[[-10, -14], [28, 0], [50, 30], [72, 0], [110, -14], [64, 56], [64, 100], [36, 108], [36, 56]]],
  },
  A,
  {
    char: 'K',
    w: 98,
    polys: [[[0, 0], [26, 0], [26, 40], [62, 0], [96, 0], [52, 46], [110, 116], [66, 100], [34, 62], [26, 71], [26, 100], [0, 100]]],
  },
  {
    char: 'U',
    w: 96,
    polys: [[[0, 0], [26, 0], [26, 74], [70, 74], [70, 0], [96, 0], [96, 82], [78, 100], [18, 100], [0, 82]]],
  },
  {
    char: 'Z',
    w: 96,
    polys: [[[-18, 0], [96, 0], [96, 22], [36, 78], [96, 78], [116, 100], [0, 100], [0, 78], [60, 22], [0, 22]]],
  },
  { ...A, char: 'A' },
];

/** Tapered underline blade that sweeps back under the word (NFS-style swoosh). */
export const SWOOSH = [[[668, 110], [300, 122], [-40, 140], [-78, 146], [-30, 132], [290, 114], [620, 104]]];

/** Horizontal stencil cut through the word (y range, in glyph units). */
export const CUT = [52, 57];

export const GAP = 16;
export const SKEW = -0.2; // italic shear (x += y * SKEW)

/** Returns glyph layout: x offsets + total advance. */
export function layout() {
  let x = 0;
  const items = GLYPHS.map((g) => {
    const it = { ...g, x };
    x += g.w + GAP;
    return it;
  });
  return { items, width: x - GAP };
}

export const shear = ([x, y]) => [x + (y - 100) * SKEW, y];

/** Build a Path2D-compatible "d" string for a list of polygons, offset by dx. */
export function polysToD(polys, dx = 0) {
  return polys
    .map((poly) => 'M' + poly.map((p) => shear(p)).map(([x, y]) => `${(x + dx).toFixed(1)} ${y}`).join('L') + 'Z')
    .join('');
}

/** Full logo as SVG markup, filled with a chrome gradient. */
export function logoSVG({ id = 'yk', swoosh = true, className = '' } = {}) {
  const { items, width } = layout();
  const d = items.map((g) => polysToD(g.polys, g.x)).join('');
  const sw = swoosh ? polysToD(SWOOSH) : '';
  const vb = `-50 -20 ${width + 90} ${swoosh ? 170 : 140}`;
  return `<svg class="${className}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-label="YAKUZA" role="img">
  <defs>
    <linearGradient id="${id}-chrome" x1="0" y1="-20" x2="0" y2="140" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".28" stop-color="#c9ced6"/>
      <stop offset=".46" stop-color="#4b5058"/>
      <stop offset=".52" stop-color="#f4f6fa"/>
      <stop offset=".7" stop-color="#9aa1ac"/>
      <stop offset="1" stop-color="#e9edf2"/>
    </linearGradient>
    <mask id="${id}-cut" maskUnits="userSpaceOnUse" x="-100" y="-40" width="${width + 200}" height="220">
      <rect x="-100" y="-40" width="${width + 200}" height="220" fill="#fff"/>
      <rect x="-100" y="${CUT[0]}" width="${width + 200}" height="${CUT[1] - CUT[0]}" fill="#000"/>
    </mask>
  </defs>
  <path fill-rule="evenodd" fill="url(#${id}-chrome)" mask="url(#${id}-cut)" d="${d}"/>
  ${sw ? `<path fill="url(#${id}-chrome)" opacity=".9" d="${sw}"/>` : ''}
</svg>`;
}
