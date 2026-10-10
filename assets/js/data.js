/* Catalogue data.
 *
 * Everything under `observed` is what can be seen in the supplied photos.
 * Price, brand, sizes and stock are NOT known: they stay null / placeholder
 * and the UI labels them as such. Fill them in here when you have real values.
 */
(function () {
  "use strict";

  // Cutouts in /cutout-review were approved by the owner.
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
      ],
      details: [
        { label: "Tongue emblem", x: 0.32, y: 0.34, z: 2.4 },
        { label: "Striped upper", x: 0.36, y: 0.62, z: 2.2 }
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
      ],
      details: [
        { label: "Violet eyes", x: 0.48, y: 0.27, z: 2.8 },
        { label: "Spider", x: 0.61, y: 0.72, z: 2.2 }
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
      ],
      details: [
        { label: "Cobra head", x: 0.41, y: 0.47, z: 2.4 },
        { label: "Dog tag", x: 0.7, y: 0.22, z: 2.8 }
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
      ],
      details: [
        { label: "Tiger eye", x: 0.63, y: 0.7, z: 1.9 },
        { label: "Teeth", x: 0.5, y: 0.84, z: 1.8 }
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
      ],
      details: [
        { label: "Fold-over tongue", x: 0.36, y: 0.4, z: 1.9 },
        { label: "Stitch lines", x: 0.62, y: 0.6, z: 1.8 }
      ]
    }
  ];

  var SILHOUETTES = [
    { id: "all", label: "All pairs" },
    { id: "low", label: "Low-top" },
    { id: "high", label: "High-top" },
    { id: "boot", label: "Boots" },
    { id: "turf", label: "Turf" }
  ];

  var FINISHES = [
    { id: "airbrushed", label: "Airbrushed" },
    { id: "metallic", label: "Metallic" },
    { id: "print", label: "Print" },
    { id: "creature", label: "Creatures" }
  ];

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
