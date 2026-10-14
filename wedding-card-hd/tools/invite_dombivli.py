# Page 2 without "Click HERE for location" (its text glyphs and their shadow image), rendered at 1440 x 2560.
import sys, subprocess
import pypdf
from pypdf.generic import ContentStream
src, outpng = sys.argv[1], sys.argv[2]
r = pypdf.PdfReader(src)
page = r.pages[1]
cs = ContentStream(page.get_contents(), r)
ops = cs.operations
names = [o.decode() if isinstance(o, bytes) else o for _, o in ops]
def end(s):
    d = 0
    for i in range(s, len(names)):
        if names[i] == 'q': d += 1
        elif names[i] == 'Q':
            d -= 1
            if d == 0: return i
# the shadow image X55 starts the run; glyph groups in font F57 (The Seasons) follow it
start = next(i for i in range(len(ops)) if names[i] == 'Do' and str(ops[i][0][0]) == '/X55')
while names[start] != 'q': start -= 1
i, stop = start, start
while True:
    j = end(i)
    seg = ops[i:j + 1]
    is_shadow = any(n == 'Do' and str(a[0]) == '/X55' for a, n in ((a, (o.decode() if isinstance(o, bytes) else o)) for a, o in seg))
    is_f57 = any((o.decode() if isinstance(o, bytes) else o) == 'Tf' and str(a[0]) == '/F57' for a, o in seg)
    if not (is_shadow or is_f57): break
    stop = j; i = j + 1
    if names[i] != 'q': break
print('removing ops', start, '..', stop, '(%d ops)' % (stop - start + 1))
cs.operations = ops[:start] + ops[stop + 1:]
page.replace_contents(cs)
w = pypdf.PdfWriter(); w.add_page(page)
with open('/tmp/_p2.pdf', 'wb') as fh: w.write(fh)
subprocess.run(['pdftocairo', '-png', '-singlefile', '-r', '128', '/tmp/_p2.pdf', outpng[:-4]], check=True)
