/**
 * Tiny text splitter. Wraps characters in spans (keeping words together so
 * lines wrap naturally) and returns the char elements for animation.
 */
export function splitChars(el, { wordClass = 'w', charClass = 'c' } = {}) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.textContent = '';
  const chars = [];
  text.split(/(\s+)/).forEach((word) => {
    if (!word) return;
    if (/^\s+$/.test(word)) {
      el.appendChild(document.createTextNode(' '));
      return;
    }
    const w = document.createElement('span');
    w.className = wordClass;
    w.setAttribute('aria-hidden', 'true');
    for (const ch of word) {
      const c = document.createElement('span');
      c.className = charClass;
      c.textContent = ch;
      w.appendChild(c);
      chars.push(c);
    }
    el.appendChild(w);
  });
  return chars;
}

export function splitWords(el, { wordClass = 'w' } = {}) {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  return text.split(/\s+/).map((word, i, arr) => {
    const w = document.createElement('span');
    w.className = wordClass;
    w.setAttribute('aria-hidden', 'true');
    w.textContent = word;
    el.appendChild(w);
    if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    return w;
  });
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/\\_-<>*$%ヤクザ影';
export const randomGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/**
 * Scramble a set of char spans towards their real letters.
 * `p` 0..1 — fraction resolved (left → right). Pure function of p so it
 * works with scrubbed timelines in both directions.
 */
export function scrambleTo(chars, p) {
  const n = chars.length;
  chars.forEach((c, i) => {
    if (!c.dataset.ch) c.dataset.ch = c.textContent;
    const t = p * (n + 4) - i;
    if (t >= 4 || p >= 1) c.textContent = c.dataset.ch;
    else if (t <= 0) c.textContent = p <= 0 ? c.dataset.ch : ' ';
    else c.textContent = c.dataset.ch === ' ' ? ' ' : randomGlyph();
  });
}
