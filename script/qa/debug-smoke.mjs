import { chromium } from "@playwright/test";
import { createServer } from "vite";
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../../..");
const evidenceDir = join(root, ".omo/evidence/visual-qa");
await fs.mkdir(evidenceDir, { recursive: true });

const server = await createServer({ root, server: { port: 0 } });
await server.listen();
const url = `http://localhost:${server.config.server.port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: join(evidenceDir, "debug.png") });
const html = await page.content();
console.log(html.slice(0, 1500));
console.log("URL:", url);
console.log("Evidence:", evidenceDir);
await browser.close();
await server.close();
