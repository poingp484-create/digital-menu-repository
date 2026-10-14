// Draw "Dombivli" onto the cleaned card where "Click HERE for location" was: same centre, baseline, cap height, colour and soft shadow.
const { chromium } = require(process.env.PW || 'playwright');
const fs = require('fs');
const [,, inPng, outPng, word = 'Dombivli'] = process.argv;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  await p.setContent('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gilda+Display&display=swap"><canvas id=c></canvas>');
  const src = 'data:image/png;base64,' + fs.readFileSync(inPng).toString('base64');
  const out = await p.evaluate(async ({ src, word }) => {
    await document.fonts.load('100px "Gilda Display"');
    const img = new Image(); img.src = src; await img.decode();
    const c = document.getElementById('c'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    g.font = '100px "Gilda Display"';
    const cap = g.measureText('H').actualBoundingBoxAscent;           // cap height at 100px
    const size = 29 / cap * 100;                                      // match the original 29 px capitals
    g.font = size + 'px "Gilda Display"';
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillStyle = '#12346e';
    g.shadowColor = 'rgba(0,0,0,0.09)'; g.shadowBlur = 4; g.shadowOffsetX = 1; g.shadowOffsetY = 2;
    g.fillText(word, 696.5, 1747.5);
    return { size, png: c.toDataURL('image/png') };
  }, { src, word });
  fs.writeFileSync(outPng, Buffer.from(out.png.split(',')[1], 'base64'));
  console.log('font size', out.size.toFixed(2));
  await b.close();
})();
