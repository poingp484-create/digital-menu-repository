# YAKUZA — Drop 01 / The Blacklist

An interactive Y2K streetwear campaign that happens to be a store. Liquid-chrome
logotype, a living WebGL city at dusk, scroll-choreographed product scenes and a
Need for Speed: Most Wanted–style pursuit vibe (blacklist ranks, heat, bounty, police strobes).

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static output in dist/ (relative paths — host anywhere)
npm run preview
```

## Experience

| # | Section | What happens |
|---|---------|--------------|
| 01 | Intro | Custom vector logotype rendered as liquid chrome in WebGL; cursor is a moving light; glitch bursts. Scrolling splits the letters, the camera flies through them toward the #01 piece, the mark lands in the nav corner. |
| 02 | The Blacklist | Manifesto, spray tag, outlined marquee. |
| 03–06 | Jackets / Tees / Shoes / Jewelry | One pinned stage per district. Every product is a full-viewport scene with its own entrance + exit (slide-rotate, rise-scale, motion blur, behind-type, camera pull, slice scan, glitch, ghost echo, 3D spin, bounce drop, light sweep, drift, pendulum, coin flip, far spin, toss). Scenes overlap so the scroll never "cuts". |
| 07 | Most Wanted | Pursuit mode: strobes, heat 5, 3D turn, wired call-outs, bounty counter. |
| 08 | Statement | Three lines in the fog. |
| 09 | Footer | Mark + four links. |

Plus: custom cursor (VIEW PIECE / link states), magnetic buttons, ₹ / $ / ¥ currency,
bag (localStorage), SHOP = the Blacklist index with hover previews, product overlay with sizes,
game-style HUD (scroll speed in km/h, heat, route progress).

## Editing content

Everything lives in **`src/data/products.js`** — names, prices (INR/USD/JPY), specs, copy,
image path and which animation presets each piece uses. See `public/products/README.md`
for dropping in real photography. Section looks (fog / accent / heat) are in `src/data/themes.js`.

## Structure

```
src/
  brand/logo.js        custom logotype geometry (SVG + WebGL atlas source)
  webgl/               stage (bg + chrome logo + hero piece), shaders, logo atlas
  sections/            hero, manifesto, category (+ choreo presets), featured, statement, footer, boot
  ui/                  nav, hud, cursor, magnetic, bag, piece overlay, index, store, toast
  art/renders.js       procedural placeholder product renders (SVG)
  core/                device tiering, shared state, scroll (Lenis + ScrollTrigger), text split
  styles/              base, chrome-ui, sections, scenes, overlays, responsive, fonts
```

## Performance notes

- Single WebGL canvas; the background shader renders into a 30–50% resolution target and is upscaled.
- Quality tiers (`high` / `mid` / `low`) from device hints, plus a runtime FPS monitor that downgrades DPR, resolution and noise octaves.
- Logo meshes stop rendering once the hero is passed; per-frame DOM work only touches the active scene.
- Touch devices use native scroll (no smooth-scroll hijack) and an autonomous sway instead of cursor tilt.
- `prefers-reduced-motion` swaps choreography for fades and disables smooth scrolling.
- Fonts are self-hosted (Fontsource); Japanese glyphs load lazily after boot.

Checkout is intentionally not wired — connect your payment provider in `src/ui/bag.js`.
