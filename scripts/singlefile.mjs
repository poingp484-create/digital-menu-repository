/**
 * Builds the whole site into ONE self-contained HTML file (dist-single/yakuza.html):
 * JS, CSS, fonts, the logo and every product photo are embedded, so it opens with a
 * double-click — no server, no folders. (Google Fonts for the Japanese glyphs still
 * load from the web when online.)
 */
import { build } from 'vite';
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dist-single';
await build({
  configFile: false, // vite.config.js splits chunks; here everything goes into one
  base: './',
  logLevel: 'warn',
  build: {
    target: 'es2020',
    outDir: OUT,
    emptyOutDir: true,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER, // fonts + logo → data: URIs
    cssCodeSplit: false,
    modulePreload: false,
    copyPublicDir: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});

const assets = join(OUT, 'assets');
const files = readdirSync(assets);
const jsFile = files.find((f) => f.endsWith('.js'));
const cssFile = files.find((f) => f.endsWith('.css'));
let js = readFileSync(join(assets, jsFile), 'utf8');
const css = cssFile ? readFileSync(join(assets, cssFile), 'utf8') : '';

// product photos live in public/ and are referenced by path — embed each one
const dataUri = (p) => `data:image/webp;base64,${readFileSync(p).toString('base64')}`;
for (const f of readdirSync('public/products').filter((f) => f.endsWith('.webp'))) {
  js = js.split(`products/${f}`).join(dataUri(join('public/products', f)));
}
const left = js.match(/products\/[\w-]+\.webp/g);
if (left) throw new Error('unembedded product images: ' + [...new Set(left)].join(', '));
if (/assets\/[\w-]+\.(woff2?|webp|png|jpg)/.test(js + css)) throw new Error('an asset was not inlined');

let html = readFileSync(join(OUT, 'index.html'), 'utf8');
html = html
  .replace(/\s*<script type="module"[^>]*src="[^"]+"><\/script>/, '')
  .replace(/\s*<link rel="stylesheet"[^>]*href="[^"]+">/, '')
  // function replacer: the minified JS contains "$'" / "$&", which a string replacement would expand
  .replace('</head>', () => `<style>${css}</style>\n<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>\n</head>`);

// the README rides along at the top of the file
const readme = readFileSync('README.md', 'utf8').replaceAll('-->', '—>');
html = html.replace('<!doctype html>', () => `<!doctype html>\n<!--\n${readme}\n-->`);

const out = join(OUT, 'yakuza.html');
writeFileSync(out, html);
rmSync(assets, { recursive: true });
rmSync(join(OUT, 'index.html'));
console.log(out, (html.length / 2 ** 20).toFixed(1), 'MB');
