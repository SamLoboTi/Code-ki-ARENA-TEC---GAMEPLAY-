const path = require("path");
const { chromium } = require("playwright");

async function main() {
  const videoPath = path.resolve(__dirname, "..", "docs", "video", "code-ki-game-tour.webm");
  const videoUrl = `file:///${videoPath.replace(/\\/g, "/")}`;

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });

  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await page.setContent(`
    <video id="video" src="${videoUrl}" style="width:1366px;height:768px" muted></video>
    <canvas id="canvas" width="1366" height="768"></canvas>
  `);

  const metadata = await page.evaluate(async () => {
    const video = document.getElementById("video");
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = () => reject(new Error("video error"));
    });
    video.currentTime = Math.min(8, video.duration / 2);
    await new Promise((resolve) => {
      video.onseeked = resolve;
    });
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, 1366, 768);
    const pixels = context.getImageData(0, 0, 1366, 768).data;
    let sampleSum = 0;
    for (let i = 0; i < pixels.length; i += 5000) {
      sampleSum += pixels[i] + pixels[i + 1] + pixels[i + 2];
    }
    return {
      duration: Number(video.duration.toFixed(2)),
      width: video.videoWidth,
      height: video.videoHeight,
      sampleSum,
    };
  });

  await page.screenshot({
    path: path.resolve(__dirname, "..", "tmp", "code-ki-game-tour-video-check.png"),
    fullPage: true,
  });
  console.log(JSON.stringify(metadata, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
