# Melvet & Rockson · animated wedding invitation (HD, from the Canva PDF)

The same invitation as `wedding-card/` in its first version: tap the sealed envelope, the lace flap lifts with the wax seal, the card slides out and pops forward, and a live countdown appears beside it. This version is built from the Canva PDF export instead of screenshots, so every page is rendered at 1440 × 2560 and the envelope pieces come straight from the design's own layers.

Static files only, no build step. Open `index.html`, or serve the folder:

```
cd wedding-card-hd
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Where the images come from

The PDF keeps each element of page 1 as its own drawing group: background photo and ribbon, envelope, wax seal, RM monogram, "You are invited !" and "Click to open". `tools/render_layers.py` renders chosen groups on their own with a transparent background (Poppler's `pdftocairo`). Stacked back together they match the full page to within 2/255 per pixel.

| File | What it is |
| --- | --- |
| `cover.webp` | Page 1 exactly as exported. This is what you see before tapping. |
| `bg.webp` | Page 1 without the envelope, seal and envelope text. The pieces below sit on it once the envelope opens. |
| `flap.webp` | The lace flap with the seal, monogram and "You are invited !". It swings open. |
| `flap-back.webp` | The same flap mirrored, for its back face. |
| `body.webp` | The rest of the envelope, with its shadow. |
| `margin.webp` | The lace's shadow on the envelope. It fades as the flap lifts. |
| `click.webp` | "Click to open". It fades on tap. |
| `interior.webp` | The inside of the envelope, made from the flap's own paper texture. |
| `invite.webp` | Page 2, the card. |

`tools/flapmask.py` traces the lace edge on the envelope image, and `tools/make_layers.py` cuts and writes the layers. Run them in order from a working folder holding the PDF renders. They read `r128/*.png` and write the WebP files.

## Settings

At the top of `assets/js/card.js`:

- `WEDDING`: the countdown target, **Saturday 28 November 2026, 4:30 PM India time** (the Holy Mass).
- `VENUE`, `MAP_URL`: used by "Get directions" and by the church line on the card.
- `CAL_URL`: the "Save the date" event, 4:30 PM to 10:30 PM IST.

The tap area for "Click HERE for location" is `.invite-map` in `assets/css/card.css`, in percentages of the card.

## One-file version

`share/melvet-rockson-invitation.html` is the whole invitation in a single file: styles, script and every image inside it (about 2.8 MB). Upload it to any static host to get a shareable link, or open it directly in a browser. Rebuild it after changes with `python3 tools/build_single.py`.
