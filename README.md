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

## Vengeance UI components

Two components from [Vengeance UI](https://www.vengenceui.com/) live in `src/components/ui/`:

- `share-sheet.tsx` on `/menu` (via `src/components/menu/ShareMenu.tsx`): copy link, share, or show and download a QR code for the menu
- `staggerText.tsx` on the home hero heading: word-by-word reveal

`components.json` registers the `@vengeanceui` registry, so more can be added with:

```bash
npx shadcn@latest add @vengeanceui/<component-name>
```

The share sheet ships its own styles. The "Vengeance UI Share Sheet" block in `src/app/globals.css` maps it onto the Gokudo tokens (square corners, one accent, light and dark), so leave the component file as-is and adjust that block instead.

## Reservations

`src/app/api/reservations/route.ts` validates requests but only logs them. Connect it to your booking system or email before going live.
