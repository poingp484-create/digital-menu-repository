# St. Anthony's Bakery · Thane · Since 1940

A one-page website for St. Anthony's Bakery on Kolbad Road, Thane West. It's static HTML, CSS and JavaScript with no build step and no libraries. Fonts load from Google Fonts.

## Run it

Open `index.html`, or serve the folder:

```
python3 -m http.server 8000
# then visit http://localhost:8000
```

Any static host works (GitHub Pages, Netlify, Vercel). Upload this folder as it is.

## Sections

Opening curtain (logo draw, 1900 → 1940 counter) → hero (café photo, flour-dust particles, rotating "Since 1940" badge) → scrolling specialities strip → Our story → From the oven → The kitchen → Reviews → Visit, Reserve and Order → footer.

## Things to update

- **Partner links.** The EazyDiner, Zomato and Swiggy buttons point to each site's home page. Replace them with the bakery's own listing pages: search `index.html` for `data-link="eazydiner"`, `data-link="zomato"` and `data-link="swiggy"`.
- **Opening time.** Only the closing time (11 pm) is known, so the site says "Closes at 11 pm" and asks people to call. Add opening hours in the Visit section and the footer when you have them.
- **Kitchen photo.** `img/from-the-kitchen.webp` carries an "AI generated" watermark, so it's captioned "(illustration)". Swap it for a real dish photo and remove that caption.
- **Low-resolution photos.** `fruit-cake.webp` (141×101) and `from-the-kitchen.webp` (160×160) are very small, so they're shown as small polaroids. Larger originals would look sharper.

## Files

```
index.html       all content
css/style.css    styles (colour tokens at the top: pine, cream, brass)
js/main.js       loader, reveals, counters, parallax, marquee, reviews carousel, cursor, particles
img/             optimised WebP photos + og-storefront.jpg for link previews
```

## Motion and accessibility

- Visitors with "reduce motion" turned on skip the curtain and see everything still.
- If the script fails to load, a failsafe shows the full page without motion after a few seconds.
- Only `transform`, `opacity` and `clip-path` animate. The particles and marquee pause when they're off screen or the tab is hidden.
