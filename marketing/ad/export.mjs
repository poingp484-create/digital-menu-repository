// Renders feed.png and feed.mp4 from feed.html.
// Usage: node marketing/ad/export.mjs  (needs Playwright and ffmpeg)
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(path.join(dir, "feed.html")).href + "?export";
const FPS = 30;
const SECONDS = 8;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(url);
await page.evaluate(() => document.fonts.ready);

await page.evaluate(() => window.renderFrame(4.5));
await page.screenshot({ path: path.join(dir, "feed.png") });

const frames = mkdtempSync(path.join(tmpdir(), "gokudo-ad-"));
for (let i = 0; i < FPS * SECONDS; i++) {
  await page.evaluate((t) => window.renderFrame(t), i / FPS);
  await page.screenshot({ path: path.join(frames, `${String(i).padStart(4, "0")}.png`) });
}
await browser.close();

execFileSync("ffmpeg", [
  "-y", "-loglevel", "error",
  "-framerate", String(FPS),
  "-i", path.join(frames, "%04d.png"),
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-movflags", "+faststart",
  path.join(dir, "feed.mp4"),
]);
rmSync(frames, { recursive: true, force: true });
console.log("wrote feed.png and feed.mp4");
