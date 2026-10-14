# Cuts the envelope into animation layers from cover.png (the closed card, 461 x 790).
# Usage: python3 make_layers.py <dir with cover.png> <output dir>
# Coordinates below are pixels in that cover; they would need re-measuring for a different export.
import cv2, numpy as np, sys
src, out = sys.argv[1], sys.argv[2]
A = cv2.imread(src + '/cover.png')            # BGR, 461x790
H, W = A.shape[:2]
S = 4                                          # supersample for soft edges
ENV = (63, 205, 422, 458)
TIP = (236.0, 423.0)
SEAL_C, SEAL_R = (239.5, 382.0), 38.5
POLY = [(63, 203.5), (422, 203.5), (422, 235.5), (246, 417), (225.4, 417), (63, 223.7)]

def poly_alpha(pts):
    m = np.zeros((H * S, W * S), np.uint8)
    cv2.fillPoly(m, [np.round(np.array(pts) * S).astype(np.int32)], 255, lineType=cv2.LINE_AA)
    return cv2.resize(m, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255

def circle_alpha(c, r):
    m = np.zeros((H * S, W * S), np.uint8)
    cv2.circle(m, (round(c[0] * S), round(c[1] * S)), round(r * S), 255, -1, lineType=cv2.LINE_AA)
    return cv2.resize(m, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255

envm = np.zeros((H, W), np.float32); envm[ENV[1]:ENV[3], ENV[0]:ENV[2]] = 1
pa = poly_alpha(POLY) * envm
sa = circle_alpha(SEAL_C, SEAL_R)
# Inside the cut line, only lace (light or textured) belongs to the flap; plain grey there is envelope in the lace's shadow
L = A.astype(np.float32).mean(axis=2)
mu = cv2.blur(L, (3, 3)); sd = np.sqrt(np.maximum(cv2.blur(L * L, (3, 3)) - mu * mu, 0))
yy0, xx0 = np.mgrid[0:H, 0:W].astype(np.float32)
def _ld(p, q):
    (x1, y1), (x2, y2) = p, q
    return np.abs((y2 - y1) * xx0 - (x2 - x1) * yy0 + x2 * y1 - y2 * x1) / np.hypot(x2 - x1, y2 - y1)
d_edge = np.minimum(_ld((63, 223.7), (225.4, 417)), _ld((422, 235.5), (246, 417)))
lace = ((L > 197) | (sd > 7)).astype(np.uint8)
lace = cv2.morphologyEx(lace, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
lace = cv2.GaussianBlur(lace.astype(np.float32), (0, 0), 0.6)
keep = np.where(d_edge > 12, 1.0, np.clip(lace * 1.4, 0, 1))
pa_lace = pa * keep
flap_a = np.maximum(pa_lace, sa)

def save(name, bgr, a):
    rgba = np.dstack([bgr, np.clip(a * 255 + .5, 0, 255).astype(np.uint8)])
    cv2.imwrite(f'{out}/{name}.png', rgba)

# flap (front): original pixels, seal included
save('margin', A, np.clip(pa - pa_lace, 0, 1) * (1 - sa))
save('flap', A, flap_a)

# body: envelope minus flap; the wax that overhangs the body is filled from surrounding paper
fill = ((sa > 0.01) & (pa < 0.99)).astype(np.uint8) * 255
fill = cv2.dilate(fill, np.ones((3, 3), np.uint8))
src_hole = cv2.dilate(((sa > 0.01) | (pa > 0.01)).astype(np.uint8) * 255, np.ones((5, 5), np.uint8))
body_px = cv2.inpaint(A, src_hole, 6, cv2.INPAINT_TELEA)
hole = fill
body_px = np.where(hole[..., None] > 0, body_px, A)
save('body', body_px, envm * (1 - pa))

# envelope interior seen through the opening: shaded paper
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
t = np.clip((yy - ENV[1]) / (TIP[1] - ENV[1]), 0, 1)
top = np.array([192, 210, 216], np.float32)   # BGR of light cream paper in shadow
bot = np.array([146, 164, 172], np.float32)
col = top[None, None] * (1 - t[..., None]) + bot[None, None] * t[..., None]
lip = np.exp(-((yy - ENV[1]) / 10) ** 2)[..., None]       # dark throat just under the hinge
col = col * (1 - 0.18 * lip)
rng = np.random.default_rng(7)
noise = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 0.7) * 3.2
col = np.clip(col + noise[..., None], 0, 255).astype(np.uint8)
inner = poly_alpha([(ENV[0], ENV[1]), (ENV[2], ENV[1]), (ENV[2], 240), (TIP[0], TIP[1] + 4), (ENV[0], 228)])
inner = np.maximum(inner, pa)
save('interior', col, inner * envm)

# flap back: lace band from the front, plain paper inside, no text or seal
def line_dist(p, q):
    (x1, y1), (x2, y2) = p, q
    return np.abs((y2 - y1) * xx - (x2 - x1) * yy + x2 * y1 - y2 * x1) / np.hypot(x2 - x1, y2 - y1)
d = np.minimum(line_dist((63, 223.7), (225.4, 417)), line_dist((422, 235.5), (246, 417)))
band = np.clip((26 - d) / 4, 0, 1)                        # 1 inside the lace band, fades to paper
paper = np.array([205, 222, 230], np.float32)
pap = np.clip(paper[None, None] + noise[..., None] * 0.9, 0, 255)
pap = pap * (1 - 0.10 * t[..., None])
# Under the seal there is no lace to copy, so continue each edge's lace from further up that edge.
# The scallops repeat every ~17.6px along the edge; shifting by five repeats keeps them in step.
K = 17.6 * 5
def unit(p, q):
    v = np.array(q, np.float32) - np.array(p, np.float32); return v / np.linalg.norm(v)
uL, uR = unit((63, 223.7), (225.4, 417)), unit((422, 235.5), (246, 417))
dL, dR = _ld((63, 223.7), (225.4, 417)), _ld((422, 235.5), (246, 417))
useL = dL <= dR
mx = (xx - np.where(useL, uL[0], uR[0]) * K).astype(np.float32)
my = (yy - np.where(useL, uL[1], uR[1]) * K).astype(np.float32)
region = (circle_alpha(SEAL_C, SEAL_R + 3) > 0) & (pa > 0)
A_back = A.copy(); a_back = pa_lace.copy()
A_back[region] = cv2.remap(A, mx, my, cv2.INTER_LINEAR)[region]
a_back[region] = (cv2.remap(pa_lace, mx, my, cv2.INTER_LINEAR) * pa)[region]
back = (A_back.astype(np.float32) * band[..., None] + pap * (1 - band[..., None]))
back = np.clip(back, 0, 255).astype(np.uint8)
save('flap-back', cv2.flip(back, 1), cv2.flip(a_back, 1))     # mirrored: the face is shown with rotateY(180deg)

# previews: closed composite must equal the cover inside the envelope; open preview for eyeballing
def over(dst, bgr, a):
    return dst * (1 - a[..., None]) + bgr.astype(np.float32) * a[..., None]
c = A.astype(np.float32)
c = over(c, col, inner * envm); c = over(c, body_px, envm * (1 - pa)); c = over(c, A, np.clip(pa - pa_lace, 0, 1) * (1 - sa)); c = over(c, A, flap_a)
diff = np.abs(c - A).max(axis=2)
print('closed max diff', diff.max(), 'pixels >2:', int((diff > 2).sum()))
o = A.astype(np.float32)
o = over(o, col, inner * envm); o = over(o, body_px, envm * (1 - pa))
cv2.imwrite(f'{src}/open_preview.png', cv2.resize(o[180:480, 40:440].astype(np.uint8), None, fx=3, fy=3, interpolation=cv2.INTER_NEAREST))
bp = back.astype(np.float32) * a_back[..., None] + 90 * (1 - a_back[..., None])
cv2.imwrite(f'{src}/back_preview.png', cv2.resize(bp[300:430, 150:330].astype(np.uint8), None, fx=4, fy=4))

v = A.copy(); m = (pa_lace > .5); v[m] = (v[m] * .45 + np.array([255, 0, 255]) * .55).astype(np.uint8)
cv2.imwrite(f'{src}/lace_vis.png', cv2.resize(v[200:430, 55:430], None, fx=3, fy=3, interpolation=cv2.INTER_NEAREST))
