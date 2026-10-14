# One self-contained HTML file: CSS, JS and every image inside it (images become blob: URLs at load).
import re, base64, os, json
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + '/'
out = root + 'share/melvet-rockson-invitation.html'
html = open(root + 'index.html').read()
css = open(root + 'assets/css/card.css').read()
js = open(root + 'assets/js/card.js').read()

# backdrop images are set from the asset map instead of CSS urls
css = re.sub(r'\.backdrop-layer--cover \{ background-image: url\("\.\./img/cover\.webp"\); \}\n', '', css)
css = css.replace('.backdrop-layer--invite { background-image: url("../img/invite.webp"); opacity: 0; }', '.backdrop-layer--invite { opacity: 0; }')
assert '../img/' not in css, 'stray image url in CSS'

html = re.sub(r'<link rel="preload" as="image"[^>]*>\n', '', html)
html = html.replace('<link rel="stylesheet" href="assets/css/card.css">', '<style>\n' + css + '</style>')
html = re.sub(r'\n<noscript>.*?</noscript>\n', '\n', html, flags=re.S)
names = sorted(set(re.findall(r'src="assets/img/([\w-]+)\.webp"', html)) | {'cover', 'invite'})
html = re.sub(r'src="assets/img/([\w-]+)\.webp"', r'data-asset="\1"', html)

assets = {n: base64.b64encode(open(root + 'assets/img/%s.webp' % n, 'rb').read()).decode() for n in names}
loader = '''<script>
/* Images are stored in this file; turn them into blob URLs once and hand them to the page */
(function () {
  var A = %s;
  var urls = {};
  Object.keys(A).forEach(function (k) {
    var bin = atob(A[k]), buf = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    urls[k] = URL.createObjectURL(new Blob([buf], { type: "image/webp" }));
    A[k] = null;
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-asset]"), function (img) { img.src = urls[img.getAttribute("data-asset")]; });
  var c = document.querySelector(".backdrop-layer--cover"), v = document.querySelector(".backdrop-layer--invite");
  if (c) c.style.backgroundImage = "url(" + urls.cover + ")";
  if (v) v.style.backgroundImage = "url(" + urls.invite + ")";
})();
</script>''' % json.dumps(assets)
html = html.replace('<!--CONTENT-END-->\n<script src="assets/js/card.js" defer></script>', loader + '\n<script>\n' + js + '</script>')
assert 'assets/' not in html.replace('data-asset', ''), 'stray asset path'
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w').write(html)
print(out, round(os.path.getsize(out) / 1e6, 2), 'MB', names)
