# SOLEMN: footwear for the odd few

A premium, experimental storefront for nine niche pairs: airbrushed customs, metallic boots, chained heels, collage lace-ups and more. It's a static site with no build step and no dependencies.

## Run it

Open `index.html` in a browser, or serve the folder (recommended, so fonts preload properly):

```
python3 -m http.server 8000
# then visit http://localhost:8000
```

Any static host works: GitHub Pages, Netlify, Vercel, S3, and so on. Upload the folder as is.

## Pages

Routing uses the URL hash, so deep links work on any static host.

| Route | Page |
| --- | --- |
| `#home` | Intro, hero, four featured spreads, the line-up, explore by silhouette, story teaser. Each pair appears once |
| `#shop`, `#shop-low`, `#shop-high`, `#shop-boot`, `#shop-turf`, `#shop-laceup`, `#shop-heel` | Index list with silhouette and finish filters, sort, and a live preview |
| `#p-<slug>` | Product page: the whole pair, click to look closer, sizes, add to bag |
| `#story` | Five editorial chapters, each with a different pair shown whole |

The bag is a slide-out drawer. It's saved in `localStorage`, so it survives reloads.

## Editing products

Everything lives in `assets/js/data.js`. Each pair has its name, silhouette, finishes, accent colour (`ink`), colourway and what the photo shows (`observed`). Image sizes (`w`, `h`) are written by the export step and must match the files. To change which pairs the home page features, edit the slug lists at the top of `home()` in `assets/js/views.js`.

**Placeholders:** `price` is `null` and shows as "Price TBC". Brand is not stated anywhere. The EU 38–46 size run is labelled as a placeholder. Set real values in `data.js` and the UI picks them up (a numeric `price` renders as £).

## What is not connected

- **Checkout / payments.** There's no backend or payment provider. The Checkout button is disabled and says so.
- **Stock.** Sizes are selectable, but availability isn't known or checked.

## Files

```
index.html               shell: intro, nav, menu, footer, bag drawer
assets/css/site.css      all styles (tokens at the top)
assets/js/data.js        catalogue data and placeholders
assets/js/store.js       bag state (localStorage, guarded)
assets/js/motion.js      reveals, word splits, parallax, pointer depth, accent changes
assets/js/views.js       page templates and per-page interactions
assets/js/app.js         router, page transitions, nav, menu, bag, toast, cursor label, intro
assets/shoes/            approved cutouts: full size, -sm (480w), -blur (64w reveal placeholder)
assets/fonts/            Anybody, Geist, Martian Mono (variable, latin subset, SIL OFL)
cutout-review/           the cutout approval gallery, plus lossless PNG masters
```

## Motion and performance notes

- Only `transform` and `opacity` animate. Blur-to-focus cross-fades from a 64px copy of the cutout (about 2 KB), so no CSS filter is ever animated.
- Parallax maths runs once per frame, and only for layers currently in view. Every page's observers and listeners are torn down when you leave it.
- Images carry their dimensions (zero layout shift measured), are lazy-loaded below the fold, and are served at 480w on small screens.
- `prefers-reduced-motion` skips the intro and page wipes and shows everything at once.
- The intro plays once per browser session, only when landing on home. Click, scroll or press any key to skip it.

## Cutouts

All nine photos were segmented with BiRefNet-general. For the four newer pairs it was compared against BiRefNet-massive, BiRefNet-DIS, BRIA RMBG and a median of the models, region by region. The others either left a 1px pale fringe from light backdrops or kept floor inside lace loops. Each cutout was cleaned of stray fragments, colour-decontaminated at the edges, checked at 4× zoom on dark, light and blue grounds, and independently inspected. No colours were changed, nothing was upscaled and no details were painted in. Known limits are noted in `cutout-review/index.html`: a few laces and one collar run off the original photo frame, and several pairs come from low-resolution sources.
