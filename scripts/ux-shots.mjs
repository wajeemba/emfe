/** Quick UX screenshots for mobile/desktop states. node scripts/ux-shots.mjs */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:5180';
const OUT =
	process.env.SHOT_DIR ??
	'/tmp/claude-0/-home-user-emfe/1e364053-4240-5068-a53d-40d7bd2749c0/scratchpad/shots';
mkdirSync(OUT, { recursive: true });

const STATES = [
	{ tag: 'land-closed', w: 844, h: 390, openControls: false },
	{ tag: 'land-open', w: 844, h: 390, openControls: true },
	{ tag: 'port-closed', w: 390, h: 844, openControls: false },
	{ tag: 'port-open', w: 390, h: 844, openControls: true },
	{ tag: 'desk-drawer', w: 1440, h: 900, openControls: false, clickMarker: true },
	{ tag: 'port-drawer', w: 390, h: 844, openControls: false, clickMarker: true }
];

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const s of STATES) {
	const ctx = await browser.newContext({
		viewport: { width: s.w, height: s.h },
		deviceScaleFactor: 2,
		isMobile: true,
		hasTouch: true
	});
	const page = await ctx.newPage();
	await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(300);
	if (s.openControls) {
		const btn = page.locator('button[aria-controls="dock-body"]').first();
		if (await btn.count()) {
			await btn.click().catch(() => {});
			await page.waitForTimeout(400);
		}
	}
	if (s.clickMarker) {
		// Deep-link a selection so the inspector drawer opens deterministically.
		await page.goto(`${BASE}/?z=8&c=7.5&sel=fm`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(500);
	}
	await page.screenshot({ path: `${OUT}/ux-${s.tag}.png` });
	console.log(`shot ux-${s.tag} (${s.w}x${s.h})`);
	await ctx.close();
}
await browser.close();
