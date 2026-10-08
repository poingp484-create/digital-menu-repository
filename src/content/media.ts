// Every visual on the site. Each entry is one Higgsfield generation:
// images use gpt_image_2_5, videos use kling3_0 (sound off) started from
// the matching image. Save outputs to /public/media/<file> and the site
// picks them up on the next build. Until a file exists, <Media> renders a
// labeled placeholder of the same shape.

export type Shot = {
  file: string;
  ratio: "16:9" | "4:5" | "3:4" | "4:3" | "1:1" | "9:16";
  alt: string;
  prompt: string;
};

const look =
  "Photorealistic, shot on 35mm, low-key lighting, deep shadows, warm practical light against cool darkness, shallow depth of field, no text, no logos, no people's faces in focus.";

export const shots = {
  hero: {
    file: "hero.webp",
    ratio: "3:4",
    alt: "A chef's hands pressing a piece of otoro nigiri at a pale hinoki counter.",
    prompt: `Close view of a sushi chef's hands pressing otoro nigiri on a pale hinoki wood counter, a single warm overhead light, black background. ${look}`,
  },
  counter: {
    file: "counter.webp",
    ratio: "4:5",
    alt: "The twelve-seat hinoki counter, set for the evening seating.",
    prompt: `An empty twelve-seat hinoki sushi counter set with ceramic plates and chopstick rests, dim room, pools of warm light on the wood. ${look}`,
  },
  alacarte: {
    file: "alacarte.webp",
    ratio: "4:3",
    alt: "Shared plates of grilled fish, pickles and rice on a dark wood table.",
    prompt: `Overhead view of shared Japanese plates on a dark wood table: grilled black cod, pickles, rice in a donabe, sake cups. ${look}`,
  },
  robata: {
    file: "robata.webp",
    ratio: "16:9",
    alt: "Skewers cooking over glowing binchotan charcoal on the robata grill.",
    prompt: `Wide shot of yakitori skewers over glowing binchotan charcoal on a long robata grill, sparks and thin smoke, dark kitchen. ${look}`,
  },
  otoro: {
    file: "dish-otoro.webp",
    ratio: "4:5",
    alt: "Two pieces of otoro nigiri on a black ceramic plate.",
    prompt: `Two pieces of glistening otoro nigiri on a matte black ceramic plate, side light. ${look}`,
  },
  uni: {
    file: "dish-uni.webp",
    ratio: "4:5",
    alt: "Hokkaido uni hand roll in crisp nori.",
    prompt: `A Hokkaido uni hand roll in crisp nori held on a wooden stand, bright orange uni, dark background. ${look}`,
  },
  tsukune: {
    file: "dish-tsukune.webp",
    ratio: "4:5",
    alt: "Charcoal-grilled chicken tsukune with a raw egg yolk for dipping.",
    prompt: `Glazed chicken tsukune skewer next to a small dish with a raw egg yolk, charred edges, dark slate plate. ${look}`,
  },
  blackcod: {
    file: "dish-blackcod.webp",
    ratio: "4:5",
    alt: "Saikyo miso black cod with a caramelized crust.",
    prompt: `A fillet of saikyo miso black cod with a caramelized crust on a pale ceramic plate with pickled ginger shoot. ${look}`,
  },
  wagyu: {
    file: "dish-wagyu.webp",
    ratio: "4:5",
    alt: "Sliced A5 wagyu seared over charcoal, served with fresh wasabi.",
    prompt: `Thick slices of seared A5 wagyu with a pink center on a dark plate, freshly grated wasabi on the side. ${look}`,
  },
  chef: {
    file: "chef.webp",
    ratio: "3:4",
    alt: "The chef slicing fish at the counter, face turned away.",
    prompt: `A sushi chef in a dark indigo work jacket slicing fish with a yanagiba knife, seen from the side and slightly behind, face not visible. ${look}`,
  },
  room: {
    file: "room.webp",
    ratio: "16:9",
    alt: "The dining room at night, lit by paper lanterns.",
    prompt: `A small Japanese dining room at night, dark plaster walls, paper lanterns, low wood tables, warm pools of light. ${look}`,
  },
  entrance: {
    file: "entrance.webp",
    ratio: "3:4",
    alt: "The dark indigo noren curtain over the entrance at night.",
    prompt: `A plain dark indigo noren curtain over a narrow restaurant doorway at night, wet street reflections, single lamp. ${look}`,
  },
  sake: {
    file: "sake.webp",
    ratio: "4:5",
    alt: "Sake poured from a ceramic tokkuri into a small cup.",
    prompt: `Clear sake being poured from a ceramic tokkuri into a small ochoko cup, motion in the stream, dark background. ${look}`,
  },
  privateRoom: {
    file: "private.webp",
    ratio: "4:3",
    alt: "The private tatami room with a low table set for eight.",
    prompt: `A private tatami room with a low table set for eight guests, sliding shoji doors, soft lantern light. ${look}`,
  },
} satisfies Record<string, Shot>;

export type ShotKey = keyof typeof shots;

// Motion loops, generated from the matching still as the start frame.
export const loops = {
  hero: {
    file: "hero.mp4",
    poster: "hero",
    prompt:
      "Slow push-in. The chef's hands press the nigiri once and lift away, a faint breath of steam crosses the light. Calm, unhurried, no cuts.",
  },
  robata: {
    file: "robata.mp4",
    poster: "robata",
    prompt:
      "Static camera. Embers pulse on the binchotan, sparks drift upward, thin smoke curls past the skewers. Seamless, calm loop.",
  },
} as const satisfies Record<string, { file: string; poster: ShotKey; prompt: string }>;

export type LoopKey = keyof typeof loops;
