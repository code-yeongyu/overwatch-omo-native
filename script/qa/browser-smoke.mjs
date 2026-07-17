import { chromium } from "@playwright/test";
import { createServer } from "vite";
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");
const evidenceDir = join(root, ".omo/evidence/visual-qa");
await fs.mkdir(evidenceDir, { recursive: true });

const server = await createServer({
  root,
  server: { port: 0, strictPort: false },
  configFile: false,
});
await server.listen();
const address = server.httpServer.address();
const port = typeof address === "object" && address ? address.port : 5173;
const url = `http://localhost:${port}`;

console.log("Serving from", root, "at", url);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();

await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: join(evidenceDir, "01-lobby.png") });

await page.click("button:has-text('Enter Range')");
await page.waitForTimeout(500);
await page.screenshot({ path: join(evidenceDir, "02-game.png") });

await page.click("[data-h='lock']");
await page.waitForTimeout(200);
await page.evaluate(() => {
  // @ts-expect-error expose for QA
  window.__qaHideLock?.();
});

await page.keyboard.down("w");
await page.waitForTimeout(500);
await page.keyboard.up("w");
await page.screenshot({ path: join(evidenceDir, "03-moved.png") });

for (let i = 0; i < 5; i++) {
  await page.mouse.down();
  await page.waitForTimeout(120);
  await page.mouse.up();
  await page.waitForTimeout(120);
}
await page.screenshot({ path: join(evidenceDir, "04-fired.png") });

await page.keyboard.press("r");
await page.waitForTimeout(300);
await page.screenshot({ path: join(evidenceDir, "05-reload.png") });

await page.keyboard.press("e");
await page.waitForTimeout(300);
await page.screenshot({ path: join(evidenceDir, "06-helix.png") });

await page.keyboard.press("f");
await page.waitForTimeout(300);
await page.screenshot({ path: join(evidenceDir, "08-biotic.png") });

// Trigger Tactical Visor by giving ultimate charge via console and pressing Q
await page.evaluate(() => {
  // @ts-expect-error expose for QA
  window.__qaGiveUltimate?.();
});
await page.keyboard.press("q");
await page.waitForTimeout(300);
await page.screenshot({ path: join(evidenceDir, "07-visor.png") });

await browser.close();
await server.close();

console.log(`Evidence saved to ${evidenceDir}`);
