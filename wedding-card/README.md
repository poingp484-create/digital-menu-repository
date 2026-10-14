# Melvet & Rockson · animated wedding invitation

A single-page invitation built from the two Canva pages: the sealed envelope (cover) and the invitation card. Tapping the envelope lifts the wax-sealed flap, the card slides out and pops forward, and a live countdown to the wedding appears beside it.

Static files only, no build step. Open `index.html`, or serve the folder:

```
cd wedding-card
python3 -m http.server 8000
# then visit http://localhost:8000
```

Any static host works (GitHub Pages, Netlify, Vercel). Upload the `wedding-card` folder as is.

## What happens

1. **Closed:** the cover exactly as designed. A soft ring pulses around the seal and a glint passes over it. On desktop the card tilts slightly with the mouse.
2. **Tap:** sparkles at the seal, then the lace flap swings open in 3D, seal and all. Its back shows the paper inside with the lace edge.
3. The invitation slides up out of the envelope, then pops forward to the centre while the envelope sinks away.
4. **Inside:** the card, plus a countdown (days, hours, minutes, seconds) styled like the card's "28 NOV" pill, "Get directions", "Save the date" (Google Calendar) and "Open the envelope again".

"Click HERE for location" on the card is a real link to Google Maps.

With *reduce motion* turned on, the page skips the 3D and fades straight to the card.

## The artwork is unchanged

`cover.webp` and `invite.webp` are pixel-exact crops of the Canva pages, saved lossless. Nothing was recoloured, retouched or upscaled.

To animate the envelope, `tools/make_layers.py` cuts the cover into layers (`flap`, `body`, `margin`, `interior`, `flap-back`). The closed envelope is always the untouched cover image. The layers only appear once it's tapped. The only new pixels are ones that are never visible in the original: the inside of the envelope, the back of the flap, and the patch of envelope under the seal.

## Settings

At the top of `assets/js/card.js`:

- `WEDDING`: the countdown target. It's set to **Saturday 28 November 2026, 4:30 PM India time** (the Holy Mass).
- `VENUE`, `MAP_URL`: used by both map links.
- `CAL_URL`: the "Save the date" event, 4:30 PM to 10:30 PM IST. Change the end time if needed.

After the target time passes, the countdown shows zeros and the title changes to "Today we say I do", then "Happily ever after".

## Image quality

The pages came from screenshots at about 460 px wide, so they look soft on high-density phone screens. For sharper results, download both pages from Canva as PNG and replace `assets/img/cover.webp` and `assets/img/invite.webp`. The envelope layers are measured from the current cover, so they need regenerating with the scripts in `tools/` (the coordinates there would need re-measuring for a new export).

## Files

```
index.html             page structure
assets/css/card.css    styles (palette tokens at the top)
assets/js/card.js      opening sequence, countdown, sparkles, replay
assets/img/            cover and card (pixel-exact) + envelope layers
tools/                 scripts that produced the layers (Python, OpenCV)
```

Fonts: Pinyon Script and Cormorant Garamond from Google Fonts.
