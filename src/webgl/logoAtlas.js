/**
 * Rasterises the vector logotype into a texture atlas:
 *   R = glyph coverage, G = tight bevel height, B = broad "liquid" height.
 * Each glyph (and the swoosh) gets its own padded cell so letters can be
 * split apart into independent meshes for the hero transition.
 */
import { layout, polysToD, shear, SWOOSH, CUT } from '../brand/logo.js';

const PAD = 28;

function bbox(polys) {
  const pts = polys.flat().map(shear);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { minX: Math.min(...xs) - PAD, maxX: Math.max(...xs) + PAD, minY: Math.min(...ys) - PAD, maxY: Math.max(...ys) + PAD };
}

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
  const { items, width: wordWidth } = layout();
  const glyphs = items.map((g) => ({ char: g.char, polys: g.polys, x: g.x, ...bbox(g.polys) }));
  const sw = { char: 'swoosh', polys: SWOOSH, x: 0, ...bbox(SWOOSH) };

  // row 1: letters, row 2: swoosh
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

  [...glyphs, sw].forEach((g) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(g.px - g.minX, g.py - g.minY);
    ctx.fill(new Path2D(polysToD(g.polys, 0)), 'evenodd');
    if (g !== sw) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(g.minX, CUT[0], g.maxX - g.minX, CUT[1] - CUT[0]);
    }
    ctx.restore();
  });

  const img = ctx.getImageData(0, 0, W, H).data;
  const a = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) a[i] = img[i * 4 + 3] / 255;
  const tight = blur(a, W, H, Math.max(2, Math.round(3.2 * scale)));
  const broad = blur(a, W, H, Math.max(4, Math.round(9 * scale)), 3);

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
