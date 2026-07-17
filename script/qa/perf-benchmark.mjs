import { chromium } from "@playwright/test";
import { createServer } from "vite";
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");
const evidenceDir = join(root, ".omo/evidence/perf");
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

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

await page.goto(url, { waitUntil: "networkidle" });
await page.click("button:has-text('Enter Practice Range')");
await page.waitForTimeout(500);

// Allow time for dev-window instrumentation to attach.
await page.waitForTimeout(500);

// Perform actions during benchmark
const canvas = await page.locator("canvas");
await canvas.click();
await page.keyboard.down("w");
await page.mouse.down();

await page.waitForTimeout(60000);

await page.mouse.up();
await page.keyboard.up("w");

const times = await page.evaluate(() => {
  const renderTimes = window.__qaRenderTimes ?? [];
  return renderTimes.slice(10);
});
await browser.close();
await server.close();

const sorted = times.slice().sort((a, b) => a - b);
const n = sorted.length;
const stats = {
  samples: n,
  p50: sorted[Math.floor(n * 0.5)],
  p95: sorted[Math.floor(n * 0.95)],
  p99: sorted[Math.floor(n * 0.99)],
  max: sorted[n - 1],
  min: sorted[0],
  avg: times.reduce((a, b) => a + b, 0) / n,
  fps_p50: 1000 / sorted[Math.floor(n * 0.5)],
  fps_p95: 1000 / sorted[Math.floor(n * 0.95)],
  fps_p99: 1000 / sorted[Math.floor(n * 0.99)],
  minFps: 1000 / sorted[n - 1],
  viewport: { width: 1920, height: 1080 },
};

const outPath = join(evidenceDir, "benchmark-1080p.json");
await fs.writeFile(outPath, JSON.stringify(stats, null, 2));
console.log(JSON.stringify(stats, null, 2));
console.log(`Benchmark saved to ${outPath}`);
