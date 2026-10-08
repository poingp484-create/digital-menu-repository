/**
 * YAKUZA logotype — Archivo Expanded Black Italic, finished in chrome.
 *
 * One source of truth feeds: the WebGL liquid-chrome hero logo (canvas atlas,
 * src/webgl/logoAtlas.js), the DOM logo used in the nav + footer, and the
 * no-WebGL fallback.
 */

export const WORD = 'YAKUZA';

/**
 * Metal finishes for the WebGL logo. Set LOGO_FINISH to pick one.
 * tint = body colour, spec = highlight colour, gloss = clear-coat, iri = pearl.
 */
export const LOGO_FINISHES = {
  chrome: { tint: [1, 1, 1], spec: [1, 0.97, 0.93], gloss: 0, iri: 0 },
  candy: { tint: [1, 0.08, 0.11], spec: [1, 0.92, 0.9], gloss: 0.75, iri: 0 },
  black: { tint: [0.2, 0.2, 0.23], spec: [1, 1, 1], gloss: 0.95, iri: 0 },
  gold: { tint: [1, 0.74, 0.36], spec: [1, 0.95, 0.85], gloss: 0.25, iri: 0 },
  rose: { tint: [1, 0.56, 0.66], spec: [1, 0.94, 0.95], gloss: 0.5, iri: 0 },
  pearl: { tint: [0.96, 0.96, 1], spec: [1, 1, 1], gloss: 0.3, iri: 0.75 },
};
export const LOGO_FINISH = 'candy';
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
