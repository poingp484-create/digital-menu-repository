import cv2, numpy as np
E = cv2.imread('r128/env.png', cv2.IMREAD_UNCHANGED)
X0, Y0 = 240, 447
C = E[Y0:Y0 + 704, X0:X0 + 989]
L = C[..., :3].astype(np.float32).mean(axis=2)
H, W = L.shape
# local paper level: a wide median ignores the thin lace
bgL = cv2.medianBlur(np.clip(L, 0, 255).astype(np.uint8), 61).astype(np.float32)
rel = cv2.blur(L, (2, 2)) - bgL
rect = np.zeros((H, W), np.uint8); rect[10:695, 10:980] = 1
core = np.load('flapmask.npy')            # the bright flap paper and lit lace found before
band = cv2.dilate(core, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (71, 71))) & rect
lace = ((rel > 10) & (band > 0)).astype(np.uint8)
m = (core | lace).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
n, lab = cv2.connectedComponents(m)
m = (lab == lab[150, 500]).astype(np.uint8)
inv = (1 - m).astype(np.uint8); n2, l2 = cv2.connectedComponents(inv)
border = set(np.unique(np.concatenate([l2[0], l2[-1], l2[:, 0], l2[:, -1]])))
m[(~np.isin(l2, list(border))) & (inv > 0)] = 1
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
c = max(cnts, key=cv2.contourArea)
m2 = np.zeros_like(m); cv2.drawContours(m2, [c], -1, 1, -1)
hull = cv2.convexHull(c); hm = np.zeros_like(m); cv2.fillPoly(hm, [hull], 1)
ys, xs = np.where(m2 > 0)
print('flap bbox', xs.min(), ys.min(), xs.max(), ys.max(), 'area', int(m2.sum()), 'hull', int(hm.sum()))
np.save('flapmask2.npy', m2); np.save('hullmask2.npy', hm)
vis = cv2.cvtColor(C, cv2.COLOR_BGRA2BGR).copy()
sel = m2 > 0; vis[sel] = (vis[sel] * 0.55 + np.array([255, 0, 255]) * 0.45).astype(np.uint8)
mg = (hm > 0) & (m2 == 0); vis[mg] = (vis[mg] * 0.5 + np.array([0, 200, 0]) * 0.5).astype(np.uint8)
cv2.imwrite('flapvis.png', vis)
cv2.imwrite('flapvis_tip.png', cv2.resize(vis[400:560, 360:640], None, fx=3, fy=3, interpolation=cv2.INTER_NEAREST))

# Clip to straight lines through the outermost scallop tips on each side
rows = np.arange(140, 430)
lx = np.array([np.argmax(m2[y] > 0) for y in rows], np.float32)
rx = np.array([W - 1 - np.argmax(m2[y, ::-1] > 0) for y in rows], np.float32)
def outer_line(xv, sign):
    A = np.vstack([rows, np.ones_like(rows)]).T.astype(np.float32)
    k, b = np.linalg.lstsq(A, xv, rcond=None)[0]
    res = xv - (k * rows + b)
    b += (res.min() if sign < 0 else res.max())   # shift to touch the outermost tips
    return k, b
kl, bl = outer_line(lx, -1); kr, br = outer_line(rx, +1)
print('left x = %.4f*y + %.2f   right x = %.4f*y + %.2f' % (kl, bl, kr, br))
yy, xx = np.mgrid[0:H, 0:W]
inside = (xx >= kl * yy + bl - 2) & (xx <= kr * yy + br + 2)
m3 = (m2 > 0) & inside
m3 = m3.astype(np.uint8)
cnts, _ = cv2.findContours(m3, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
c = max(cnts, key=cv2.contourArea); m3 = np.zeros_like(m3); cv2.drawContours(m3, [c], -1, 1, -1)
hull = cv2.convexHull(c); hm3 = np.zeros_like(m3); cv2.fillPoly(hm3, [hull], 1)
np.save('flapmask3.npy', m3); np.save('hullmask3.npy', hm3)
print('final area', int(m3.sum()), 'hull', int(hm3.sum()))
vis = cv2.cvtColor(C, cv2.COLOR_BGRA2BGR).copy()
sel = m3 > 0; vis[sel] = (vis[sel] * 0.55 + np.array([255, 0, 255]) * 0.45).astype(np.uint8)
mg = (hm3 > 0) & (m3 == 0); vis[mg] = (vis[mg] * 0.5 + np.array([0, 200, 0]) * 0.5).astype(np.uint8)
cv2.imwrite('flapvis3.png', vis)
cv2.imwrite('flapvis3_tl.png', cv2.resize(vis[0:200, 0:220], None, fx=3, fy=3, interpolation=cv2.INTER_NEAREST))
