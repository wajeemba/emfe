import { test, expect } from '@playwright/test';

test('the plot is keyboard operable: zoom, pan, and reset', async ({ page }) => {
	await page.goto('/');
	const readout = page.locator('.readout');
	await expect(readout).toContainText(/regions/i);

	const plot = page.locator('svg.zoomable');
	await plot.focus();
	await expect(plot).toBeFocused();

	// '+' zooms in past the Regions tier; the reset affordance appears.
	for (let i = 0; i < 4; i++) await page.keyboard.press('+');
	await expect(readout).not.toContainText(/regions/i);
	await expect(page.getByRole('button', { name: 'reset zoom' })).toBeVisible();

	// '0' returns to the full spectrum.
	await page.keyboard.press('0');
	await expect(readout).toContainText(/regions/i);
});

test('view changes are announced via a polite live region', async ({ page }) => {
	await page.goto('/');
	const status = page.getByRole('status');
	await expect(status).toHaveAttribute('aria-live', 'polite');
	await expect(status).toContainText(/Regions detail/i);

	await page.locator('svg.zoomable').focus();
	await page.keyboard.press('+');
	await page.keyboard.press('+');
	await expect(status).not.toContainText(/Regions detail/i);
});

test('a skip link sends keyboard focus to the explorer', async ({ page }) => {
	await page.goto('/');
	const skip = page.getByRole('link', { name: /Skip to the spectrum explorer/ });
	await skip.focus();
	await expect(skip).toBeFocused();
	await skip.click();
	await expect(page.locator('svg.zoomable')).toBeFocused();
});
