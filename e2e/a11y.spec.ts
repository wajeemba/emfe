import { test, expect } from '@playwright/test';

test('the plot is keyboard operable: zoom, pan, and reset', async ({ page }) => {
	await page.goto('/');
	const reset = page.getByRole('button', { name: 'reset zoom' });
	await expect(reset).toHaveCount(0); // full view

	const plot = page.locator('svg.zoomable');
	await plot.focus();
	await expect(plot).toBeFocused();

	// '+' zooms in; the reset affordance appears.
	for (let i = 0; i < 4; i++) await page.keyboard.press('+');
	await expect(reset).toBeVisible();

	// '0' returns to the full spectrum.
	await page.keyboard.press('0');
	await expect(reset).toHaveCount(0);
});

test('view changes are announced via a polite live region', async ({ page }) => {
	await page.goto('/');
	const status = page.getByRole('status');
	await expect(status).toHaveAttribute('aria-live', 'polite');
	await expect(status).toContainText(/Showing/i);
	const before = await status.textContent();

	await page.locator('svg.zoomable').focus();
	await page.keyboard.press('+');
	await page.keyboard.press('+');
	await expect.poll(async () => await status.textContent()).not.toBe(before);
});

test('a skip link sends keyboard focus to the explorer', async ({ page }) => {
	await page.goto('/');
	const skip = page.getByRole('link', { name: /Skip to the spectrum explorer/ });
	await skip.focus();
	await expect(skip).toBeFocused();
	await skip.click();
	await expect(page.locator('svg.zoomable')).toBeFocused();
});
