/**
 * Turns dist/index.html into a hostable fragment (dist/yakuza.html) for
 * environments that wrap the page in their own <html>/<head>/<body>
 * skeleton: keeps <title>, metas-that-matter, styles and scripts in order.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/);
const bodyClass = (body[1].match(/class="([^"]*)"/) || [])[1] || '';
const keepHead = head
  .split('\n')
  .filter((l) => !/<meta charset|<meta name="viewport"/.test(l))
  .join('\n');
const out = `${keepHead.trim()}
<script>document.body.className = ${JSON.stringify(bodyClass)};</script>
${body[2].trim()}
`;
writeFileSync('dist/yakuza.html', out);
console.log('dist/yakuza.html', out.length, 'bytes');
