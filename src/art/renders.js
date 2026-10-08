/**
 * Procedural placeholder "renders" for every product.
 *
 * These are stand-ins until real product photography lands — set `image`
 * in src/data/products.js and these are bypassed automatically.
 * Drawn as inline SVG so they stay razor sharp at any scale and cost no
 * network requests.
 */
import { layout, polysToD, GLYPHS } from '../brand/logo.js';

let uidCounter = 0;

/* ─── shared defs ─────────────────────────────────────────────────────────── */

const stops = (list) => list.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');

const CHROME = [
  [0, '#ffffff'],
  [0.18, '#dfe3e9'],
  [0.38, '#6e747e'],
  [0.46, '#2b2e33'],
  [0.52, '#f4f6f9'],
  [0.7, '#a3aab5'],
  [0.86, '#5d636c'],
  [1, '#e8ecf1'],
];

function defs(u, extra = '') {
  return `<defs>
    <linearGradient id="${u}-chrome" x1="0" y1="0" x2="0.35" y2="1">${stops(CHROME)}</linearGradient>
    <linearGradient id="${u}-chromeH" x1="0" y1="0" x2="1" y2="0.25">${stops(CHROME)}</linearGradient>
    <linearGradient id="${u}-key" x1="0" y1="0" x2="1" y2="0">${stops([[0, '#000', 0.55], [0.22, '#000', 0], [0.42, '#fff', 0.1], [0.62, '#000', 0], [1, '#000', 0.7]])}</linearGradient>
    <radialGradient id="${u}-shadow" cx=".5" cy=".5" r=".5">${stops([[0, '#000', 0.65], [1, '#000', 0]])}</radialGradient>
    <filter id="${u}-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="${u}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    ${extra}
  </defs>`;
}

const svg = (vb, body, cls = '') =>
  `<svg class="render ${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${body}</svg>`;

/** The logo as a path, scaled + positioned (for prints / engraving). */
function logoPath({ x, y, width, fill, extra = '' }) {
  const { items, width: w } = layout();
  const d = items.map((g) => polysToD(g.polys, g.x)).join('');
  const s = width / (w + 30);
  return `<path transform="translate(${x} ${y}) scale(${s})" fill-rule="evenodd" fill="${fill}" d="${d}" ${extra}/>`;
}
function yGlyph({ x, y, size, fill, extra = '' }) {
  const s = size / 120;
  return `<path transform="translate(${x} ${y}) scale(${s})" fill="${fill}" d="${polysToD(GLYPHS[0].polys)}" ${extra}/>`;
}

const sparkle = (x, y, r, delay = 0) =>
  `<path class="glint" style="animation-delay:${delay}s;transform-origin:${x}px ${y}px" d="M${x} ${y - r} L${x + r * 0.16} ${y - r * 0.16} L${x + r} ${y} L${x + r * 0.16} ${y + r * 0.16} L${x} ${y + r} L${x - r * 0.16} ${y + r * 0.16} L${x - r} ${y} L${x - r * 0.16} ${y - r * 0.16}Z" fill="#fff"/>`;

/* ─── JACKETS ─────────────────────────────────────────────────────────────── */

function jacketOutline(hem) {
  return `M340 128 L205 178 C160 195 140 250 130 330 L96 740 L190 770 L240 382 L228 ${hem} L572 ${hem} L560 382 L610 770 L704 740 L670 330 C660 250 640 195 595 178 L460 128 C440 162 360 162 340 128 Z`;
}
const ARMHOLES = `<path d="M214 182 C246 250 252 330 242 382" /><path d="M586 182 C554 250 548 330 558 382" />`;

