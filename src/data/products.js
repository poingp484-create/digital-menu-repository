/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  YAKUZA — PRODUCT DATA
 * ─────────────────────────────────────────────────────────────────────────────
 *  Edit names, prices, copy and imagery here. Nothing else needs to change.
 *
 *  IMAGES
 *  - Every product needs a photo (transparent WebP in public/products/).
 *  - To use a real photo / render, drop the file in `public/products/` and set
 *    e.g. `image: 'products/kira-chrome-jacket.png'`.
 *    Best results: transparent PNG / WebP, product isolated, ~1600px tall,
 *    lit from the left. Apparel ≈ 4:5 portrait, shoes ≈ 10:7 landscape,
 *    jewelry ≈ square.
 *
 *  Photos live in public/products/ (cut out on transparent backgrounds).
 *
 *  CHOREOGRAPHY (each piece moves differently — see src/sections/choreo.js)
 *  - enter / exit : image animation presets
 *  - text         : how the name animates  (split | slide | stretch | blur | scramble)
 *  - layout       : composition            (left | right | split | bottom)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Price helper — INR, USD, JPY are set explicitly so each market can be tuned. */
const price = (INR, USD, JPY) => ({ INR, USD, JPY });

export const CATEGORIES = [
  {
    id: 'jackets',
    index: '03',
    title: 'JACKETS',
    jp: 'ジャケット',
    tag: 'outerwear',
    theme: 'jackets',
    district: 'DISTRICT 01 — DOCKS',
    blurb: 'Armour for the after-hours city.',
    products: [
      {
        id: 'thorn-crown-zip-hoodie',
        name: ['THORN CROWN', 'ZIP HOODIE'],
        jp: '茨の冠',
        price: price(6900, 85, 12800),
        specs: ['FAUX-FUR TRIM HOOD', 'HEAVY FLEECE / ACID GREY', 'THORN + CROSS PRINT'],
        description:
          'Heavy fleece washed to acid grey, a faux-fur trimmed hood and a crown of thorns printed across the chest. Zip it to the neck and disappear.',
        image: 'products/thorn-crown-zip-hoodie.webp',
        art: { type: 'jacket', variant: 'bomber' },
        enter: 'ghostEcho',
        exit: 'liftUp',
        text: 'scramble',
        layout: 'right',
      },
      {
        id: 'iron-clasp-bomber',
        name: ['IRON CLASP', 'BOMBER'],
        jp: '鉄の留金',
        price: price(13900, 169, 25400),
        specs: ['SILVER TOGGLE CLASPS', 'PANELLED BLACK SATIN', 'BLOOD-RED PIPING + LINING'],
        description:
          'A cropped black bomber cut into armour panels, fastened with silver toggle clasps and traced in blood-red piping. Heavy hardware, light on its feet.',
        image: 'products/iron-clasp-bomber.webp',
        art: { type: 'jacket', variant: 'bomber' },
        enter: 'cameraPull',
        exit: 'slideUp',
        text: 'stretch',
        layout: 'left',
      },
      {
        id: 'ash-fade-leather-jacket',
        name: ['ASH FADE', 'LEATHER JACKET'],
        jp: '灰',
        price: price(17900, 219, 32800),
        specs: ['HAND-FADED LAMBSKIN', 'BUCKLE-STRAP SHOULDERS', 'FRAYED RAW SEAMS'],
        description:
          'Lambskin faded by hand from black to ash, strapped across the shoulders and left frayed at every seam. Looks like it survived the crash.',
        image: 'products/ash-fade-leather-jacket.webp',
        art: { type: 'jacket', variant: 'leather' },
        enter: 'sliceReveal',
        exit: 'sliceOut',
        text: 'slide',
        layout: 'split',
      },
      {
        id: 'parade-white-leather-jacket',
        name: ['PARADE', 'WHITE LEATHER JACKET'],
        jp: '白騎',
        price: price(18900, 229, 34800),
        specs: ['BONE-WHITE NAPPA', 'DOUBLE-BREASTED, ASYMMETRIC ZIP', 'GUNMETAL BUTTONS + EPAULETTES'],
        description:
          'Bone-white nappa cut like a parade uniform: funnel collar, gunmetal buttons, epaulettes and an asymmetric zip over a flared, top-stitched hem. Clean enough to get dirty.',
        image: 'products/parade-white-leather-jacket.webp',
        art: { type: 'jacket', variant: 'chrome' },
        enter: 'drift',
        exit: 'driftOut',
        text: 'scramble',
        layout: 'right',
      },
      {
        id: 'oxblood-fur-collar-jacket',
        name: ['OXBLOOD', 'FUR COLLAR JACKET'],
        jp: '牛血',
        price: price(15900, 195, 29200),
        specs: ['FROSTED FAUX-FUR COLLAR', 'OXBLOOD BRUSHED TWILL', 'BUCKLED HEM + ZIP CUFFS'],
        description:
          'Brushed oxblood twill, a frosted faux-fur collar over a quilted lining, buckles at the hem and zips at the cuffs. Winter, but make it a getaway.',
        image: 'products/oxblood-fur-collar-jacket.webp',
        art: { type: 'jacket', variant: 'leather' },
        enter: 'dropBounce',
        exit: 'scaleThrough',
        text: 'split',
        layout: 'bottom',
      },
    ],
  },
  {
    id: 'tees',
    index: '04',
    title: 'T-SHIRTS',
    jp: 'Tシャツ',
    tag: 'heavyweight',
    theme: 'tees',
    district: 'DISTRICT 02 — NEON ROW',
    blurb: 'Oversized. Overprinted. Over midnight.',
    products: [
      {
        id: 'tora-ink-longsleeve',
        name: ['TORA', 'INK LONGSLEEVE'],
        jp: '猛虎',
        price: price(4900, 59, 8900),
        specs: ['HAND-INKED TIGER PRINT', '240 GSM WHITE JERSEY', 'CALLIGRAPHY + SEAL STAMPS'],
        description:
          'A tiger painted in one breath of ink, stalking across a white longsleeve and signed with red seal stamps. It looks ready to leave the shirt.',
        image: 'products/tora-ink-longsleeve.webp',
        art: { type: 'tee', variant: 'core' },
        enter: 'slideRotate',
        exit: 'slideOutLeft',
        text: 'split',
        layout: 'left',
      },
      {
        id: 'twin-dragon-henley-tee',
        name: ['TWIN DRAGON', 'HENLEY TEE'],
        jp: '双龍',
        price: price(3900, 49, 7200),
        specs: ['DOUBLE-LAYER V COLLAR', 'CLOUD + DRAGON PRINT', 'WASHED BLACK JERSEY'],
        description: 'Two dragons chase each other through red clouds, one over the shoulder and one up from the hem. A layered henley collar finishes it.',
        image: 'products/twin-dragon-henley-tee.webp',
        art: { type: 'tee', variant: 'afterdark' },
        enter: 'behindType',
        exit: 'drop',
        text: 'blur',
        layout: 'bottom',
      },
      {
        id: 'red-tiger-bamboo-tee',
        name: ['RED TIGER', 'BAMBOO TEE'],
        jp: '赤虎',
        price: price(4500, 55, 8200),
        specs: ['ROARING TIGER + BAMBOO PRINT', 'STONE-WASHED SAND JERSEY', 'EMBROIDERED 赤虎 KANJI'],
        description: 'A tiger bursting out of a bamboo grove across washed sand jersey, with 赤虎 (red tiger) stitched in oxblood at the hip.',
        image: 'products/red-tiger-bamboo-tee.webp',
        art: { type: 'tee', variant: 'core' },
        enter: 'cameraPull',
        exit: 'slideUp',
        text: 'stretch',
        layout: 'right',
      },
      {
        id: 'royal-flush-print-tee',
        name: ['ROYAL FLUSH', 'PRINT TEE'],
        jp: '王手',
        price: price(4900, 59, 8900),
        specs: ['ALL-OVER PHOTO PRINT', 'BURNOUT SLUB JERSEY', 'SKULL KING + TWO QUEENS'],
        description: 'A skull king flanked by two queens, printed edge to edge on sheer burnout jersey. The house always wins.',
        image: 'products/royal-flush-print-tee.webp',
        art: { type: 'tee', variant: 'core' },
        enter: 'glitch',
        exit: 'glitchOut',
        text: 'scramble',
        layout: 'split',
      },
    ],
  },
  {
    id: 'denim',
    index: '05',
    title: 'DENIM',
    jp: 'デニム',
    tag: 'raw',
    theme: 'denim',
    district: 'DISTRICT 03 — UNDERPASS',
    blurb: 'Wide legs. Heavy wash. Built to drag on asphalt.',
    products: [
      {
        id: 'blood-wing-denim',
        name: ['BLOOD WING', 'DENIM'],
        jp: '血の翼',
        price: price(8900, 109, 16400),
        specs: ['RHINESTONE WINGS, BACK', 'OXBLOOD WASH', 'BAGGY WIDE LEG'],
        description: 'Oxblood denim with a pair of crystal wings set across the back pockets. Cut baggy, so the wings move when you do.',
        image: 'products/blood-wing-denim.webp',
        art: { type: 'pants', variant: 'red' },
        enter: 'pendulum',
        exit: 'drop',
        text: 'blur',
        layout: 'right',
      },
      {
        id: 'tribal-blade-denim',
        name: ['TRIBAL BLADE', 'DENIM'],
        jp: '刃',
        price: price(7900, 99, 14600),
        specs: ['DISCHARGE TRIBAL PRINT', 'DISTRESSED BLACK WASH', 'RIPPED KNEES'],
        description: 'Black denim scraped back to grey, with tribal blades running down both legs like a Y2K tattoo flash sheet.',
        image: 'products/tribal-blade-denim.webp',
        art: { type: 'pants', variant: 'black' },
        enter: 'motionBlur',
        exit: 'whoosh',
        text: 'stretch',
        layout: 'left',
      },
      {
        id: 'union-relic-denim',
        name: ['UNION RELIC', 'DENIM'],
        jp: '遺物',
        price: price(9500, 119, 17400),
        specs: ['SUN-FADED UNION FLAG PRINT', 'CHAIN + CROSS GRAPHIC', 'RAW INDIGO, CONTRAST STITCH'],
        description: 'Raw indigo printed with a sun-faded Union flag, script and a hanging chain of crosses. Half souvenir, half evidence.',
        image: 'products/union-relic-denim.webp',
        art: { type: 'pants', variant: 'indigo' },
        enter: 'sliceReveal',
        exit: 'sliceOut',
        text: 'slide',
        layout: 'bottom',
      },
    ],
  },
  {
    id: 'shoes',
    index: '06',
    title: 'SHOES',
    jp: 'シューズ',
    tag: 'traction',
    theme: 'shoes',
    district: 'DISTRICT 04 — HIGHWAY',
    blurb: 'Grip the asphalt. Leave the rest behind.',
    products: [
      {
        id: 'riot-stud-hi-top',
        name: ['RIOT STUD', 'HI-TOP'],
        jp: '暴動',
        price: price(14900, 179, 27400),
        specs: ['BLACK PEBBLED LEATHER', 'STUDDED STRIPES + STRAP', 'ZIP-DOWN COLLAR, TARTAN LINING'],
        description:
          'Black pebbled leather hi-tops with studded stripes, a studded ankle strap and a zip-down collar that folds open to show the tartan lining.',
        image: 'products/riot-stud-hi-top.webp',
        art: { type: 'kicks', variant: 'black' },
        enter: 'dropBounce',
        exit: 'scaleThrough',
        text: 'split',
        layout: 'right',
      },
      {
        id: 'blood-script-skate-shoe',
        name: ['BLOOD SCRIPT', 'SKATE SHOE'],
        jp: '血文字',
        price: price(9900, 119, 18200),
        specs: ['PUFFY PADDED TONGUE', 'GOLD SCRIPT EMBROIDERY', 'SILVER BAT CHAIN CHARM'],
        description:
          'A puffed-up skate shoe in cracked white leather, red splatter graphics, gold script embroidery and a silver bat charm chained across the laces.',
        image: 'products/blood-script-skate-shoe.webp',
        art: { type: 'kicks', variant: 'white' },
        enter: 'dropBounce',
        exit: 'flipUp',
        text: 'stretch',
        layout: 'left',
      },
      {
        id: 'night-bat-skate-shoe',
        name: ['NIGHT BAT', 'SKATE SHOE'],
        jp: '夜蝙蝠',
        price: price(9900, 119, 18200),
        specs: ['TRIPLE-BLACK NUBUCK', 'WHITE SCROLLWORK PRINT', 'ROPE LACES + BAT CHARM'],
        description:
          'Triple-black nubuck covered in white scrollwork, fat rope laces and a silver bat charm. Made for the curb at 3AM.',
        image: 'products/night-bat-skate-shoe.webp',
        art: { type: 'kicks', variant: 'black' },
        enter: 'spinAcross',
        exit: 'spinOut',
        text: 'split',
        layout: 'right',
      },
    ],
  },
  {
    id: 'headgear',
    index: '07',
    title: 'HEADGEAR',
    jp: '帽子',
    tag: 'crowns',
    theme: 'headgear',
    district: 'DISTRICT 05 — ROOFTOPS',
    blurb: 'Caps, furs and shields for the top of the food chain.',
    products: [
      {
        id: 'leopard-cross-cadet-cap',
        name: ['LEOPARD CROSS', 'CADET CAP'],
        jp: '豹',
        price: price(2900, 36, 5400),
        specs: ['RHINESTONE CROSS PATCH', 'LEOPARD FLEECE BRIM + BAND', 'DISTRESSED BLACK TWILL'],
        description: 'A black cadet cap wrapped in leopard fleece, with a rhinestone cross stitched over the front. Loud on purpose.',
        image: 'products/leopard-cross-cadet-cap.webp',
        art: { type: 'cap', variant: 'leopard' },
        enter: 'toss',
        exit: 'tossOut',
        text: 'split',
        layout: 'right',
      },
      {
        id: 'black-mass-trapper',
        name: ['BLACK MASS', 'TRAPPER HAT'],
        jp: '黒',
        price: price(5900, 72, 10800),
        specs: ['EMBOSSED LEATHER SCROLLWORK', 'FAUX-FUR LINING + EAR FLAPS', 'BRASS SNAP STRAP'],
        description: 'Black leather embossed with gothic scrollwork, lined in silver-tipped faux fur. Built for winters that bite back.',
        image: 'products/black-mass-trapper.webp',
        art: { type: 'hat', variant: 'trapper' },
        enter: 'dropBounce',
        exit: 'flipUp',
        text: 'slide',
        layout: 'left',
      },
      {
        id: 'gilded-wing-cadet-cap',
        name: ['GILDED WING', 'CADET CAP'],
        jp: '金翼',
        price: price(2700, 34, 5000),
        specs: ['HAND-PRINTED GOLD WINGS', 'STUDDED FLEUR PATCH', 'FRAYED GREY BRIM'],
        description: 'Washed brown twill with gold wings, a studded fleur patch and a brim frayed like it has been through a few fights.',
        image: 'products/gilded-wing-cadet-cap.webp',
        art: { type: 'cap', variant: 'wing' },
        enter: 'coinFlip',
        exit: 'coinOut',
        text: 'stretch',
        layout: 'split',
      },
      {
        id: 'quicksilver-wrap-shades',
        name: ['QUICKSILVER', 'WRAP SHADES'],
        jp: '水銀',
        price: price(6900, 85, 12800),
        specs: ['LIQUID-SILVER WRAP FRAME', 'SMOKE MIRROR LENS', 'SCULPTED BLADE TEMPLES'],
        description:
          'A liquid-silver wraparound frame with sculpted blade temples and a smoke mirror lens. Built for 300 km/h, worn at 3AM.',
        image: 'products/quicksilver-wrap-shades-front.webp',
        // extra views: shown one at a time, cycling while the cursor is on the product
        gallery: ['products/quicksilver-wrap-shades-front.webp', 'products/quicksilver-wrap-shades-side.webp'],
        art: { type: 'shades', variant: 'shield' },
        enter: 'visor',
        exit: 'visorOut',
        text: 'stretch',
        layout: 'right',
      },
    ],
  },
];

