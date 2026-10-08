"""Fill the RGB of transparent pixels with the nearest opaque colour ("colour bleed").

Cut-outs keep stray background colours in fully transparent pixels. Browsers
ignore them, but GPU texture filtering (WebGL) blends them into the outline as
light fringes. Run on every product WebP after cutting:
    python3 scripts/bleed_edges.py public/products/*.webp src/brand/yakuza-logo*.webp
"""
import sys
import numpy as np
from PIL import Image


def box(x, r):
    c = np.cumsum(np.cumsum(np.pad(x, ((r + 1, r), (r + 1, r)), mode='edge'), 0), 1)
    return (c[2 * r + 1:, 2 * r + 1:] - c[:-2 * r - 1, 2 * r + 1:] - c[2 * r + 1:, :-2 * r - 1] + c[:-2 * r - 1, :-2 * r - 1])


def bleed(path):
    im = Image.open(path).convert('RGBA')
    a = np.asarray(im).astype(np.float64)
    rgb, al = a[..., :3], a[..., 3] / 255.0
    w = (al > 0.6).astype(np.float64)
    out = rgb.copy()
    todo = al < 0.6
    for r in (1, 2, 4, 8, 16, 32, 64, 128):
        ws = box(w, r)
        cs = np.stack([box(rgb[..., c] * w, r) for c in range(3)], -1)
        ok = todo & (ws > 0.5)
        out[ok] = cs[ok] / ws[ok][:, None]
        todo &= ~ok
        if not todo.any():
            break
    out[todo] = 0
    # partially transparent pixels: keep their (decontaminated) colour
    keep = (al >= 0.02) & (al < 0.6)
    out[keep] = rgb[keep]
    res = np.dstack([np.clip(out, 0, 255), a[..., 3]]).astype(np.uint8)
    Image.fromarray(res, 'RGBA').save(path, 'WEBP', quality=90, method=6, exact=True)
    print('bled', path)


for p in sys.argv[1:]:
    bleed(p)