function jacket(variant, u) {
  const hem = variant === 'chrome' ? 724 : variant === 'leather' ? 800 : 846;
  const outline = jacketOutline(hem);
  let extraDefs = `<clipPath id="${u}-clip"><path d="${outline}"/></clipPath>`;
  let body = '';
  let over = '';

  if (variant === 'chrome') {
    extraDefs += `<linearGradient id="${u}-puff" x1="0" y1="0" x2="0" y2="1">${stops([[0, '#1d2025'], [0.18, '#7b828d'], [0.4, '#f6f8fb'], [0.58, '#b9c0ca'], [0.8, '#4a4f57'], [1, '#121418']])}</linearGradient>
    <linearGradient id="${u}-env" x1="0" y1="0" x2="1" y2="0">${stops([[0, '#000', 0.6], [0.2, '#fff', 0.15], [0.33, '#000', 0.35], [0.5, '#fff', 0.25], [0.68, '#000', 0.45], [0.82, '#c9a46a', 0.18], [1, '#000', 0.7]])}</linearGradient>`;
    for (let y = 120; y < hem; y += 58) body += `<rect x="60" y="${y}" width="680" height="58" fill="url(#${u}-puff)"/>`;
    body += `<rect x="60" y="100" width="680" height="${hem}" fill="url(#${u}-env)"/>`;
    over += `<path d="M330 92 L470 92 L476 150 C440 170 360 170 324 150 Z" fill="url(#${u}-chrome)" stroke="#111" stroke-width="2"/>`;
    over += `<line x1="400" y1="150" x2="400" y2="${hem}" stroke="#0b0c0e" stroke-width="7"/><line x1="400" y1="150" x2="400" y2="${hem}" stroke="#d7dbe2" stroke-width="3" stroke-dasharray="3 5"/>`;
    over += `<rect x="388" y="168" width="24" height="44" rx="4" fill="url(#${u}-chrome)" stroke="#000" stroke-width="1.5"/>`;
    over += `<rect x="228" y="${hem - 40}" width="344" height="40" fill="#0d0e10" opacity=".65"/>`;
    over += sparkle(300, 250, 26, 0) + sparkle(520, 420, 18, 1.2) + sparkle(160, 600, 14, 2.1);
  } else if (variant === 'bomber') {
    extraDefs += `<linearGradient id="${u}-nylon" x1="0" y1="0" x2="1" y2="1">${stops([[0, '#2a2c31'], [0.35, '#141518'], [0.7, '#0b0b0d'], [1, '#18191c']])}</linearGradient>
    <pattern id="${u}-rib" width="7" height="10" patternUnits="userSpaceOnUse"><rect width="7" height="10" fill="#101113"/><rect width="3" height="10" fill="#1f2125"/></pattern>`;
    body += `<rect x="60" y="100" width="680" height="${hem}" fill="url(#${u}-nylon)"/>`;
    body += `<path d="M150 320 C 250 360 300 520 260 700" stroke="#3a3d44" stroke-width="18" fill="none" opacity=".35" filter="url(#${u}-soft)"/>`;
    body += `<path d="M520 260 C 470 420 520 600 480 800" stroke="#000" stroke-width="30" fill="none" opacity=".45" filter="url(#${u}-soft)"/>`;
    over += `<path d="M340 128 C360 162 440 162 460 128 L486 140 C460 196 340 196 314 140 Z" fill="url(#${u}-rib)"/>`;
    over += `<path d="M352 150 L400 230 L448 150 C430 166 370 166 352 150Z" fill="#8f1018"/>`;
    over += `<rect x="228" y="${hem - 46}" width="344" height="46" fill="url(#${u}-rib)"/>`;
    over += `<path d="M96 740 L190 770 L184 806 L90 778 Z" fill="url(#${u}-rib)"/><path d="M704 740 L610 770 L616 806 L710 778 Z" fill="url(#${u}-rib)"/>`;
    over += `<line x1="400" y1="196" x2="400" y2="${hem - 46}" stroke="#050506" stroke-width="6"/><line x1="400" y1="196" x2="400" y2="${hem - 46}" stroke="#6b6f78" stroke-width="2" stroke-dasharray="2 4"/>`;
    over += `<g transform="rotate(-8 170 420)"><rect x="140" y="390" width="62" height="78" rx="4" fill="#0f1012" stroke="#2f3137"/><line x1="148" y1="400" x2="194" y2="400" stroke="#9aa0aa" stroke-width="3"/><rect x="176" y="396" width="8" height="18" fill="#c7ccd3"/></g>`;
    over += `<rect x="450" y="300" width="64" height="64" fill="#0c0c0d" stroke="#8f1018" stroke-width="2"/><text x="482" y="348" text-anchor="middle" font-size="44" fill="#c3161f" font-family="serif" font-weight="700">影</text>`;
    over += `<path d="M260 470 L330 470" stroke="#2c2e33" stroke-width="3"/><path d="M470 470 L540 470" stroke="#2c2e33" stroke-width="3"/>`;
  } else if (variant === 'motor' || variant === 'racer') {
    const back = variant === 'racer';
    extraDefs += `<linearGradient id="${u}-silver" x1="0" y1="0" x2="1" y2="1">${stops([[0, '#f2f4f7'], [0.3, '#bfc5ce'], [0.55, '#e9ecf0'], [0.75, '#8d949e'], [1, '#c8cdd4']])}</linearGradient>
    <linearGradient id="${u}-blue" x1="0" y1="0" x2="1" y2="1">${stops([[0, '#3b74ff'], [0.5, '#1438a8'], [1, '#0b1e5c']])}</linearGradient>`;
    body += `<rect x="60" y="100" width="680" height="${hem}" fill="url(#${u}-silver)"/>`;
    // livery: blue yoke + chevrons + side panels
    body += `<path d="M120 170 L680 170 L680 262 C560 300 240 300 120 262 Z" fill="url(#${u}-blue)"/>`;
    body += `<path d="M228 520 L400 610 L572 520 L572 580 L400 670 L228 580 Z" fill="url(#${u}-blue)"/>`;
    body += `<path d="M228 640 L400 730 L572 640 L572 670 L400 760 L228 670 Z" fill="#0d1220"/>`;
    body += `<path d="M100 420 L240 400 L240 440 L96 470 Z" fill="url(#${u}-blue)"/><path d="M700 420 L560 400 L560 440 L704 470 Z" fill="url(#${u}-blue)"/>`;
    body += `<rect x="60" y="100" width="680" height="${hem}" fill="url(#${u}-key)"/>`;
    over += `<path d="M330 104 L470 104 L478 140 C440 168 360 168 322 140 Z" fill="#0d0f14"/>`;
    over += `<path d="M228 ${hem - 36} L572 ${hem - 36} L572 ${hem} L228 ${hem} Z" fill="#0d0f14"/><path d="M96 740 L190 770 L186 800 L92 772 Z" fill="#0d0f14"/><path d="M704 740 L610 770 L614 800 L708 772 Z" fill="#0d0f14"/>`;
    over += `<path d="M150 210 Q 200 230 250 210 M550 210 Q 600 230 650 210" stroke="#0a1a4a" stroke-width="2" stroke-dasharray="6 6" fill="none"/>`;
    if (back) {
      over += logoPath({ x: 262, y: 314, width: 290, fill: `url(#${u}-chrome)`, extra: 'stroke="#0d0f14" stroke-width="4"' });
      over += `<text x="400" y="520" text-anchor="middle" font-size="130" font-family="Arial Black, Impact, sans-serif" font-style="italic" fill="#0d0f14">01</text>`;
      over += `<text x="400" y="510" text-anchor="middle" font-size="130" font-family="Arial Black, Impact, sans-serif" font-style="italic" fill="url(#${u}-blue)">01</text>`;
      over += `<text x="400" y="800" text-anchor="middle" font-size="22" letter-spacing="10" font-family="Arial, sans-serif" font-weight="700" fill="#0d0f14">MOST WANTED</text>`;
    } else {
      over += `<line x1="400" y1="150" x2="400" y2="${hem - 36}" stroke="#0d0f14" stroke-width="5"/>`;
      over += `<g transform="translate(450 318) skewX(-14)"><rect width="96" height="58" fill="#0d0f14"/><text x="48" y="45" text-anchor="middle" font-size="46" font-family="Arial Black, Impact, sans-serif" fill="#f2f4f7">01</text></g>`;
      over += logoPath({ x: 262, y: 330, width: 110, fill: '#0d0f14' });
    }
    over += sparkle(250, 200, 22, 0.4) + sparkle(560, 560, 16, 1.6);
  } else {
    // leather
    extraDefs += `<linearGradient id="${u}-hide" x1="0" y1="0" x2="1" y2="0.4">${stops([[0, '#18181b'], [0.22, '#3d3f45'], [0.3, '#0e0e10'], [0.55, '#0a0a0b'], [0.72, '#2a2b30'], [0.78, '#0b0b0c'], [1, '#141416']])}</linearGradient>`;
    body += `<rect x="60" y="100" width="680" height="${hem}" fill="url(#${u}-hide)"/>`;
    body += `<path d="M180 260 C 200 400 190 560 170 720" stroke="#fff" stroke-width="5" fill="none" opacity=".35" filter="url(#${u}-soft)"/>`;
    body += `<path d="M300 300 C 310 420 300 560 290 760" stroke="#fff" stroke-width="3" fill="none" opacity=".25" filter="url(#${u}-soft)"/>`;
    body += `<path d="M620 300 C 640 420 650 560 660 700" stroke="#cfd6ff" stroke-width="4" fill="none" opacity=".18" filter="url(#${u}-soft)"/>`;
    over += `<path d="M340 128 L268 230 L300 300 L360 250 L400 330 L470 190 L460 128 C440 162 360 162 340 128Z" fill="#0b0b0c" stroke="#2c2d31" stroke-width="2"/>`;
    over += `<path d="M460 128 L540 240 L500 300 L470 190 Z" fill="#141416" stroke="#2c2d31" stroke-width="2"/>`;
    over += `<path d="M470 190 L330 ${hem - 40}" stroke="#d6dbe3" stroke-width="5"/><path d="M470 190 L330 ${hem - 40}" stroke="#111" stroke-width="2" stroke-dasharray="2 4"/>`;
    over += `<rect x="228" y="${hem - 40}" width="344" height="40" fill="#0c0c0d" stroke="#2c2d31" stroke-width="2"/><rect x="372" y="${hem - 36}" width="56" height="32" rx="4" fill="none" stroke="url(#${u}-chrome)" stroke-width="7"/>`;
    over += `<path d="M260 470 L330 450 M480 450 L560 470" stroke="#d6dbe3" stroke-width="4"/>`;
    over += `<path d="M120 690 L170 700 M640 700 L690 690" stroke="#d6dbe3" stroke-width="4"/>`;
    over += `<path d="M228 520 L572 520" stroke="#25262a" stroke-width="2" stroke-dasharray="1 7"/>`;
    for (let i = 0; i < 5; i++) over += `<circle cx="${292 + i * 14}" cy="${236 + i * 14}" r="4" fill="url(#${u}-chrome)"/>`;
    over += sparkle(210, 300, 20, 0.2) + sparkle(470, 240, 12, 1.4);
  }

  const shadow = `<ellipse cx="400" cy="${hem + 120}" rx="300" ry="26" fill="url(#${u}-shadow)"/>`;
  return svg(
    '0 0 800 1000',
    `${defs(u, extraDefs)}${shadow}
    <g clip-path="url(#${u}-clip)">${body}<g fill="none" stroke="#000" stroke-opacity=".45" stroke-width="3">${ARMHOLES}</g></g>
    ${over}
    <path d="${outline}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2"/>`,
    'render--apparel',
  );
}

