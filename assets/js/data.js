/* Catalogue data.
 *
 * Everything under `observed` is what can be seen in the supplied photos.
 * Price, brand, sizes and stock are NOT known: they stay null / placeholder
 * and the UI labels them as such. Fill them in here when you have real values.
 */
(function () {
  "use strict";

  // Cutouts in /cutout-review are cleared for use (the owner approved them).
  // While false, every shoe slot renders a same-proportion placeholder instead.
  var CUTOUTS_APPROVED = true;
  var IMG_DIR = "assets/shoes/";

  // Placeholder size run (EU). Availability is unconfirmed for every size.
  var SIZE_RUN = ["38", "39", "40", "41", "42", "43", "44", "45", "46"];

  var PRODUCTS = [
    {
      no: "01",
      slug: "maroon-silver-boots",
      name: "Maroon Silver Boots",
      short: "Maroon / Silver",
      img: "maroon-silver-boots", w: 836, h: 1050,
      silhouette: "boot", silhouetteLabel: "Football boot",
      finishes: ["metallic"],
      ink: "#b0283f",
      colourway: "Maroon patent with silver panels",
      observed: [
        "High-shine maroon upper with silver striping",
        "Fold-over tongue with a printed emblem",
        "Long maroon laces, left untied in the photo"
      ]
    },
    {
      no: "02",
      slug: "airbrush-face-spider-lows",
      name: "Face & Spider Lows",
      short: "Airbrush Lows",
      img: "airbrush-face-spider-lows", w: 1023, h: 875,
      silhouette: "low", silhouetteLabel: "Low-top canvas",
      finishes: ["airbrushed", "creature"],
      ink: "#8a6cff",
      colourway: "Cream canvas, black airbrush, violet eyes",
      observed: [
        "Airbrushed face with violet eyes on one shoe",
        "Airbrushed spider and web pattern on the other",
        "Oversized cream laces, red and navy foxing stripes"
      ]
    },
    {
      no: "03",
      slug: "cobra-airbrush-hightops",
      name: "Cobra High-Tops",
      short: "Cobra Hi",
      img: "cobra-airbrush-hightops", w: 1086, h: 1116,
      silhouette: "high", silhouetteLabel: "High-top canvas",
      finishes: ["airbrushed", "creature"],
      ink: "#4fae5c",
      colourway: "Green and lime airbrush, chrome-white sole",
      observed: [
        "Airbrushed cobra on the side panel",
        "Painted midsole covered in script tags",
        "Dog tag and charm hung from the laces"
      ]
    },
    {
      no: "04",
      slug: "tiger-print-boots",
      name: "Tiger Print Boots",
      short: "Tiger",
      img: "tiger-print-boots", w: 551, h: 550, lowRes: true,
      silhouette: "boot", silhouetteLabel: "Football boot",
      finishes: ["print", "creature"],
      ink: "#e39a33",
      colourway: "Tiger print with white stripes",
      observed: [
        "Tiger face printed across each toe box",
        "Teeth wrap around the front of the sole line",
        "Clear tag still attached to the laces"
      ]
    },
    {
      no: "05",
      slug: "silver-turf-trainers",
      name: "Silver Turf Trainers",
      short: "Silver Turf",
      img: "silver-turf-trainers", w: 606, h: 653, lowRes: true,
      silhouette: "turf", silhouetteLabel: "Turf trainer",
      finishes: ["metallic"],
      ink: "#b9bec7",
      colourway: "Metallic silver with cream engraved panel",
      observed: [
        "Metallic silver upper with quilted stitching",
        "Fold-over tongue",
        "Rubber turf outsole; shoe trees fitted in the photo"
      ]
    },
    {
      no: "06",
      slug: "fur-chain-heels",
      name: "Fur & Chain Heels",
      short: "Fur / Chain",
      img: "fur-chain-heels", w: 535, h: 820, lowRes: true,
      silhouette: "heel", silhouetteLabel: "Heeled knee boot",
      finishes: ["hardware"],
      ink: "#9ba36a",
      colourway: "Olive suede, dark fur trim, gunmetal chains",
      observed: [
        "Bands of dark fur wrapped around each shaft",
        "Gunmetal chains criss-crossing the boot",
        "Buckle straps with cross charms at the ankle",
        "Rhinestone-studded cuff, croc-effect pointed toe, metal stiletto heel"
      ]
    },
    {
      no: "07",
      slug: "collage-lace-up-boots",
      name: "Collage Lace-Up Boots",
      short: "Collage",
      img: "collage-lace-up-boots", w: 696, h: 694, lowRes: true,
      silhouette: "laceup", silhouetteLabel: "Lace-up high boot",
      finishes: ["print"],
      ink: "#cf4a3f",
      colourway: "Cream crackle with red and black newsprint collage",
      observed: [
        "Crackled cream finish over a printed newsprint collage",
        "Long brown laces through a high lace-up front",
        "Zip on the side of the shaft",
        "Small orange kangaroo logo on the side and toe"
      ]
    },
    {
      no: "08",
      slug: "crackle-face-boots",
      name: "Crackle Face Boots",
      short: "Crackle Face",
      img: "crackle-face-boots", w: 673, h: 640, lowRes: true,
      silhouette: "laceup", silhouetteLabel: "Lace-up high boot",
      finishes: ["print"],
      ink: "#e2bd45",
      colourway: "Cream crackle print with tan suede panels",
      observed: [
        "Pop-art face printed in red and yellow on the shaft",
        "Crackled cream finish with black newsprint graphics",
        "Tan suede heel and toe panels, side zip, tall laces"
      ]
    },
    {
      no: "09",
      slug: "pin-up-tattoo-hightops",
      name: "Pin-Up Tattoo High-Tops",
      short: "Pin-Up",
      img: "pin-up-tattoo-hightops", w: 736, h: 873, lowRes: true,
      silhouette: "high", silhouetteLabel: "High-top canvas",
      finishes: ["print"],
      ink: "#d9693f",
      colourway: "Cream canvas, black foxing, red pinstripe",
      observed: [
        "Tattoo-flash pin-up cowgirl printed on the side",
        "Black fold-down collar with an anchor patch",
        "Printed script signature on the side panel",
        "Black rubber foxing with a red stripe"
      ]
    }
  ];

  var SILHOUETTES = [
    { id: "all", label: "All pairs" },
    // word: the short form used as a big headline on the home page
    { id: "low", label: "Low-top", word: "Low-top" },
    { id: "high", label: "High-top", word: "High-top" },
    { id: "boot", label: "Football boots", word: "Football" },
    { id: "turf", label: "Turf", word: "Turf" },
    { id: "laceup", label: "Lace-up boots", word: "Lace-up" },
    { id: "heel", label: "Heels", word: "Heels" }
  ];

  var FINISHES = [
    { id: "airbrushed", label: "Airbrushed" },
    { id: "metallic", label: "Metallic" },
    { id: "print", label: "Print" },
    { id: "creature", label: "Creatures" },
    { id: "hardware", label: "Hardware" }
  ];

  // Display order: numbers follow the order pairs appear on the home page, top to bottom.
  var ORDER = ["cobra-airbrush-hightops", "fur-chain-heels", "airbrush-face-spider-lows", "collage-lace-up-boots",
    "tiger-print-boots", "maroon-silver-boots", "silver-turf-trainers", "crackle-face-boots", "pin-up-tattoo-hightops"];
  PRODUCTS.sort(function (x, y) { return ORDER.indexOf(x.slug) - ORDER.indexOf(y.slug); });
  PRODUCTS.forEach(function (p, i) { p.no = (i < 9 ? "0" : "") + (i + 1); });

  PRODUCTS.forEach(function (p) {
    p.price = null; // unknown: shown as "Price TBC"
    p.brand = null; // unconfirmed: never shown as fact
    p.sizes = SIZE_RUN.slice();
  });

  window.SOLEMN = window.SOLEMN || {};
  window.SOLEMN.data = {
    CUTOUTS_APPROVED: CUTOUTS_APPROVED,
    IMG_DIR: IMG_DIR,
    PRODUCTS: PRODUCTS,
    SILHOUETTES: SILHOUETTES,
    FINISHES: FINISHES,
    bySlug: function (slug) {
      for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].slug === slug) return PRODUCTS[i];
      return null;
    }
  };
})();
