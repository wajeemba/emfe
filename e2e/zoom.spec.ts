import { test, expect, type Page } from '@playwright/test';

/** Dispatch wheel gestures over the plot (synthetic, so we can set shiftKey for pan). */
async function wheelOnPlot(
	page: Page,
	opts: { deltaY: number; shift?: boolean; steps?: number; anchorFrac?: number }
) {
	const { deltaY, shift = false, steps = 1, anchorFrac = 0.5 } = opts;
	await page.evaluate(
		({ deltaY, shift, steps, anchorFrac }) => {
			const svg = document.querySelector('svg.zoomable')!;
			const r = svg.getBoundingClientRect();
			const cx = r.left + r.width * anchorFrac;
			const cy = r.top + r.height / 2;
			for (let i = 0; i < steps; i++) {
				svg.dispatchEvent(
					new WheelEvent('wheel', {
						deltaY,
						clientX: cx,
						clientY: cy,
						shiftKey: shift,
						bubbles: true,
						cancelable: true
					})
				);
			}
		},
		{ deltaY, shift, steps, anchorFrac }
	);
}

test('scroll zooms in; reset returns to the full spectrum', async ({ page }) => {
	await page.goto('/');
	const reset = page.getByRole('button', { name: 'reset zoom' });
	await expect(reset).toHaveCount(0); // full view: nothing to reset

	// Zoom in over the microwave cluster.
	await wheelOnPlot(page, { deltaY: -120, steps: 14, anchorFrac: 0.41 });

	// The reset affordance appears and markers are rendered.
	await expect(reset).toBeVisible();
	await expect(page.locator('svg g.marker')).not.toHaveCount(0);

	await reset.click();
	await expect(reset).toHaveCount(0);
});

test('shift+scroll pans the visible window', async ({ page }) => {
	await page.goto('/');
	await wheelOnPlot(page, { deltaY: -120, steps: 10, anchorFrac: 0.4 }); // zoom in first

	const ticksBefore = (await page.locator('svg text.tick-label').allTextContents()).join('|');
	await wheelOnPlot(page, { deltaY: 500, shift: true, steps: 4 }); // pan toward higher frequency

	await expect
		.poll(async () => (await page.locator('svg text.tick-label').allTextContents()).join('|'))
		.not.toBe(ticksBefore);
});
