const path = require("path");
const { chromium } = require("playwright");

async function main() {
  const root = path.resolve(__dirname, "..");
  const videoDir = path.join(root, "docs", "video");
  const htmlPath = path.join(root, "docs", "dashboard-demo-safe.html");
  const outputName = "think-dashboard-demo-seguro.webm";

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1366, height: 768 },
    },
  });

  const page = await context.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`);
  await page.waitForTimeout(41500);

  const video = page.video();
  await context.close();
  await browser.close();

  const sourcePath = await video.path();
  const targetPath = path.join(videoDir, outputName);
  const fs = require("fs");
  if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
  fs.renameSync(sourcePath, targetPath);
  console.log(targetPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
