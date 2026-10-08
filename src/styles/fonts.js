/*
 * Typography systems (self-hosted via Fontsource — no external requests):
 *   Logo ............ Archivo Expanded Black Italic, liquid chrome (src/brand/logo.js)
 *   Product names ... Archivo Condensed Black (same family, other end of the width axis)
 *   Display lines ... Archivo Expanded
 *   Category marks .. Archivo Condensed Black (motion gives each district its identity)
 *   Navigation ...... Michroma — wide tech caps
 *   Metadata ........ JetBrains Mono
 *   Descriptions .... Instrument Serif (+ italic) — editorial contrast
 *   Japanese ........ Noto Sans JP 700 (unicode-range split, only used glyphs load)
 */
import '@fontsource-variable/archivo/standard.css';
import '@fontsource-variable/archivo/standard-italic.css';
import '@fontsource/michroma/latin-400.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
// Japanese glyphs are lazy-loaded after boot (see main.js) to keep first paint light.
