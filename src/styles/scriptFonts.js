/**
 * Non-Latin type for the intro transmission + Japanese accents, loaded from
 * Google Fonts with `text=` so only the glyphs actually used are downloaded.
 */
const FAMILIES = [
  'Noto+Sans+JP:wght@700;900',
  'Noto+Sans+KR:wght@800',
  'Noto+Sans+TC:wght@800',
  'Noto+Sans+SC:wght@800',
  'Noto+Sans:wght@800',
  'Noto+Sans+Hebrew:wght@800',
  'Noto+Sans+Thai:wght@800',
  'Noto+Sans+Georgian:wght@800',
  'Noto+Sans+Armenian:wght@800',
  'Noto+Sans+Ethiopic:wght@800',
  'Noto+Sans+Lao:wght@800',
  'Noto+Sans+Sinhala:wght@800',
];

/**
 * Scripts that need contextual shaping (joining forms, stacked vowels) break
 * when subset with `text=`, so these load whole — Google still splits them by
 * unicode-range, and they only download because the intro uses them.
 */
const SHAPED = ['Noto+Sans+Arabic:wght@800', 'Noto+Sans+Myanmar:wght@700', 'Noto+Sans+Khmer:wght@800'];

export function loadScriptFonts(sourceText) {
  const chars = [...new Set([...sourceText].filter((c) => c.codePointAt(0) > 0x2ff))].join('');
  if (!chars) return;
  const href = `https://fonts.googleapis.com/css2?${FAMILIES.map((f) => `family=${f}`).join('&')}&text=${encodeURIComponent(chars)}&display=swap`;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
  const shaped = document.createElement('link');
  shaped.rel = 'stylesheet';
  shaped.href = `https://fonts.googleapis.com/css2?${SHAPED.map((f) => `family=${f}`).join('&')}&display=swap`;
  document.head.appendChild(shaped);
}
