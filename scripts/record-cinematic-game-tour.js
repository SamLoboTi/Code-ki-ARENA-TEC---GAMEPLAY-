const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const HTML_PATH = path.join(ROOT, "docs", "code-ki-cinematic-tour.html");
const VIDEO_DIR = path.join(ROOT, "docs", "video");
const OUTPUT_PATH = path.join(VIDEO_DIR, "code-ki-game-tour-cinematic.webm");
const CHECK_PATH = path.join(ROOT, "tmp", "code-ki-game-tour-cinematic-check.png");

async function main() {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: [
      "--autoplay-policy=no-user-gesture-required",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1366, height: 768 },
    },
  });

  const page = await context.newPage();
  const url = `file:///${HTML_PATH.replace(/\\/g, "/")}`;
  await page.goto(url, { waitUntil: "load", timeout: 30000 });

  await page.evaluate(async () => {
    const urls = [...document.images].map((img) => img.currentSrc || img.src).filter(Boolean);
    const cssUrls = [...document.styleSheets]
      .flatMap((sheet) => {
        try { return [...sheet.cssRules]; } catch { return []; }
      })
      .map((rule) => rule.cssText || "")
      .join("\n")
      .match(/url\(["']?([^"')]+)["']?\)/g) || [];
    const all = [
      ...urls,
      ...cssUrls.map((entry) => entry.replace(/^url\(["']?/, "").replace(/["']?\)$/, "")),
    ];
    await Promise.all([...new Set(all)].map((src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    })));
  });

  const duration = await page.evaluate(() => window.__tourDurationMs || 43000);
  await page.waitForTimeout(Math.min(52000, duration));
  await page.screenshot({ path: CHECK_PATH, fullPage: false });

  const video = page.video();
  await context.close();
  await browser.close();

  const sourcePath = await video.path();
  if (fs.existsSync(OUTPUT_PATH)) fs.unlinkSync(OUTPUT_PATH);
  fs.renameSync(sourcePath, OUTPUT_PATH);

  console.log(OUTPUT_PATH);
  console.log(CHECK_PATH);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
