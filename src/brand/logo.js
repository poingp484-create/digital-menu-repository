/**
 * YAKUZA logo — chrome blade lettering with katana.
 *
 * Source art: src/brand/yakuza-logo.webp (transparent, cut from the black
 * original by scripts in the repo history). The same file feeds the WebGL hero
 * logo (src/webgl/stage.js) and the DOM logo in the nav, footer and the
 * no-WebGL fallback. To swap the logo, replace both webp files and update
 * LOGO_IMAGE.size + cuts below.
 */
import logoUrl from './yakuza-logo.webp?url';
import logoSmUrl from './yakuza-logo-sm.webp?url';
import logoShadowUrl from './yakuza-logo-shadow.webp?url';

export const WORD = 'YAKUZA';

/**
 * Hero logo image + how it splits into one strip per letter for the
 * fly-through. Each cut is a slanted line  x + (y - h/2) * slope = c
 * (image pixels, y down), chosen to run through the gaps between letters.
 */
export const LOGO_IMAGE = {
  url: logoUrl,
  size: [1983, 793],
  slope: 0.2,
  cuts: [448, 748, 1076, 1244, 1454],
  /** soft dark halo behind the logo (separates it from the sakura); padded 160px per side */
  shadow: { url: logoShadowUrl, pad: 160, opacity: 0.7 },
};

/**
 * Colour finishes for the hero logo. `chrome` shows the art as drawn; the
 * others re-tint the metal while keeping its highlights. Set LOGO_FINISH.
 */
export const LOGO_FINISHES = {
  chrome: { tint: [1, 1, 1], amount: 0 },
  candy: { tint: [1, 0.1, 0.13], amount: 0.85 },
  gold: { tint: [1, 0.76, 0.38], amount: 0.8 },
  blackchrome: { tint: [0.32, 0.33, 0.36], amount: 0.7 },
};
export const LOGO_FINISH = 'chrome';

/** Type used for YAKUZA prints on the placeholder garment renders. */
export const LOGO_FAMILY = 'Archivo Variable';
export const LOGO_FONT_STACK = `'${LOGO_FAMILY}', 'Archivo', 'Arial Black', sans-serif`;

/** DOM logo (nav, footer, fallback). Size it with the container's width. */
export function logoHTML({ large = false, className = '' } = {}) {
  return `<img class="logo-img ${className}" src="${large ? logoUrl : logoSmUrl}" alt="YAKUZA" draggable="false" decoding="async" />`;
}
