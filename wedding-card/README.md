# Melvet & Rockson · animated wedding invitation

A single-page invitation in the same format and palette as the original Canva pages, redrawn entirely in code so it stays sharp on every screen. Tapping the envelope lifts the wax-sealed flap, the card slides out and pops forward, and a live countdown to the wedding appears beside it.

Static files only: no images, no build step. Open `index.html`, or serve the folder:

```
cd wedding-card
python3 -m http.server 8000
# then visit http://localhost:8000
```

Any static host works (GitHub Pages, Netlify, Vercel). Upload the `wedding-card` folder as is.

## What's on the page

- **Cover:** draped ivory silk with a tulle weave and lace rosettes, a powder-blue damask ribbon edged in lace, and an ivory envelope with a lace-trimmed flap reading "You are invited !". A navy wax seal carries a silver RM monogram. The names are set below in a flourished script.
- **Opening:** the seal sparkles, the flap swings open in 3D to show a damask lining, and the card rises out of the envelope, then pops forward while the envelope sinks away.
- **Card:** the verse, names, the SAT · 28 NOV · 7 PM date pill, Holy Mass and church details, the palette swatches and a line drawing of the couple, all as live text. "Click HERE for location" opens Google Maps.
- **Countdown:** days, hours, minutes and seconds, styled like the date pill, with "Get directions", "Save the date" (Google Calendar) and "Open the envelope again".

With *reduce motion* turned on, the page skips the 3D and fades straight to the card.

## How it's drawn

- Silk: a height field of soft folds, lit and painted onto a canvas at load (`paintSatin` in `card.js`).
- Lace: generated SVG paths with pierced eyelets (`laceEdge`), used on the flap, the ribbon edges and the rosettes.
- Wax seal: an irregular SVG blob with layered gradients and an engraved silver monogram (`seal`).
- Damask: one SVG tile in `card.css` (`--damask`), reused for the ribbon, the card, the backdrop and the envelope lining.
- The couple drawing is inline SVG in `index.html`.

## Settings

At the top of `assets/js/card.js`:

- `WEDDING`: the countdown target. It's set to **Saturday 28 November 2026, 4:30 PM India time** (the Holy Mass).
- `VENUE`, `MAP_URL`: used by both map links.
- `CAL_URL`: the "Save the date" event, 4:30 PM to 10:30 PM IST. Change the end time if needed.

After the target time passes, the countdown shows zeros and the title changes to "Today we say I do", then "Happily ever after".

Colours are tokens at the top of `assets/css/card.css`. Fonts are Monsieur La Doulaise, Pinyon Script, Italianno and Cormorant Garamond from Google Fonts.

## Files

```
index.html             page structure, envelope SVG, card and couple drawing
assets/css/card.css    styles, palette tokens and the damask and tulle tiles
assets/js/card.js      silk, lace and seal drawing; opening sequence; countdown; sparkles
```
