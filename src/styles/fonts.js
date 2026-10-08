/*
 * Typography systems (self-hosted via Fontsource — no external requests):
 *   Logo ............ custom vector letterforms (src/brand/logo.js)
 *   Product names ... Unbounded 800 — wide Y2K display
 *   Category marks .. Bruno Ace SC / Rubik Mono One / Saira Extra Condensed / Instrument Serif
 *   Navigation ...... Michroma — wide tech caps
 *   Metadata ........ JetBrains Mono
 *   Descriptions .... Instrument Serif (+ italic) — editorial contrast
 *   Street tags ..... Sedgwick Ave Display — spray-paint script
 *   Japanese ........ Noto Sans JP 700 (unicode-range split, only used glyphs load)
 */
import '@fontsource/unbounded/latin-400.css';
import '@fontsource/unbounded/latin-800.css';
import '@fontsource/michroma/latin-400.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/sedgwick-ave-display/latin-400.css';
import '@fontsource/bruno-ace-sc/latin-400.css';
import '@fontsource/rubik-mono-one/latin-400.css';
import '@fontsource/saira-extra-condensed/latin-800.css';
// Japanese glyphs are lazy-loaded after boot (see main.js) to keep first paint light.
