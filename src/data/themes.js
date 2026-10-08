/**
 * Environment "grades" — every section owns a look. The WebGL background
 * lerps between these as you scroll. Colours are linear-ish RGB 0..1.
 *
 *  base    – sky / ground tone
 *  fog     – the drifting haze colour
 *  accent  – horizon + cursor light
 *  heat    – police strobe intensity (0..1)
 *  streaks – light-trail intensity
 *  sky     – skyline + horizon visibility
 *  bright  – overall exposure lift
 */
export const THEMES = {
  hero:      { base: [0.05, 0.055, 0.06], fog: [0.2, 0.21, 0.19], accent: [0.85, 0.62, 0.3], heat: 0.0, streaks: 0.5, sky: 1, bright: 0 },
  manifesto: { base: [0.09, 0.08, 0.05], fog: [0.36, 0.32, 0.2], accent: [0.95, 0.68, 0.28], heat: 0.0, streaks: 0.35, sky: 1, bright: 0.05 },
  jackets:   { base: [0.07, 0.075, 0.05], fog: [0.33, 0.33, 0.2], accent: [0.92, 0.7, 0.32], heat: 0.0, streaks: 0.4, sky: 0.9, bright: 0.04 },
  tees:      { base: [0.03, 0.045, 0.09], fog: [0.1, 0.16, 0.3], accent: [0.35, 0.6, 1.0], heat: 0.0, streaks: 0.3, sky: 0.7, bright: 0 },
  denim:     { base: [0.06, 0.045, 0.035], fog: [0.27, 0.19, 0.13], accent: [1.0, 0.56, 0.26], heat: 0.0, streaks: 0.55, sky: 0.8, bright: 0.02 },
  shoes:     { base: [0.07, 0.075, 0.085], fog: [0.3, 0.32, 0.36], accent: [0.9, 0.93, 1.0], heat: 0.0, streaks: 1, sky: 0.55, bright: 0.04 },
  jewelry:   { base: [0.02, 0.02, 0.025], fog: [0.17, 0.17, 0.19], accent: [1.0, 1.0, 1.0], heat: 0.0, streaks: 0.15, sky: 0.25, bright: 0 },
  pursuit:   { base: [0.035, 0.03, 0.045], fog: [0.16, 0.12, 0.2], accent: [1.0, 0.2, 0.25], heat: 1.0, streaks: 0.8, sky: 0.8, bright: 0 },
  statement: { base: [0.03, 0.03, 0.03], fog: [0.14, 0.14, 0.13], accent: [0.7, 0.66, 0.58], heat: 0.0, streaks: 0.1, sky: 0.4, bright: 0 },
  footer:    { base: [0.025, 0.025, 0.03], fog: [0.11, 0.11, 0.12], accent: [0.85, 0.88, 0.95], heat: 0.0, streaks: 0.2, sky: 0.6, bright: 0 },
};

/** Heat level shown in the HUD for each theme (0–5 bars). */
export const HEAT = { hero: 1, manifesto: 1, jackets: 2, tees: 2, denim: 2, shoes: 3, jewelry: 3, pursuit: 5, statement: 0, footer: 0 };

/**
 * Background moods — the overall colour of the city. Visitors can cycle them
 * from the HUD ("FILTER"); set DEFAULT_MOOD to pick what everyone sees first,
 * or SHOW_MOOD_SWITCHER = false to lock it.
 *
 *  weight — how strongly the mood overrides each section's own palette
 *           (0 = keep the per-section colours exactly).
 */
export const MOODS = {
  dusk:     { label: 'DUSK',     weight: 0,    base: [0.06, 0.06, 0.05], fog: [0.3, 0.29, 0.2], accent: [0.92, 0.68, 0.3] },
  midnight: { label: 'MIDNIGHT', weight: 0.85, base: [0.02, 0.035, 0.08], fog: [0.08, 0.13, 0.27], accent: [0.42, 0.62, 1.0] },
  smoke:    { label: 'SMOKE',    weight: 0.85, base: [0.055, 0.055, 0.06], fog: [0.25, 0.255, 0.27], accent: [0.85, 0.88, 0.95] },
  toxic:    { label: 'TOXIC',    weight: 0.85, base: [0.04, 0.06, 0.03], fog: [0.22, 0.3, 0.13], accent: [0.78, 0.92, 0.35] },
  crimson:  { label: 'CRIMSON',  weight: 0.85, base: [0.06, 0.015, 0.02], fog: [0.27, 0.06, 0.08], accent: [1.0, 0.32, 0.3] },
  blackout: { label: 'BLACKOUT', weight: 0.9,  base: [0.012, 0.012, 0.014], fog: [0.075, 0.075, 0.085], accent: [0.65, 0.66, 0.75] },
};
export const DEFAULT_MOOD = 'dusk';
export const SHOW_MOOD_SWITCHER = true;

/** Police siren lights — always on, slow red/blue alternation. Pursuit sections push harder. */
export const SIREN = { intensity: 0.6, period: 2.2 };
