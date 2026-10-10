# Speedcat Store

A concept store for the PUMA Speedcat. Not affiliated with PUMA; prices are placeholders and checkout is disabled.

## Files
- `src/store.html` — the editable source: all layout, styles and code. Product data (names, prices, copy, zoom views) is in the `PRODUCTS` array near the top of the script.
- `images/` — cut-out product photos (WebP). Keys: black, red, cream, navy, leopard, denim, blue, oliveP.
- `build.py` — inlines the images into `src/store.html` and writes `dist/index.html`.
- `dist/index.html` — the finished, single-file store (open it in a browser).
- `dist/campaign.html` — the earlier cinematic campaign page.

## Build
```
pip install pillow
python build.py
```
Then open `dist/index.html`.

## Pages
Hash routes: `#/` home, `#/shop`, `#/shop/dark|light|statement|suede`, `#/p/<slug>` product pages. The bag is saved in localStorage.
