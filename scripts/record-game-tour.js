const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const GAME_URL = "https://classical-numeric-garbage-dramatically.trycloudflare.com/";
const ROOT = path.resolve(__dirname, "..");
const VIDEO_DIR = path.join(ROOT, "docs", "video");
const OUTPUT_NAME = "code-ki-game-tour.webm";
const OUTPUT_PATH = path.join(VIDEO_DIR, OUTPUT_NAME);
const SCREENSHOT_PATH = path.join(ROOT, "tmp", "code-ki-game-tour-check.png");

async function pause(page, ms = 1200) {
  await page.waitForTimeout(ms);
}

async function caption(page, text) {
  await page.evaluate((value) => {
    const captionEl = document.querySelector("[data-tour-caption]");
    if (captionEl) captionEl.textContent = value;
  }, text);
  await pause(page, 900);
}

async function clickFirst(page, locator, label) {
  const count = await locator.count();
  if (!count) throw new Error(`Nao encontrei o alvo: ${label}`);
  await locator.first().click();
}

async function main() {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1366, height: 768 },
    },
  });

  await context.addInitScript(() => {
    localStorage.clear();
  });

  const page = await context.newPage();
  await page.goto(GAME_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});

  await page.addStyleTag({
    content: `
      [data-tour-caption] {
        position: fixed;
        left: 50%;
        bottom: 22px;
        transform: translateX(-50%);
        z-index: 999999;
        max-width: min(980px, calc(100vw - 36px));
        padding: 13px 18px;
        border: 1px solid rgba(72, 213, 255, 0.6);
        border-radius: 8px;
        background: rgba(3, 7, 18, 0.78);
        color: #f8fcff;
        font: 800 17px/1.35 Inter, Segoe UI, sans-serif;
        box-shadow: 0 18px 60px rgba(0,0,0,0.45), 0 0 28px rgba(72,213,255,0.22);
        backdrop-filter: blur(14px);
        text-align: center;
        pointer-events: none;
      }
    `,
  });
  await page.evaluate(() => {
    const el = document.createElement("div");
    el.setAttribute("data-tour-caption", "");
    document.body.appendChild(el);
  });

  await caption(page, "Admin Console: o administrador busca um nick, carrega conta existente ou cria a primeira conta.");
  await clickFirst(page, page.getByRole("button", { name: "Android 18" }), "Android 18");
  await caption(page, "O admin escolhe o personagem inicial antes de abrir o perfil do jogador.");

  await page.getByPlaceholder("PiccoloMaster").fill("NeoPython");
  await caption(page, "Nick informado: o sistema vai verificar se ja existe uma conta local.");
  await page.getByRole("button", { name: "Validar acesso" }).click();
  await pause(page, 900);
  await page.getByRole("button", { name: "Verificar jogador" }).click();
  await page.waitForSelector(".app", { timeout: 15000 });

  await caption(page, "Player Dashboard: XP, moedas, cristais e combos ficam ligados ao perfil do jogador.");
  await pause(page, 1200);

  await caption(page, "O jogador pode trocar o personagem sem perder progresso.");
  await clickFirst(page, page.locator(".fighter-picker button").filter({ hasText: "Piccolo" }), "Piccolo no seletor");
  await pause(page, 1300);

  await caption(page, "Desafio interpretativo: a pergunta explica conceito, codigo, dica e exemplo.");
  await clickFirst(
    page,
    page.getByRole("button", {
      name: /Uma linguagem de programacao usada para criar sistemas/,
    }),
    "resposta correta Python",
  );
  await pause(page, 1800);

  await caption(page, "Ao acertar, a resposta vira ataque: XP, moedas e combo aumentam.");
  await clickFirst(page, page.getByRole("button", { name: /Proximo/ }), "Proximo");
  await pause(page, 900);

  await caption(page, "As arenas sao especificas por jogo: Python, Java, JavaScript e SQL.");
  await clickFirst(page, page.locator(".language-card").filter({ hasText: "SQL" }), "Arena SQL");
  await pause(page, 800);
  await clickFirst(page, page.locator(".difficulty-row button").filter({ hasText: "Intermediario" }), "Dificuldade Intermediario");
  await pause(page, 1200);

  await caption(page, "Modo dificil de aprendizado: interpretar uma consulta SQL completa.");
  await clickFirst(
    page,
    page.getByRole("button", {
      name: /Seleciona nome, data e ano da tabela users/,
    }),
    "resposta correta SQL",
  );
  await pause(page, 1800);

  await caption(page, "Apos a batalha, o dashboard registra historico, arena atual, boss e recompensas.");
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: false });
  await pause(page, 1400);

  await clickFirst(page, page.locator(".mode-switch button").filter({ hasText: "Admin Console" }), "Admin Console");
  await page.waitForSelector(".admin-console", { timeout: 7000 }).catch(() => {});
  await caption(page, "Volta ao Admin Console: o administrador pode buscar outro nick ou reabrir a conta.");
  await pause(page, 1200);

  const video = page.video();
  await context.close();
  await browser.close();

  const sourcePath = await video.path();
  if (fs.existsSync(OUTPUT_PATH)) fs.unlinkSync(OUTPUT_PATH);
  fs.renameSync(sourcePath, OUTPUT_PATH);

  console.log(OUTPUT_PATH);
  console.log(SCREENSHOT_PATH);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
