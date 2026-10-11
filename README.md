# YAKUZA — Drop 01 · The Blacklist

An interactive Y2K streetwear campaign site inspired by *Need for Speed: Most Wanted*:
a chrome katana logo, a living WebGL city at night with police sirens, a yozakura tree,
and 20 products, each with its own scroll-driven scene.

**Live:** https://poingp484-create.github.io/digital-menu-repository/

## Features

- **WebGL stage (Three.js):** custom GLSL shaders for the fog, skyline, light trails and
  red/blue police sirens (fast on the hero, slowing once you scroll). Six background moods
  via the **FILTER** switch in the HUD.
- **Chrome logo:** the katana logo is sliced into six shader-lit strips with cursor glints,
  light sweeps and glitch bursts.
- **Procedural sakura:** a canvas-painted yozakura tree and GPU petal particles.
- **Scroll choreography (GSAP ScrollTrigger + Lenis):** pinned, scrubbed scenes for five
  districts (Jackets, T-Shirts, Denim, Shoes, Headgear) and *Most Wanted*. Every product
  has its own entrance and exit; the hero flies through to the #01 piece.
- **Shopping:** product overlay with sizes, a bag (localStorage), ₹ / $ / ¥ prices, and a
  hide-away side nav.
- **Details:** custom cursor, magnetic buttons, synthesized Web Audio click sounds (SND
  toggle), a game-style HUD, adaptive quality on slower devices, a responsive mobile layout,
  and `prefers-reduced-motion` support.

Built with Three.js · GLSL · GSAP + ScrollTrigger · Lenis · Web Audio API · Vite

## Run and build

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # static site in dist/ (relative paths: host anywhere)
npm run build:pages    # static site in docs/ (what GitHub Pages serves)
npm run build:single   # ONE self-contained file: dist-single/yakuza.html
```

`build:single` embeds all the code, styles, fonts, the logo and every product photo in a
single HTML file that opens with a double-click: no server, no folders. Only the Google
Fonts used for the Japanese glyphs still load from the web.

## Publishing

GitHub Pages serves the `docs/` folder of this branch (**Settings → Pages → Deploy from a
branch → `/docs`**). After changing anything, run `npm run build:pages` and push.

To host the single file instead, upload `yakuza.html` (renamed to `index.html`) to any
static host or a new GitHub Pages repo.

## Editing content

- **Products:** `src/data/products.js` holds names, prices (INR/USD/JPY), specs, copy, image
  paths and which animation presets each piece uses. Photos go in `public/products/`.
- **Moods, siren speed, section colours:** `src/data/themes.js`.
- **Logo finish:** `src/brand/logo.js`.

## Structure

```
src/
  brand/        logo image + finishes
  webgl/        stage (background, chrome logo, hero piece), shaders, sakura
  sections/     hero, manifesto, category (+ choreo presets), featured, statement, footer, boot
  ui/           nav, hud, cursor, magnetic, bag, piece overlay, index, store, sound, toast
  core/         device tiering, shared state, scroll (Lenis + ScrollTrigger), text split
  styles/       base, chrome-ui, sections, scenes, overlays, responsive, fonts
public/         product photos, link-preview image, robots.txt, sitemap.xml
scripts/        artifact + single-file build helpers, image cut-out tools
docs/           built site for GitHub Pages
```

## Performance notes

- One WebGL canvas; the background shader renders at reduced resolution and is upscaled.
- Quality tiers (`high` / `mid` / `low`) from device hints, plus a runtime FPS monitor that
  steps the tier down live.
- Logo meshes stop rendering once the hero is passed; per-frame DOM work only touches the
  active scene; product photos decode during idle time.
- Touch devices use native scroll and an autonomous sway instead of cursor tilt.

Checkout is intentionally not wired up: connect a payment provider in `src/ui/bag.js`.
