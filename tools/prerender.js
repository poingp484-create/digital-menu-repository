// prerender.js REPO ASSETS.json : print the home page HTML exactly as the site builds it, for no-script previews
const fs = require('fs'), vm = require('vm');
const repo = process.argv[2], assets = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const window = { SOLEMN: {}, SOLEMN_ASSETS: assets };
const ctx = vm.createContext({ window });
for (const f of ['data.js', 'views.js']) vm.runInContext(fs.readFileSync(`${repo}/assets/js/${f}`, 'utf8'), ctx);
process.stdout.write(window.SOLEMN.views.home().html);
