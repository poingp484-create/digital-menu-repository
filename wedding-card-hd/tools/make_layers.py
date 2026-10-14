# Build the envelope animation layers from the separately rendered PDF groups (1440 x 2560 page).
import cv2, numpy as np, os, sys
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
BX0, BY0, BX1, BY1 = 220, 440, 1240, 1190          # layer box on the page
CX0, CY0 = 240, 447                                 # origin of the crop the masks were measured on
ox, oy = CX0 - BX0, CY0 - BY0

def box(img): return img[BY0:BY1, BX0:BX1].astype(np.float32)
env = box(cv2.imread('r128/env.png', cv2.IMREAD_UNCHANGED))
seal = box(cv2.imread('r128/seal.png', cv2.IMREAD_UNCHANGED))
click = box(cv2.imread('r128/click.png', cv2.IMREAD_UNCHANGED))
H, W = env.shape[:2]

def place(mask):
    m = np.zeros((H, W), np.float32)
    m[oy:oy + mask.shape[0], ox:ox + mask.shape[1]] = mask
    return m
flap_m = place(np.load('flapmask3.npy').astype(np.float32))
hull_m = place(np.load('hullmask3.npy').astype(np.float32))
# the flap owns the envelope's top edge too: carry its first rows up through the edge
edge = oy + 12
for m in (flap_m, hull_m):
    m[:edge] = np.maximum(m[:edge], m[edge][None, :])
    # and its side edges wherever the lace reaches them (the masks stop at the paper's inner edge)
    r_rows = m[:, ox + 979] > 0; m[r_rows, ox + 980:] = 1
    l_rows = m[:, ox + 10] > 0; m[l_rows, :ox + 10] = 1
soft = lambda m, s=0.7: np.clip(cv2.GaussianBlur(m, (0, 0), s), 0, 1)
flap_a, hull_a = soft(flap_m), soft(hull_m)

def with_alpha(rgb_src, a):
    o = rgb_src.copy(); o[..., 3] = rgb_src[..., 3] * a; return o
def over(top, bot):
    ta, ba = top[..., 3:4] / 255, bot[..., 3:4] / 255
    oa = ta + ba * (1 - ta)
    rgb = (top[..., :3] * ta + bot[..., :3] * ba * (1 - ta)) / np.maximum(oa, 1e-6)
    return np.dstack([rgb, oa[..., 0] * 255])

flap = over(seal, with_alpha(env, flap_a))                       # flap paper + lace, then seal, monogram, "You are invited !"
body = with_alpha(env, 1 - hull_a)                               # pocket and side flaps, with the envelope's drop shadow
margin = with_alpha(env, np.clip(hull_a - flap_a, 0, 1))         # the lace's shadow on the pocket; fades as the flap lifts
back = with_alpha(env, flap_a)[:, ::-1]                          # back of the flap: lace and paper, mirrored for rotateY(180deg)

# Inside of the envelope: the flap's own paper texture, tiled by mirroring, shaded darker toward the bottom
paper = env[ 7 + 40:7 + 220, 20 + 330:20 + 660, :3]             # plain flap paper, above the lace
ph, pw = paper.shape[:2]
tile = np.concatenate([paper, paper[:, ::-1]], axis=1); tile = np.concatenate([tile, tile[::-1]], axis=0)
reps = (H // tile.shape[0] + 1, W // tile.shape[1] + 1, 1)
tex = np.tile(tile, reps)[:H, :W]
yy = np.mgrid[0:H, 0:W][0].astype(np.float32)
top_y, tip_y = oy + 10, oy + 547
t = np.clip((yy - top_y) / (tip_y - top_y), 0, 1)
shade = 0.93 - 0.17 * t                                          # darker as it goes into the envelope
throat = 1 - 0.22 * np.exp(-((yy - top_y) / 26) ** 2)            # shadow just under the opening
inside_rgb = tex * (shade * throat)[..., None]
inside_a = soft(cv2.dilate(hull_m, np.ones((5, 5), np.uint8)) * (yy >= top_y - 1), 0.6)
interior = np.dstack([inside_rgb, inside_a * env[..., 3]])   # never beyond the envelope's own edge

def save(name, img, q=92):
    img = np.clip(img, 0, 255).astype(np.uint8)
    if img.shape[2] == 4: img[img[..., 3] == 0, :3] = 0
    cv2.imwrite(os.path.join(out, name + '.webp'), img, [cv2.IMWRITE_WEBP_QUALITY, q])
for n, im in [('flap', flap), ('body', body), ('margin', margin), ('flap-back', back), ('interior', interior), ('click', click)]:
    save(n, im)
# the card uses the version with "Dombivli" in place of "Click HERE for location" (see invite_dombivli.py, set_dombivli.js)
for n, srcpng in (('cover', 'cover'), ('bg', 'bg'), ('invite', 'invite-dombivli')):
    cv2.imwrite(os.path.join(out, n + '.webp'), cv2.imread('r128/%s.png' % srcpng), [cv2.IMWRITE_WEBP_QUALITY, 90])

# checks: closed composite vs the full page, and an "open" preview
page = cv2.imread('r128/cover.png').astype(np.float32)
bgp = cv2.imread('r128/bg.png').astype(np.float32)
def comp(base, layers):
    o = base.copy()
    for L in layers:
        a = L[..., 3:4] / 255; o = o * (1 - a) + L[..., :3] * a
    return o
closed = bgp.copy()
closed[BY0:BY1, BX0:BX1] = comp(bgp[BY0:BY1, BX0:BX1], [interior, body, margin, flap, click])
d = np.abs(closed - page).max(axis=2)
print('closed vs page: max', d.max(), ' >8:', int((d > 8).sum()), ' >24:', int((d > 24).sum()))
openv = comp(bgp[BY0:BY1, BX0:BX1], [interior, body])
cv2.imwrite('open_preview.png', openv.astype(np.uint8))
cv2.imwrite('flap_preview.png', comp(np.full((H, W, 3), 90, np.float32), [flap]).astype(np.uint8))
cv2.imwrite('back_preview.png', comp(np.full((H, W, 3), 90, np.float32), [back]).astype(np.uint8))
