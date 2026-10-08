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
  hero:      { base: [0.05, 0.055, 0.06], fog: [0.2, 0.21, 0.19], accent: [0.85, 0.62, 0.3], heat: 0.12, streaks: 0.5, sky: 1, bright: 0 },
  manifesto: { base: [0.09, 0.08, 0.05], fog: [0.36, 0.32, 0.2], accent: [0.95, 0.68, 0.28], heat: 0.0, streaks: 0.35, sky: 1, bright: 0.05 },
  jackets:   { base: [0.07, 0.075, 0.05], fog: [0.33, 0.33, 0.2], accent: [0.92, 0.7, 0.32], heat: 0.05, streaks: 0.4, sky: 0.9, bright: 0.04 },
  tees:      { base: [0.03, 0.045, 0.09], fog: [0.1, 0.16, 0.3], accent: [0.35, 0.6, 1.0], heat: 0.0, streaks: 0.3, sky: 0.7, bright: 0 },
  shoes:     { base: [0.07, 0.075, 0.085], fog: [0.3, 0.32, 0.36], accent: [0.9, 0.93, 1.0], heat: 0.0, streaks: 1, sky: 0.55, bright: 0.04 },
  jewelry:   { base: [0.02, 0.02, 0.025], fog: [0.17, 0.17, 0.19], accent: [1.0, 1.0, 1.0], heat: 0.0, streaks: 0.15, sky: 0.25, bright: 0 },
  pursuit:   { base: [0.035, 0.03, 0.045], fog: [0.16, 0.12, 0.2], accent: [1.0, 0.2, 0.25], heat: 1.0, streaks: 0.8, sky: 0.8, bright: 0 },
  statement: { base: [0.03, 0.03, 0.03], fog: [0.14, 0.14, 0.13], accent: [0.7, 0.66, 0.58], heat: 0.0, streaks: 0.1, sky: 0.4, bright: 0 },
  footer:    { base: [0.025, 0.025, 0.03], fog: [0.11, 0.11, 0.12], accent: [0.85, 0.88, 0.95], heat: 0.0, streaks: 0.2, sky: 0.6, bright: 0 },
};

/** Heat level shown in the HUD for each theme (0–5 bars). */
export const HEAT = { hero: 1, manifesto: 1, jackets: 2, tees: 2, shoes: 3, jewelry: 3, pursuit: 5, statement: 0, footer: 0 };
