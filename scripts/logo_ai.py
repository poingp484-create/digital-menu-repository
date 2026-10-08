import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
im = Image.open('images/14.webp').convert('RGB')
W, H = im.size
mask = remove(im, session=new_session('birefnet-general'), only_mask=True, post_process_mask=False)
mask.save('scratchpad/logo-mask.png')
m = np.asarray(mask).astype(np.float32) / 255
print('mask mean', m.mean())
