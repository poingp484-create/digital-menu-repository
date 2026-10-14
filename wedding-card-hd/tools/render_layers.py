# Render page 1 of the Canva PDF as separate transparent layers by keeping only chosen
# drawing groups of its content stream (indices read from the stream; see split.py).
import sys, subprocess, os
import pypdf
from pypdf.generic import ContentStream

src, outdir, dpi = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(outdir, exist_ok=True)

def build(keep_top, keep_text_children=None):
    reader = pypdf.PdfReader(src)
    page = reader.pages[0]
    cs = ContentStream(page.get_contents(), reader)
    ops = cs.operations
    names = [op.decode() if isinstance(op, bytes) else op for _, op in ops]
    def end(s):
        d = 0
        for i in range(s, len(names)):
            if names[i] == 'q': d += 1
            elif names[i] == 'Q':
                d -= 1
                if d == 0: return i
    new = ops[0:2]
    for (a, b) in keep_top:
        if (a, b) == (152, 643) and keep_text_children is not None:
            new += ops[152:156]
            i = 156
            while i < 643:
                j = end(i)
                if any(lo <= i <= hi for lo, hi in keep_text_children):
                    new += ops[i:j + 1]
                i = j + 1
            new += [ops[643]]
        else:
            new += ops[a:b + 1]
    new += [ops[644]]
    cs.operations = new
    page.replace_contents(cs)
    w = pypdf.PdfWriter(); w.add_page(page)
    return w

BGFILL, PHOTO, STRIP, ENV, NAMES, SEAL, TEXTS = (2, 17), (33, 46), (47, 79), (80, 94), (95, 136), (137, 151), (152, 643)
FILL2 = (18, 32)
variants = {
    'bg': ([BGFILL, FILL2, PHOTO, STRIP, NAMES], None, False),
    'env': ([ENV], None, True),
    'seal': ([SEAL, TEXTS], [(361, 642)], True),          # wax seal, RM monogram, "You are invited !"
    'click': ([TEXTS], [(156, 360)], True),               # "Click to open" and its shadow
}
for name, (top, kids, transp) in variants.items():
    w = build(top, kids)
    p = os.path.join(outdir, name + '.pdf')
    with open(p, 'wb') as fh: w.write(fh)
    args = ['pdftocairo', '-png', '-singlefile', '-r', dpi] + (['-transp'] if transp else []) + [p, os.path.join(outdir, name)]
    subprocess.run(args, check=True)
    print('rendered', name)
# the full pages
subprocess.run(['pdftocairo', '-png', '-r', dpi, '-f', '1', '-l', '1', '-singlefile', src, os.path.join(outdir, 'cover')], check=True)
subprocess.run(['pdftocairo', '-png', '-r', dpi, '-f', '2', '-l', '2', '-singlefile', src, os.path.join(outdir, 'invite')], check=True)
