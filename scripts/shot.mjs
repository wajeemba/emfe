// Standalone screenshot helper (bypasses the preview tool, which can't capture when the window
// is backgrounded). Usage:
//   node scripts/shot.mjs "<url-path>" <out.png> [width] [height] [light|dark]
// Example:
//   node scripts/shot.mjs "/?z=2000&c=7.435" /tmp/cb.png 1440 900 dark
import { chromium } from 'playwright';

const base = process.env.EMFE_BASE ?? 'http://localhost:5180';
const path = process.argv[2] ?? '/';
const out = process.argv[3] ?? '/tmp/emfe-shot.png';
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
const scheme = process.argv[6] ?? 'dark';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, colorScheme: scheme });
await page.goto(base + path, { waitUntil: 'networkidle' });
await page.waitForTimeout(450); // settle layout/transitions
await page.screenshot({ path: out });
await browser.close();
console.log(`shot → ${out} (${width}x${height}, ${scheme})`);
