"""YAKUZA logo: black background -> transparent. Solid metal body + soft luminance-keyed glows."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
im = Image.open('images/14.webp').convert('RGB')
a = np.asarray(im).astype(np.float32)
W, H = im.size
lum = a.max(axis=2)
solid = Image.fromarray(((lum > 44) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
arr = np.asarray(solid).copy()
inv = Image.fromarray(255 - arr).copy()
ImageDraw.floodfill(inv, (0, 0), 7, thresh=0)
iv = np.asarray(inv).copy()
lim = 700  # dark facets enclosed by metal and smaller than this stay opaque
for yy in range(0, H, 3):
    for xx in range(0, W, 3):
        if iv[yy, xx] != 255:
            continue
        t = Image.fromarray(iv).copy(); ImageDraw.floodfill(t, (xx, yy), 99, thresh=0)
        iv = np.asarray(t).copy(); reg = iv == 99
        iv[reg] = 0 if reg.sum() < lim else 7
body = (iv != 7).astype(np.uint8) * 255
body = np.asarray(Image.fromarray(body).filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32) / 255
# AI silhouette, shrunk so its soft bleed never adds dark fringes: keeps dark metal solid
ai = Image.open('scratchpad/logo-mask.png').convert('L').filter(ImageFilter.MinFilter(9)).filter(ImageFilter.GaussianBlur(1.2))
ai = np.clip((np.asarray(ai).astype(np.float32) / 255 - 0.5) * 2.2 + 0.5, 0, 1)
glow = np.clip((lum / 255) ** 0.9 * 1.1, 0, 1)
alpha = np.maximum(np.maximum(body, ai), glow)
body = np.maximum(body, ai)
rgb = a / np.maximum(alpha, 1e-3)[..., None]
rgb = np.where(body[..., None] > 0.99, a, rgb)
out = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')
out.save('/home/user/digital-menu-repository/src/brand/yakuza-logo.webp', 'WEBP', quality=92, method=6, exact=True)
out.resize((W // 2, H // 2), Image.LANCZOS).save('/home/user/digital-menu-repository/src/brand/yakuza-logo-sm.webp', 'WEBP', quality=90, method=6, exact=True)
for col, name in [((150, 20, 30), 'red'), ((70, 70, 74), 'grey')]:
    bg = Image.new('RGBA', out.size, col + (255,)); bg.alpha_composite(out); bg.convert('RGB').resize((1200, 480)).save(f'scratchpad/logo-{name}.png')
    bg.convert('RGB').crop((150, 120, 900, 700)).save(f'scratchpad/logo-{name}-zoom.png')