/* ─── TEES ────────────────────────────────────────────────────────────────── */

const TEE = `M328 140 L170 196 C140 210 118 250 106 300 L80 470 L214 512 L236 446 L226 900 L574 900 L564 446 L586 512 L720 470 L694 300 C682 250 660 210 630 196 L472 140 C452 206 348 206 328 140 Z`;

function tee(variant, u) {
  const fabric = {
    core: ['#1b1c1f', '#0c0c0e', '#232428'],
    afterdark: ['#20222a', '#0f1015', '#1a1c24'],
    error: ['#8d9096', '#6d7076', '#9a9da3'],
    ghost: ['#b9bec6', '#8e939c', '#c9ced6'],
  }[variant];
  let extraDefs = `<clipPath id="${u}-clip"><path d="${TEE}"/></clipPath>
    <linearGradient id="${u}-fab" x1="0" y1="0" x2="1" y2="1">${stops([[0, fabric[2]], [0.45, fabric[0]], [1, fabric[1]]])}</linearGradient>`;
  let print = '';
  const dark = variant === 'core' || variant === 'afterdark';
  if (variant === 'core') {
    print = logoPath({ x: 262, y: 300, width: 290, fill: `url(#${u}-chrome)`, extra: `filter="url(#${u}-emboss)"` });
    print += `<text x="400" y="420" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="15" letter-spacing="6" fill="#9aa0aa">ヤクザ — EST. 2000 — TOKYO</text>`;
    extraDefs += `<filter id="${u}-emboss"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity=".8"/></filter>`;
  } else if (variant === 'afterdark') {
    print = `<circle cx="470" cy="320" r="62" fill="#e6e2d6" opacity=".9"/><circle cx="492" cy="306" r="56" fill="url(#${u}-fab)"/>`;
    print += `<text x="330" y="300" font-family="serif" font-size="58" fill="#e6e2d6" writing-mode="tb" letter-spacing="6">東京深夜</text>`;
    print += `<text x="400" y="610" text-anchor="middle" font-family="Michroma, sans-serif" font-size="22" letter-spacing="3" fill="url(#${u}-chromeH)">TOKYO AFTER DARK</text>`;
    print += `<text x="400" y="645" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="3" fill="#7f8796">03:00 — 35.6762° N 139.6503° E</text>`;
    print += `<path d="M260 560 L540 560" stroke="#c9ced6" stroke-width="2"/>`;
  } else if (variant === 'error') {
    print = `<g transform="translate(250 270)">
      <rect width="300" height="190" fill="#c0c0c0" stroke="#fff" stroke-width="3"/><rect x="3" y="3" width="294" height="184" fill="none" stroke="#404040" stroke-width="2"/>
      <rect x="6" y="6" width="288" height="30" fill="#0a246a"/><rect x="6" y="6" width="288" height="30" fill="url(#${u}-title)"/>
      <text x="16" y="27" font-family="Arial, sans-serif" font-weight="700" font-size="16" fill="#fff">2000//ERROR</text>
      <rect x="266" y="10" width="22" height="20" fill="#c0c0c0" stroke="#404040"/><text x="277" y="26" text-anchor="middle" font-family="Arial" font-size="15" font-weight="700">×</text>
      <circle cx="44" cy="84" r="22" fill="#d60000"/><path d="M34 74 L54 94 M54 74 L34 94" stroke="#fff" stroke-width="5"/>
      <text x="80" y="78" font-family="Arial, sans-serif" font-size="14" fill="#000">FATAL EXCEPTION 0x2000</text>
      <text x="80" y="98" font-family="Arial, sans-serif" font-size="13" fill="#000">The future could not be loaded.</text>
      <rect x="110" y="138" width="80" height="30" fill="#c0c0c0" stroke="#000"/><text x="150" y="158" text-anchor="middle" font-family="Arial" font-size="14">OK</text>
    </g>`;
    print += `<text x="400" y="520" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="16" letter-spacing="4" fill="#2a2c30">C:\\YAKUZA\\Y2K.EXE</text>`;
    extraDefs += `<linearGradient id="${u}-title" x1="0" x2="1">${stops([[0, '#0a246a'], [1, '#a6caf0']])}</linearGradient>`;
  } else {
    const px = [
      '..XXXX..',
      '.XXXXXX.',
      'XX.XX.XX',
      'XXXXXXXX',
      'XXXXXXXX',
      'XXXXXXXX',
      'X.XX.XX.',
    ];
    let cells = '';
    px.forEach((row, r) => [...row].forEach((ch, c) => ch === 'X' && (cells += `<rect x="${c * 26}" y="${r * 26}" width="24" height="24"/>`)));
    print = `<g transform="translate(296 270)" fill="#d7ffe9" filter="url(#${u}-glow)">${cells}</g>`;
    print += `<text x="400" y="540" text-anchor="middle" font-family="Michroma, sans-serif" font-size="24" letter-spacing="4" fill="#20242a">DIGITAL GHOST</text>`;
    print += `<text x="400" y="572" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="3" fill="#3a3f47">NOT FOUND — 404 — NOT FOUND</text>`;
  }

  const folds = `<g fill="none" stroke="#000" stroke-opacity="${dark ? 0.5 : 0.25}" filter="url(#${u}-soft)">
      <path d="M250 520 C 290 640 270 760 300 880" stroke-width="16"/><path d="M560 500 C 520 620 548 760 520 880" stroke-width="20"/>
      <path d="M130 360 C 170 400 190 440 214 500" stroke-width="12"/><path d="M670 360 C 630 400 610 440 586 500" stroke-width="12"/></g>
      <g fill="none" stroke="#fff" stroke-opacity="${dark ? 0.08 : 0.25}" filter="url(#${u}-soft)"><path d="M300 480 C 330 620 310 740 340 880" stroke-width="14"/></g>`;
  return svg(
    '0 0 800 1000',
    `${defs(u, extraDefs)}<ellipse cx="400" cy="955" rx="300" ry="24" fill="url(#${u}-shadow)"/>
    <g clip-path="url(#${u}-clip)"><rect x="60" y="120" width="680" height="800" fill="url(#${u}-fab)"/>${print}${folds}
      <rect x="60" y="120" width="680" height="800" fill="url(#${u}-key)" opacity=".8"/></g>
    <path d="M328 140 C348 206 452 206 472 140" fill="none" stroke="${dark ? '#2b2d33' : '#5f636a'}" stroke-width="16"/>
    <path d="${TEE}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="2"/>`,
    'render--apparel',
  );
}

