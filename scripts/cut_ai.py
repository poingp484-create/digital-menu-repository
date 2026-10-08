"""AI cut-outs: BiRefNet mask -> edge colour decontamination -> trimmed WebP."""
import sys
import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove

SRC = 'images'
OUT = '/home/user/digital-menu-repository/public/products'
SCR = 'scratchpad/ai'
import os; os.makedirs(SCR, exist_ok=True)

JOBS = [
    ('4.jpg', 'thorn-crown-zip-hoodie', [], 0.22),
    ('5.jpg', 'blood-wing-denim', []),
    ('6.jpg', 'tribal-blade-denim', [(0, 850, 736, 920)]),   # watermark strip
    ('7.jpg', 'union-relic-denim', [(0, 1370, 320, 1440)]),  # watermark
    ('8.jpg', 'tora-ink-longsleeve', []),
    ('9.jpg', 'leopard-cross-cadet-cap', []),
    ('10.jpg', 'black-mass-trapper', []),
    ('11.jpg', 'gilded-wing-cadet-cap', []),
    ('12.jpg', 'sanctum-shield-shades', []),
    ('13.jpg', 'twin-dragon-henley-tee', []),
    ('15.jpg', 'iron-clasp-bomber', [], 0.06, [[(198, 652), (538, 652), (538, 720), (198, 720)]]),  # torn lining scraps under the hem
    ('16.jpg', 'ash-fade-leather-jacket', []),
    ('17.jpg', 'grave-stud-zip-jacket', [], 0.06, [[(285, 0), (565, 0), (565, 40), (548, 102), (500, 86), (450, 80), (400, 82), (350, 90), (304, 110), (285, 70)]]),  # hanger
    ('18.jpg', 'oxblood-fur-collar-jacket', []),
    ('19.jpg', 'recon-cargo-leather-jacket', []),
    ('20.jpg', 'parade-white-leather-jacket', []),
    ('21.jpg', 'blood-script-skate-shoe', [(0, 0, 260, 60)]),          # watermark
    ('22.jpg', 'night-bat-skate-shoe', [(330, 1420, 870, 1500)]),     # watermark
    ('23.jpg', 'red-tiger-bamboo-tee', []),
    ('24.jpg', 'royal-flush-print-tee', [], 0.06, [[(0, 770), (115, 772), (250, 781), (350, 788), (460, 794), (580, 800), (736, 803), (736, 981), (0, 981)]]),  # backdrop under the hem
    ('25.jpg', 'ume-blossom-suede-jacket', []),
    ('26.jpg', 'quicksilver-wrap-shades', []),
]
only = sys.argv[1:]
session = new_session('birefnet-general')

def _box1(x, r, axis):
    pad = [(0, 0), (0, 0)]
    pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(x, pad, mode='edge'), axis=axis)
    hi = np.take(c, range(2 * r + 1, c.shape[axis]), axis=axis)
    lo = np.take(c, range(0, c.shape[axis] - 2 * r - 1), axis=axis)
    return (hi - lo) / (2 * r + 1)

def blur(x, r):
    # three box passes ≈ gaussian
    k = max(1, int(r / 1.7))
    for _ in range(3):
        x = _box1(_box1(x, k, 0), k, 1)
    return x

for job in JOBS:
    fn, out, covers = job[:3]
    lo = job[3] if len(job) > 3 else 0.06
    clips = job[4] if len(job) > 4 else []
    if only and fn not in only:
        continue
    im = Image.open(f'{SRC}/{fn}').convert('RGB')
    arr = np.asarray(im).astype(np.float32)
    if covers:
        bgc = arr[4, 4].copy()
        for (x0, y0, x1, y1) in covers:
            arr[y0:y1, x0:x1] = bgc
        im = Image.fromarray(arr.astype(np.uint8))
    mask = remove(im, session=session, only_mask=True, post_process_mask=False)
    a = np.asarray(mask).astype(np.float32) / 255.0
    # tighten the matte slightly: kills faint halos, keeps soft fur / fabric edges
    a = np.clip((a - lo) / (0.94 - lo), 0, 1)
    if clips:
        from PIL import ImageDraw
        cm = Image.new('L', im.size, 255)
        for poly in clips:
            ImageDraw.Draw(cm).polygon(poly, fill=0)
        cm = cm.filter(ImageFilter.GaussianBlur(1.2))
        a = a * (np.asarray(cm).astype(np.float32) / 255)
    # drop tiny detached specks
    hard = Image.fromarray((a > 0.5).astype(np.uint8) * 255)
    # estimate the local background colour behind each edge pixel (normalised convolution)
    w_bg = (1 - a) ** 2
    B = np.stack([blur(arr[..., c] * w_bg, 10) / np.maximum(blur(w_bg, 10), 1e-4) for c in range(3)], -1)
    # edge pixels that still look like the backdrop lose their opacity (kills haze/halos)
    if fn != '12.jpg':  # the shades' lens is legitimately backdrop-coloured
        dist = np.abs(arr - B).max(axis=2)
        keep = np.clip((dist - 10) / 30, 0, 1)
        a = np.where(a < 0.97, a * keep, a)
    # decontaminate: C = a*F + (1-a)*B  =>  F = (C - (1-a)*B) / a
    am = np.maximum(a, 0.05)[..., None]
    F = (arr - (1 - a[..., None]) * B) / am
    F = np.clip(F, 0, 255)
    # pure interior pixels keep their original colour exactly
    F = np.where(a[..., None] > 0.98, arr, F)
    rgba = np.dstack([F, a * 255]).astype(np.uint8)
    img = Image.fromarray(rgba, 'RGBA')
    bbox = Image.fromarray((a > 0.02).astype(np.uint8) * 255).getbbox()
    pad = 20
    w, h = img.size
    img = img.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(w, bbox[2] + pad), min(h, bbox[3] + pad)))
    if max(img.size) > 1400:
        s = 1400 / max(img.size)
        img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    img.save(f'{OUT}/{out}.webp', 'WEBP', quality=90, method=6, exact=True)
    # previews on three backgrounds to expose fringes
    tiles = []
    for col in [(14, 13, 18), (120, 120, 124), (150, 20, 30)]:
        bg = Image.new('RGBA', img.size, col + (255,))
        bg.alpha_composite(img)
        tiles.append(bg.convert('RGB'))
    W = Image.new('RGB', (img.width * 3, img.height))
    for i, t in enumerate(tiles):
        W.paste(t, (i * img.width, 0))
    W.thumbnail((1500, 700))
    W.save(f'{SCR}/{out}.png')
    print(out, img.size, flush=True)
