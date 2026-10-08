/**
 * YAKUZA logotype — Archivo Expanded Black Italic, finished in chrome.
 *
 * One source of truth feeds: the WebGL liquid-chrome hero logo (canvas atlas,
 * src/webgl/logoAtlas.js), the DOM logo used in the nav + footer, and the
 * no-WebGL fallback.
 */

export const WORD = 'YAKUZA';
export const LOGO_FAMILY = 'Archivo Variable';
export const LOGO_FONT_STACK = `'${LOGO_FAMILY}', 'Archivo', 'Arial Black', sans-serif`;
/** CSS font shorthand pieces for canvas: italic, black, expanded (wdth 125). */
export const LOGO_CANVAS = { style: 'italic', weight: 900, stretch: 'expanded' };
export const logoCanvasFont = (px) => `${LOGO_CANVAS.style} ${LOGO_CANVAS.weight} ${LOGO_CANVAS.stretch} ${px}px '${LOGO_FAMILY}'`;
/** Extra shear on top of the italic (x += -y * SKEW, y down). The face is already italic. */
export const SKEW = 0.03;
/** Extra tracking between glyphs, as a fraction of cap height. */
export const TRACKING = 0.07;
/** Optical kerning for pairs the italic crowds (added space, fraction of cap height). */
export const KERN = { AK: 0.1, YA: -0.03 };

/**
 * Tapered underline blade that sweeps back under the word.
 * Normalised: x 0..1 across the word width, y in cap-heights below the cap line.
 */
export const SWOOSH = [
  [1.04, 1.12],
  [0.48, 1.24],
  [-0.06, 1.42],
  [-0.12, 1.47],
  [-0.05, 1.33],
  [0.47, 1.16],
  [0.98, 1.06],
];

/** DOM logo: chrome text + optional swoosh, scales with font-size of the container. */
export function logoHTML({ swoosh = true, className = '' } = {}) {
  const pts = SWOOSH.map(([x, y]) => `${(x * 100).toFixed(1)},${((y - 1.02) * 100).toFixed(1)}`).join(' ');
  return `<span class="logo-type ${className}" role="img" aria-label="YAKUZA"><span class="logo-type__word" aria-hidden="true">${WORD}</span>${
    swoosh
      ? `<svg class="logo-type__swoosh" viewBox="-14 0 120 48" preserveAspectRatio="none" aria-hidden="true"><polygon points="${pts}"/></svg>`
      : ''
  }</span>`;
}
