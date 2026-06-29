import { test, expect } from '@playwright/test';

test('scientific-notation toggle reformats every tick as m×10ⁿ Hz', async ({ page }) => {
	await page.goto('/');

	// Baseline: ticks read as named decades, no scientific notation.
	await expect(page.locator('text.tick-label', { hasText: '1 MHz' })).toBeVisible();
	await expect(page.locator('text.tick-label tspan.exp')).toHaveCount(0);

	await page.getByRole('switch', { name: /Scientific notation/ }).click();

	// Labels switch to scientific notation (exponent as a raised <tspan>); the SI prefix is gone.
	await expect(page.locator('text.tick-label', { hasText: '×10' })).not.toHaveCount(0);
	await expect(page.locator('text.tick-label tspan.exp')).not.toHaveCount(0);
	await expect(page.locator('text.tick-label', { hasText: 'MHz' })).toHaveCount(0);
});

test('wavelength row is on by default and the toggle hides it', async ({ page }) => {
	await page.goto('/');

	// Wavelength is shown by default now.
	await expect(page.locator('text.lambda-axis', { hasText: 'λ →' })).toBeVisible();
	await expect(page.locator('text.lambda-label')).not.toHaveCount(0);

	await page.getByRole('switch', { name: /Wavelength/ }).click();
	await expect(page.locator('text.lambda-label')).toHaveCount(0);
});

test('theme toggle flips the document data-theme attribute', async ({ page }) => {
	await page.goto('/');

	const html = page.locator('html');
	await expect(html).toHaveAttribute('data-theme', 'dark');

	await page.getByRole('button', { name: /Switch to (light|dark) theme/ }).click();
	await expect(html).toHaveAttribute('data-theme', 'light');

	await page.getByRole('button', { name: /Switch to (light|dark) theme/ }).click();
	await expect(html).toHaveAttribute('data-theme', 'dark');
});
