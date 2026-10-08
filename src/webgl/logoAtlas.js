/**
 * Rasterises the logotype (Bruno Ace SC, italic shear) into a texture atlas:
 *   R = glyph coverage, G = tight bevel height, B = broad "liquid" height.
 * Each glyph (and the swoosh) gets its own padded cell so letters can be
 * split apart into independent meshes for the hero transition.
 *
 * Units: cap height = 100 (cap line y = 0, baseline y = 100, y grows down).
 * Call only after the font has loaded (see Stage.buildLogo).
 */
import { WORD, LOGO_FAMILY, SKEW, TRACKING, SWOOSH } from '../brand/logo.js';

const PAD = 28;
const FONT_PX = 200; // measuring size
const EMBOLDEN = 7; // stroke width in cap units (cap height = 100)

/** Separable running-sum box blur (edges treated as empty). */
function boxBlur(src, w, h, r) {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const inv = 1 / (2 * r + 1);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let acc = 0;
    for (let x = -r; x <= r; x++) if (x >= 0 && x < w) acc += src[row + x];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = acc * inv;
      const add = x + r + 1;
      const sub = x - r;
      if (add < w) acc += src[row + add];
      if (sub >= 0) acc -= src[row + sub];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) if (y >= 0 && y < h) acc += tmp[y * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc * inv;
      const add = y + r + 1;
      const sub = y - r;
      if (add < h) acc += tmp[add * w + x];
      if (sub >= 0) acc -= tmp[sub * w + x];
    }
  }
  return out;
}

const blur = (src, w, h, r, passes = 2) => {
  let b = src;
  for (let i = 0; i < passes; i++) b = boxBlur(b, w, h, r);
  return b;
};

export function buildLogoAtlas(scale = 2.2) {
  // ── measure in font pixels, convert to cap units
  const m = document.createElement('canvas').getContext('2d');
  m.font = `400 ${FONT_PX}px '${LOGO_FAMILY}'`;
  const capPx = m.measureText('Y').actualBoundingBoxAscent || FONT_PX * 0.72;
  const u = 100 / capPx; // units per font px
  const track = TRACKING * 100;
  const chars = [...WORD];

  // pen positions from cumulative substring widths (keeps kerning) + tracking
  const glyphs = chars.map((ch, i) => {
    const x = m.measureText(WORD.slice(0, i)).width * u + i * track;
    const mt = m.measureText(ch);
    const left = -mt.actualBoundingBoxLeft * u;
    const right = mt.actualBoundingBoxRight * u;
    // shear moves the cap line right by SKEW*100 units, the baseline stays
    return {
      char: ch,
      x,
      minX: left - PAD,
      maxX: right + SKEW * 100 + PAD,
      minY: -PAD - 6,
      maxY: 100 + PAD + 4,
    };
  });
  const last = glyphs[glyphs.length - 1];
  const wordWidth = last.x + m.measureText(last.char).actualBoundingBoxRight * u + SKEW * 50;

  const swPts = SWOOSH.map(([x, y]) => [x * wordWidth, y * 100]);
  const sw = {
    char: 'swoosh',
    x: 0,
    minX: Math.min(...swPts.map((p) => p[0])) - PAD,
    maxX: Math.max(...swPts.map((p) => p[0])) + PAD,
    minY: Math.min(...swPts.map((p) => p[1])) - PAD,
    maxY: Math.max(...swPts.map((p) => p[1])) + PAD,
  };

  // ── pack: row 1 letters, row 2 swoosh
  let cx = 0;
  const row1H = Math.max(...glyphs.map((g) => g.maxY - g.minY));
  glyphs.forEach((g) => {
    g.px = cx;
    g.py = 0;
    cx += g.maxX - g.minX;
  });
  sw.px = 0;
  sw.py = row1H;
  const Wu = Math.max(cx, sw.maxX - sw.minX);
  const Hu = row1H + (sw.maxY - sw.minY);
  const W = Math.ceil(Wu * scale);
  const H = Math.ceil(Hu * scale);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'alphabetic';

  glyphs.forEach((g) => {
    ctx.save();
    ctx.scale(scale, scale);
    // cell origin → glyph pen origin at baseline (y = 100 units)
    ctx.translate(g.px - g.minX, g.py - g.minY + 100);
    ctx.transform(1, 0, -SKEW, 1, 0, 0); // italic shear about the baseline
    ctx.scale(u, u);
    ctx.font = `400 ${FONT_PX}px '${LOGO_FAMILY}'`;
    ctx.fillText(g.char, 0, 0);
    // slight faux-bold so the chrome bevel has body to catch light
    ctx.strokeStyle = '#fff';
    ctx.lineJoin = 'miter';
    ctx.lineWidth = EMBOLDEN / u;
    ctx.strokeText(g.char, 0, 0);
    ctx.restore();
  });

  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(sw.px - sw.minX, sw.py - sw.minY);
  ctx.beginPath();
  swPts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const img = ctx.getImageData(0, 0, W, H).data;
  const a = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) a[i] = img[i * 4 + 3] / 255;
  const tight = blur(a, W, H, Math.max(2, Math.round(2.6 * scale)));
  const broad = blur(a, W, H, Math.max(3, Math.round(6 * scale)), 3);

  const data = new Uint8Array(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    data[i * 4] = a[i] * 255;
    data[i * 4 + 1] = tight[i] * 255;
    data[i * 4 + 2] = broad[i] * 255;
    data[i * 4 + 3] = 255;
  }

  const cells = [...glyphs, sw].map((g) => {
    const wU = g.maxX - g.minX;
    const hU = g.maxY - g.minY;
    return {
      char: g.char,
      // uv rect: u0, vTop, u1, vBottom (data rows run top→bottom)
      rect: [(g.px * scale) / W, (g.py * scale) / H, ((g.px + wU) * scale) / W, ((g.py + hU) * scale) / H],
      wU,
      hU,
      // centre of the cell in word units (y down, baseline 100)
      cxU: g.x + (g.minX + g.maxX) / 2,
      cyU: (g.minY + g.maxY) / 2,
    };
  });

  return { data, width: W, height: H, cells, wordWidth };
}
