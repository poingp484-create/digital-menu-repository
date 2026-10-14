# Writes cover/invite and the layers from make_layers.py as lossless WebP into assets/img.
# Usage: python3 export_webp.py <dir with cover.png, invite.png> <layers dir> <assets/img>
import cv2, sys
crops, layers, out = sys.argv[1:4]
Q = [cv2.IMWRITE_WEBP_QUALITY, 101]  # 101 = lossless
for n in ('cover', 'invite'):
    im = cv2.imread(f'{crops}/{n}.png'); cv2.imwrite(f'{out}/{n}.webp', im, Q)
    assert (cv2.imread(f'{out}/{n}.webp') == im).all(), n
X0, X1, Y0, Y1 = 63, 422, 203, 458
for n in ('flap', 'body', 'interior', 'flap-back', 'margin'):
    im = cv2.imread(f'{layers}/{n}.png', cv2.IMREAD_UNCHANGED)
    if n == 'flap-back':
        im = cv2.flip(cv2.flip(im, 1)[Y0:Y1, X0:X1], 1)   # crop in sheet coordinates, then mirror inside the box
    else:
        im = im[Y0:Y1, X0:X1]
    im = im.copy(); im[im[..., 3] == 0, :3] = 0
    cv2.imwrite(f'{out}/{n}.webp', im, Q)
