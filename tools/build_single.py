# build_single.py REPO OUT.html : one self-contained file (CSS, fonts, JS and every image inlined)
import sys, re, base64, json, pathlib
repo, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
html = (repo / "index.html").read_text()
css = (repo / "assets/css/site.css").read_text()
b64 = lambda p: base64.b64encode(p.read_bytes()).decode()
css = re.sub(r'url\("(\.\./fonts/[^"]+)"\) format\("woff2"\)(, url\("https://fonts\.gstatic\.com/[^"]+"\) format\("woff2"\))?',
             lambda m: 'url("data:font/woff2;base64,' + b64((repo / "assets/css" / m.group(1)).resolve()) + '") format("woff2")', css)
assert "../fonts/" not in css
assets = {p.name: "data:image/webp;base64," + b64(p) for p in sorted((repo / "assets/shoes").glob("*.webp"))}
html = re.sub(r'\s*<link rel="preload"[^>]*>', '', html)
html = html.replace('<link rel="stylesheet" href="assets/css/site.css">', '<style>\n' + css + '\n</style>')
scripts = re.findall(r'<script src="([^"]+)"></script>', html)
html = re.sub(r'<script src="assets/js/data\.js"></script>', lambda m: '<script>window.SOLEMN_ASSETS = ' + json.dumps(assets) + ';</script>\n<script>\n' + (repo / "assets/js/data.js").read_text() + '\n</script>', html)
for s in scripts[1:]:
    html = html.replace(f'<script src="{s}"></script>', '<script>\n' + (repo / s).read_text() + '\n</script>')
# Pre-render the home page into <main> so phone file previews that never run scripts still show every pair.
# The static copy uses the small images (both srcset slots) to keep the file light; scripts replace it on load.
import subprocess, tempfile
small = {k: (assets[k.replace('.webp', '-sm.webp')] if not k.endswith(('-sm.webp', '-blur.webp')) else v) for k, v in assets.items()}
small = {k: ('data:image/gif;base64,R0lGODlhAQABAAAAACw=' if k.endswith('-blur.webp') else v) for k, v in small.items()}
with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as t: json.dump(small, t)
home = subprocess.run(['node', str(pathlib.Path(__file__).parent / 'prerender.js'), str(repo), t.name], capture_output=True, text=True, check=True).stdout
home = re.sub(r' srcset="[^"]*"', '', home)  # one embedded copy per image is enough for the preview
assert html.count('<main id="main" tabindex="-1"></main>') == 1
html = html.replace('<main id="main" tabindex="-1"></main>', '<main id="main" tabindex="-1">' + home + '</main>')
assert 'src="assets/' not in html and 'href="assets/' not in html
out.write_text(html)
print(f"{out.name}: {len(html)//1024} KB, {len(assets)} images inlined")