/* ─── SHOES ───────────────────────────────────────────────────────────────── */

const UPPER = `M135 470 L118 330 C116 288 140 262 182 256 L248 250 C272 272 304 282 336 266 L418 212 C444 200 472 210 484 232 L566 300 C650 352 770 382 856 404 C916 420 950 450 946 486 L940 492 Z`;
const MIDSOLE = `M98 458 C160 444 220 474 300 456 C380 438 460 474 560 458 C660 444 760 474 860 466 C905 462 940 472 950 498 L948 540 C944 570 918 586 880 586 L160 586 C120 586 98 566 98 532 Z`;

function shoe(variant, u) {
  const pal = {
    chrome: { upper: [['#e9edf2'], ['#9aa2ad'], ['#f8fafc']], mid: ['#f2f2f0', '#c9c9c6'], out: '#16171a', blade: `url(#${u}-chrome)`, accent: '#c7ccd4', lace: '#e9edf2' },
    tokyo: { upper: [['#f4f2ee'], ['#cfccc5'], ['#ffffff']], mid: ['#ffffff', '#dad6cf'], out: '#c3161f', blade: '#0d0d0f', accent: '#0d0d0f', lace: '#f4f2ee' },
    shadow: { upper: [['#1d1e22'], ['#0b0b0c'], ['#2a2b30']], mid: ['#18181b', '#0d0d0f'], out: '#050506', blade: '#2e3036', accent: '#0f1012', lace: '#1b1c20' },
    cyber: { upper: [['#bfe6ff'], ['#5fa8e6'], ['#e6f6ff']], mid: ['#f4f8fb', '#c8d6e2'], out: '#1a2a44', blade: `url(#${u}-chrome)`, accent: '#e6f6ff', lace: '#ffffff' },
  }[variant];
  const extraDefs = `<linearGradient id="${u}-up" x1="0" y1="0" x2="0.3" y2="1">${stops([[0, pal.upper[2][0]], [0.5, pal.upper[0][0]], [1, pal.upper[1][0]]])}</linearGradient>
    <linearGradient id="${u}-mid" x1="0" y1="0" x2="0" y2="1">${stops([[0, pal.mid[0]], [1, pal.mid[1]]])}</linearGradient>
    <pattern id="${u}-mesh" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.6" fill="#000" opacity=".22"/></pattern>
    <clipPath id="${u}-uclip"><path d="${UPPER}"/></clipPath>
    <linearGradient id="${u}-air" x1="0" x2="1">${stops([[0, '#9fdcff', 0.35], [0.5, '#ffffff', 0.85], [1, '#5fa8e6', 0.4]])}</linearGradient>`;

  let detail = '';
  // toe cap + mudguard + heel counter overlays
  detail += `<path d="M690 386 C800 400 900 420 946 486 L940 492 L690 492 Z" fill="${variant === 'tokyo' ? '#0d0d0f' : pal.accent}" opacity="${variant === 'cyber' ? 0.85 : 1}"/>`;
  detail += `<path d="M135 470 L118 330 C116 300 128 280 160 270 L238 300 L258 470 Z" fill="${variant === 'tokyo' ? '#0d0d0f' : pal.accent}"/>`;
  detail += `<path d="M120 420 L940 440 L940 492 L120 492 Z" fill="#000" opacity=".18"/>`;
  // blade mark
  detail += `<path d="M250 440 L760 360 L700 404 L268 466 Z" fill="${pal.blade}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>`;
  // eyestay + laces
  detail += `<path d="M330 268 L420 214 L600 324 L560 352 Z" fill="${variant === 'shadow' ? '#141518' : '#000'}" opacity="${variant === 'shadow' ? 1 : 0.14}"/>`;
  for (let i = 0; i < 6; i++) {
    const x1 = 372 + i * 38;
    const y1 = 246 + i * 20;
    detail += `<line x1="${x1}" y1="${y1}" x2="${x1 + 30}" y2="${y1 + 34}" stroke="${pal.lace}" stroke-width="7" stroke-linecap="round"/><circle cx="${x1}" cy="${y1}" r="4" fill="#000" opacity=".6"/>`;
  }
  // heel tab + tongue
  detail += `<path d="M122 300 L170 262 L182 300 L132 340 Z" fill="${variant === 'tokyo' ? '#c3161f' : pal.blade}"/>`;
  detail += `<path d="M418 212 C430 168 470 160 490 186 L484 232 C472 210 444 200 418 212Z" fill="${variant === 'tokyo' ? '#0d0d0f' : pal.accent}" stroke="#000" stroke-opacity=".3"/>`;
  if (variant === 'chrome') {
    for (let i = 0; i < 5; i++) detail += `<path d="M${300 + i * 90} 470 C ${330 + i * 90} 400 ${360 + i * 90} 340 ${420 + i * 80} 300" stroke="url(#${u}-chrome)" stroke-width="10" fill="none" opacity=".95"/>`;
  }

  const air = variant === 'cyber' ? `<rect x="180" y="500" width="240" height="44" rx="22" fill="url(#${u}-air)" stroke="#fff" stroke-opacity=".7"/>` : '';
  const tread = Array.from({ length: 22 }, (_, i) => `<rect x="${150 + i * 34}" y="572" width="16" height="14" fill="#000" opacity=".35"/>`).join('');

  const sparkles = variant === 'shadow' ? sparkle(760, 380, 12, 0.6) : sparkle(560, 380, 22, 0.2) + sparkle(860, 450, 16, 1.3);
  return svg(
    '0 0 1000 680',
    `${defs(u, extraDefs)}<ellipse cx="520" cy="612" rx="420" ry="22" fill="url(#${u}-shadow)"/>
    <g transform="translate(0 492) scale(1 1.2) translate(0 -492)">
    <path d="${UPPER}" fill="url(#${u}-up)"/>
    <g clip-path="url(#${u}-uclip)"><rect x="100" y="140" width="860" height="360" fill="url(#${u}-mesh)"/>${detail}
      <rect x="100" y="140" width="860" height="360" fill="url(#${u}-key)" opacity=".7"/></g>
    <path d="${UPPER}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2"/></g>
    <path d="${MIDSOLE}" fill="url(#${u}-mid)" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
    <path d="M98 556 L950 556 L948 540 C944 570 918 586 880 586 L160 586 C120 586 98 566 98 556Z" fill="${pal.out}"/>
    ${tread}${air}
    <path d="M140 478 C300 470 600 486 930 482" stroke="#000" stroke-opacity=".25" stroke-width="2" fill="none" stroke-dasharray="4 6"/>
    ${sparkles}`,
    'render--shoe',
  );
}

