# Gokudo

Website for Gokudo, a Japanese omakase counter and robata grill. Built with Next.js (App Router), Tailwind CSS v4, Motion and Phosphor icons.

## Pages

- `/` home: hero, omakase and à la carte, signature dishes, robata, chef note, the room, visit info
- `/menu` full menu with category navigation and dietary filters
- `/reserve` reservation request form (posts to `/api/reservations`)
- `/story` the restaurant's approach to rice, fish and fire

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Editing content

- `src/content/site.ts` address, phone, email, hours, seatings, chef name
- `src/content/menu.ts` menu sections, dishes, prices and dietary tags
- `src/content/media.ts` every image and video slot, with the Higgsfield prompt used to make it

The address, phone, chef name, prices and story copy are samples. Replace them before launch.

## Images and video

Each slot in `src/content/media.ts` maps to a file in `public/media/`. Until a file exists, the site shows a striped placeholder labeled with the expected file name. Drop in the file (same name) and rebuild.

- Stills: `.webp`, generated with Higgsfield `gpt_image_2_5` at the listed ratio
- Loops: `hero.mp4` and `robata.mp4`, generated with Higgsfield `kling3_0` (sound off) from the matching still

## Reservations

`src/app/api/reservations/route.ts` validates requests but only logs them. Connect it to your booking system or email before going live.