/** 07 — The featured piece. Also teased at the end of the hero transition. */
export const FEATURED = {
  id: 'ume-blossom-suede-jacket',
  name: ['UME BLOSSOM', 'SUEDE JACKET'],
  jp: '最重要指名手配',
  price: price(29900, 369, 54800),
  specs: ['HAND-EMBROIDERED PLUM BLOSSOM', 'BRASS FROG CLASPS', 'BLACK MICROSUEDE', 'LIMITED — 100 UNITS'],
  callouts: [
    { label: 'HAND-EMBROIDERED PLUM BLOSSOM', x: 74, y: 40 },
    { label: 'BRASS FROG CLASPS', x: 46, y: 46 },
    { label: 'BLACK MICROSUEDE', x: 18, y: 60 },
    { label: 'LIMITED — 100 UNITS', x: 58, y: 92 },
  ],
  description:
    'The most wanted piece in the city. Black microsuede with an asymmetric zip, brass frog clasps and a plum branch embroidered in gold thread and red silk. One hundred units. No restock.',
  image: 'products/ume-blossom-suede-jacket.webp',
  art: { type: 'jacket', variant: 'racer' },
};

/** Flat list with blacklist ranks (#1 is the featured piece). */
export const ALL_PRODUCTS = (() => {
  const flat = CATEGORIES.flatMap((c) => c.products.map((p) => Object.assign(p, { category: c.id })));
  const total = flat.length + 1;
  flat.forEach((p, i) => (p.rank = total - i));
  return [...flat, Object.assign(FEATURED, { category: 'featured', rank: 1 })];
})();

export const findProduct = (id) => ALL_PRODUCTS.find((p) => p.id === id);