/* ─── JEWELRY ─────────────────────────────────────────────────────────────── */

function jewelry(variant, u) {
  const extraDefs = `<linearGradient id="${u}-steel" x1="0" y1="0" x2="1" y2="1">${stops([[0, '#f6f7f9'], [0.25, '#8d939c'], [0.5, '#e9ecf0'], [0.75, '#5b6068'], [1, '#d1d5db']])}</linearGradient>
    <linearGradient id="${u}-dark" x1="0" y1="0" x2="1" y2="1">${stops([[0, '#3b3f46'], [0.5, '#0e0f12'], [1, '#2b2e34']])}</linearGradient>
    <pattern id="${u}-brush" width="300" height="4" patternUnits="userSpaceOnUse"><rect width="300" height="1" fill="#fff" opacity=".18"/><rect y="2" width="200" height="1" fill="#000" opacity=".12"/></pattern>`;
  let body = '';
  if (variant === 'chain') {
    const links = [];
    const N = 38;
    for (let i = 0; i <= N; i++) {
      const t = -Math.PI / 2 + (Math.PI * i) / N;
      const x = 400 + 270 * Math.sin(t);
      const y = 30 + 500 * Math.cos(t);
      const dx = 270 * Math.cos(t);
      const dy = -500 * Math.sin(t);
      const a = (Math.atan2(dy, dx) * 180) / Math.PI;
      links.push(
        `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)})"><ellipse rx="25" ry="${i % 2 ? 13 : 16}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="13"/><ellipse rx="25" ry="${i % 2 ? 13 : 16}" fill="none" stroke="url(#${u}-chrome)" stroke-width="9"/><path d="M-14 -${i % 2 ? 9 : 12} Q0 -${i % 2 ? 15 : 18} 14 -${i % 2 ? 9 : 12}" stroke="#fff" stroke-width="2.5" fill="none" opacity=".9"/></g>`,
      );
    }
    body += links.join('');
    body += `<circle cx="400" cy="566" r="18" fill="none" stroke="url(#${u}-chrome)" stroke-width="9"/>`;
    body += yGlyph({ x: 330, y: 590, size: 160, fill: `url(#${u}-chrome)`, extra: 'stroke="#000" stroke-opacity=".5" stroke-width="3"' });
    body += sparkle(395, 640, 30, 0) + sparkle(205, 380, 18, 1) + sparkle(610, 260, 14, 1.8);
  } else if (variant === 'cross') {
    for (let i = 0; i < 34; i++) {
      const t = i / 33;
      const x = 230 + 340 * t;
      const y = 20 + 230 * (1 - Math.pow(2 * t - 1, 2));
      body += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="url(#${u}-steel)" stroke="#000" stroke-opacity=".4"/>`;
    }
    const cross = (o) => `M${360 + o} ${270 + o} L${440 - o} ${270 + o} L${440 - o} ${370 + o} L${560 - o} ${370 + o} L${560 - o} ${450 - o} L${440 - o} ${450 - o} L${440 - o} ${740 - o} L${360 + o} ${740 - o} L${360 + o} ${450 - o} L${240 + o} ${450 - o} L${240 + o} ${370 + o} L${360 + o} ${370 + o} Z`;
    body += `<circle cx="400" cy="256" r="18" fill="none" stroke="url(#${u}-chrome)" stroke-width="8"/>`;
    body += `<path d="${cross(0)}" fill="url(#${u}-chrome)" stroke="#000" stroke-opacity=".6" stroke-width="2"/>`;
    body += `<path d="${cross(18)}" fill="url(#${u}-chromeH)" opacity=".9"/>`;
    body += `<path d="${cross(30)}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>`;
    body += `<text x="400" y="500" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="16" fill="#2b2e33" writing-mode="tb" letter-spacing="8">YAKUZA</text>`;
    body += sparkle(372, 300, 30, 0.3) + sparkle(540, 395, 20, 1.1) + sparkle(410, 700, 16, 2);
  } else if (variant === 'signet') {
    body += `<ellipse cx="400" cy="470" rx="220" ry="150" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="72"/>`;
    body += `<ellipse cx="400" cy="470" rx="220" ry="150" fill="none" stroke="url(#${u}-chromeH)" stroke-width="62"/>`;
    body += `<ellipse cx="400" cy="458" rx="196" ry="128" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`;
    body += `<path d="M230 300 C230 220 570 220 570 300 L560 360 C540 420 260 420 240 360 Z" fill="url(#${u}-chrome)" stroke="#000" stroke-opacity=".5" stroke-width="2"/>`;
    body += `<ellipse cx="400" cy="300" rx="150" ry="70" fill="url(#${u}-dark)"/><ellipse cx="400" cy="300" rx="150" ry="70" fill="none" stroke="url(#${u}-chromeH)" stroke-width="10"/>`;
    body += `<g transform="translate(400 300) scale(1 .52) translate(-400 -300)">${yGlyph({ x: 352, y: 238, size: 110, fill: `url(#${u}-chrome)` })}</g>`;
    body += sparkle(300, 250, 24, 0.4) + sparkle(600, 470, 18, 1.5);
  } else {
    // dogtag
    for (let i = 0; i < 40; i++) {
      const t = i / 39;
      const x = 180 + 440 * t;
      const y = 30 + 210 * (1 - Math.pow(2 * t - 1, 2));
      body += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5" fill="url(#${u}-steel)" stroke="#000" stroke-opacity=".4"/>`;
    }
    const tag = (tx, ty, rot, lines) => `<g transform="translate(${tx} ${ty}) rotate(${rot})">
      <path d="M-115 -170 Q-115 -200 -85 -200 L85 -200 Q115 -200 115 -170 L115 -40 Q100 -30 115 -20 L115 170 Q115 200 85 200 L-85 200 Q-115 200 -115 170 Z" fill="url(#${u}-steel)" stroke="#000" stroke-opacity=".55" stroke-width="2"/>
      <path d="M-115 -170 Q-115 -200 -85 -200 L85 -200 Q115 -200 115 -170 L115 -40 Q100 -30 115 -20 L115 170 Q115 200 85 200 L-85 200 Q-115 200 -115 170 Z" fill="url(#${u}-brush)"/>
      <path d="M-100 -160 Q-100 -185 -75 -185 L75 -185 Q100 -185 100 -160 L100 160 Q100 185 75 185 L-75 185 Q-100 185 -100 160 Z" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>
      <circle cx="0" cy="-160" r="12" fill="#0a0a0b"/>
      ${lines.map((l, i) => `<text x="-82" y="${-90 + i * 52}" font-family="JetBrains Mono, monospace" font-weight="700" font-size="24" fill="#2a2d33" opacity=".85">${l}</text><text x="-81" y="${-89 + i * 52}" font-family="JetBrains Mono, monospace" font-weight="700" font-size="24" fill="#fff" opacity=".35">${l}</text>`).join('')}
    </g>`;
    body += tag(330, 450, -8, ['YAKUZA', 'Y2K-2000', '0417 26', 'CHROME']);
    body += tag(480, 470, 10, ['YAKUZA', 'NO.0001', 'TOKYO', 'O NEG']);
    body += sparkle(300, 300, 24, 0.5) + sparkle(560, 620, 16, 1.4);
  }
  return svg('0 0 800 800', `${defs(u, extraDefs)}<ellipse cx="400" cy="760" rx="260" ry="18" fill="url(#${u}-shadow)"/>${body}`, 'render--jewelry');
}

/* ─── public API ──────────────────────────────────────────────────────────── */

const RENDERERS = { jacket, tee, shoe, jewelry };

/** Returns markup for a product's visual: real image if provided, else procedural SVG. */
export function productVisual(product, { eager = false } = {}) {
  if (product.image) {
    const alt = `${product.name.join(' ')} — YAKUZA`;
    return `<img class="render render--photo render--${product.art.type}" src="${product.image}" alt="${alt}" ${eager ? '' : 'loading="lazy"'} decoding="async" draggable="false" />`;
  }
  const u = `r${(uidCounter++).toString(36)}`;
  return RENDERERS[product.art.type](product.art.variant, u);
}

/** Rasterisable SVG string (no web fonts) for use as a WebGL texture. */
export function productSVGString(product) {
  const u = `t${(uidCounter++).toString(36)}`;
  return RENDERERS[product.art.type](product.art.variant, u).replace('<svg ', '<svg width="1200" height="1500" ');
}
