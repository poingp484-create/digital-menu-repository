import type { ShotKey } from "./media";

// Sample menu. Prices and dishes are placeholders until the kitchen
// confirms the opening menu.

export type Tag = "vegetarian" | "gluten-free" | "raw";

export type MenuItem = {
  name: string;
  jp?: string;
  description: string;
  price: number | string;
  tags?: Tag[];
};

export type MenuSection = {
  id: string;
  title: string;
  note?: string;
  shot?: ShotKey;
  items: MenuItem[];
};

export const tagLabels: Record<Tag, string> = {
  vegetarian: "Vegetarian",
  "gluten-free": "Gluten-free",
  raw: "Raw",
};

export const menu: MenuSection[] = [
  {
    id: "omakase",
    title: "Omakase",
    note: "Counter only. Two seatings nightly, 6:00 pm and 8:30 pm.",
    shot: "counter",
    items: [
      {
        name: "Counter omakase",
        jp: "Okimari",
        description:
          "Around eighteen courses: sakizuke, sashimi, a grilled course, nigiri, hand roll, soup and dessert.",
        price: 185,
      },
      {
        name: "Sake pairing",
        description: "Six pours chosen to follow the courses.",
        price: 95,
      },
      {
        name: "Reserve pairing",
        description: "Six aged and rare pours, including one koshu.",
        price: 160,
      },
    ],
  },
  {
    id: "nigiri",
    title: "Nigiri and sashimi",
    note: "Two pieces of nigiri or five slices of sashimi.",
    shot: "otoro",
    items: [
      { name: "Otoro", jp: "Fatty bluefin belly", description: "Aged four days.", price: 22, tags: ["raw", "gluten-free"] },
      { name: "Chutoro", jp: "Medium bluefin belly", description: "Brushed with nikiri.", price: 17, tags: ["raw"] },
      { name: "Akami", jp: "Lean bluefin", description: "Soy-cured zuke.", price: 12, tags: ["raw"] },
      { name: "Kinmedai", jp: "Golden eye snapper", description: "Skin lightly seared.", price: 14, tags: ["raw"] },
      { name: "Hotate", jp: "Hokkaido scallop", description: "Yuzu zest and sea salt.", price: 11, tags: ["raw", "gluten-free"] },
      { name: "Kohada", jp: "Gizzard shad", description: "Salted and cured in rice vinegar.", price: 10, tags: ["raw", "gluten-free"] },
      { name: "Ikura", jp: "Salmon roe", description: "Marinated in dashi and sake.", price: 13, tags: ["raw"] },
      { name: "Anago", jp: "Sea eel", description: "Simmered, finished with tsume.", price: 12 },
    ],
  },
  {
    id: "rolls",
    title: "Hand rolls",
    shot: "uni",
    items: [
      { name: "Hokkaido uni", description: "Sea urchin, shiso, fresh wasabi.", price: 19, tags: ["raw"] },
      { name: "Negitoro", description: "Chopped bluefin belly and scallion.", price: 14, tags: ["raw"] },
      { name: "Spicy hamachi", description: "Yellowtail, yuzu kosho, cucumber.", price: 12, tags: ["raw"] },
      { name: "Takuan and shiso", description: "Pickled daikon, shiso, toasted sesame.", price: 8, tags: ["vegetarian", "gluten-free"] },
    ],
  },
  {
    id: "robata",
    title: "Robata",
    note: "Grilled over binchotan charcoal.",
    shot: "tsukune",
    items: [
      { name: "Tsukune", description: "Chicken meatball, tare glaze, egg yolk.", price: 9 },
      { name: "Negima", description: "Chicken thigh and scallion, sea salt.", price: 8, tags: ["gluten-free"] },
      { name: "Saikyo black cod", description: "Two-day white miso marinade.", price: 32, tags: ["gluten-free"] },
      { name: "A5 wagyu", description: "Miyazaki striploin, fresh wasabi, 3 oz.", price: 68, tags: ["gluten-free"] },
      { name: "Shishito", description: "Blistered peppers, bonito flakes.", price: 7, tags: ["gluten-free"] },
      { name: "Shiitake", description: "Soy butter and sansho pepper.", price: 8, tags: ["vegetarian"] },
      { name: "Yaki onigiri", description: "Grilled rice ball brushed with soy.", price: 6, tags: ["vegetarian"] },
    ],
  },
  {
    id: "small-plates",
    title: "Small plates",
    items: [
      { name: "Edamame", description: "Smoked sea salt.", price: 6, tags: ["vegetarian", "gluten-free"] },
      { name: "Agedashi tofu", description: "Fried silken tofu in warm dashi.", price: 11 },
      { name: "Hamachi crudo", description: "Ponzu, jalapeño, crispy shallot.", price: 18, tags: ["raw"] },
      { name: "Chawanmushi", description: "Steamed egg custard, crab, mitsuba.", price: 14, tags: ["gluten-free"] },
      { name: "Karaage", description: "Fried chicken thigh, lemon, kewpie.", price: 13 },
      { name: "Sunomono", description: "Cucumber and wakame in sweet vinegar.", price: 8, tags: ["vegetarian", "gluten-free"] },
    ],
  },
  {
    id: "rice-noodles",
    title: "Rice and noodles",
    shot: "blackcod",
    items: [
      { name: "Donabe gohan", description: "Clay-pot rice with seasonal fish, for two.", price: 42 },
      { name: "Chirashi", description: "Chef's selection of sashimi over sushi rice.", price: 38, tags: ["raw"] },
      { name: "Cold soba", description: "Buckwheat noodles, tsuyu, scallion, wasabi.", price: 16, tags: ["vegetarian"] },
      { name: "Wagyu curry rice", description: "Braised wagyu cheek, pickled rakkyo.", price: 24 },
    ],
  },
  {
    id: "dessert",
    title: "Dessert",
    items: [
      { name: "Hojicha soft serve", description: "Roasted green tea, kuromitsu, kinako.", price: 10, tags: ["vegetarian", "gluten-free"] },
      { name: "Yuzu cheesecake", description: "Baked, with black sesame crumble.", price: 12, tags: ["vegetarian"] },
      { name: "Warabi mochi", description: "Bracken starch, roasted soy flour.", price: 9, tags: ["vegetarian", "gluten-free"] },
    ],
  },
  {
    id: "drinks",
    title: "Sake and drinks",
    note: "Full sake list available at the table.",
    shot: "sake",
    items: [
      { name: "Junmai daiginjo", description: "Glass or 300 ml carafe.", price: "$18 / $64" },
      { name: "Junmai", description: "Served warm or cold.", price: "$14 / $48" },
      { name: "Nigori", description: "Unfiltered, lightly sweet.", price: "$13 / $46" },
      { name: "Japanese highball", description: "Whisky, soda, lemon peel.", price: 16 },
      { name: "Yuzu sour", description: "Shochu, yuzu, egg white.", price: 17 },
      { name: "Umeshu on the rock", description: "Plum liqueur, one clear cube.", price: 14 },
      { name: "Sencha", description: "Pot of green tea.", price: 6, tags: ["vegetarian", "gluten-free"] },
      { name: "Yuzu soda", description: "House-made, alcohol free.", price: 8, tags: ["vegetarian", "gluten-free"] },
    ],
  },
];

export const signatures: { shot: ShotKey; name: string; detail: string; price: number }[] = [
  { shot: "otoro", name: "Otoro nigiri", detail: "Bluefin belly aged four days", price: 22 },
  { shot: "uni", name: "Hokkaido uni hand roll", detail: "Shiso and fresh wasabi", price: 19 },
  { shot: "tsukune", name: "Tsukune", detail: "Tare glaze and egg yolk", price: 9 },
  { shot: "blackcod", name: "Saikyo black cod", detail: "Two-day white miso", price: 32 },
  { shot: "wagyu", name: "A5 wagyu", detail: "Miyazaki striploin over charcoal", price: 68 },
];
