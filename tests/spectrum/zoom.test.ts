import { describe, it, expect } from 'vitest';
import { clampZoom, clampCenter, zoomAbout, panByFraction, ZOOM_RANGE } from '$lib/spectrum/zoom';
import { FULL_DOMAIN, windowDomain, decades } from '$lib/spectrum/scale';

const FULL = FULL_DOMAIN;
const center = (FULL.minExp + FULL.maxExp) / 2; // 12
const fullView = { centerExp: center, zoom: 1 };

describe('clampZoom', () => {
	it('keeps magnification within range', () => {
		expect(clampZoom(0.1)).toBe(ZOOM_RANGE.min);
		expect(clampZoom(1e9)).toBe(ZOOM_RANGE.max);
		expect(clampZoom(4)).toBe(4);
	});
});

describe('clampCenter', () => {
	it('pins the center to mid-spectrum when fully zoomed out', () => {
		expect(clampCenter(0, FULL, 1)).toBe(center);
		expect(clampCenter(24, FULL, 1)).toBe(center);
	});

	it('keeps the window inside the full domain when zoomed in', () => {
		// At zoom 2 the span is 12 decades, so center is bounded to [6, 18].
		expect(clampCenter(0, FULL, 2)).toBe(6);
		expect(clampCenter(24, FULL, 2)).toBe(18);
		expect(clampCenter(10, FULL, 2)).toBe(10);
	});
});

describe('zoomAbout', () => {
	it('zooms in, increasing magnification', () => {
		const next = zoomAbout(fullView, FULL, 0.5, 2);
		expect(next.zoom).toBe(2);
	});

	it('keeps the frequency under the cursor fixed', () => {
		// Anchor at the right edge (anchor01 = 1) of the full view → top of the domain.
		const before = windowDomain(FULL, fullView.centerExp, fullView.zoom);
		const anchorExp = before.minExp + 1 * (before.maxExp - before.minExp); // 24
		const next = zoomAbout(fullView, FULL, 1, 4);
		const after = windowDomain(FULL, next.centerExp, next.zoom);
		const stillAt = after.minExp + 1 * (after.maxExp - after.minExp);
		expect(stillAt).toBeCloseTo(anchorExp, 6);
	});

	it('respects the zoom ceiling', () => {
		const next = zoomAbout({ centerExp: center, zoom: ZOOM_RANGE.max }, FULL, 0.5, 4);
		expect(next.zoom).toBe(ZOOM_RANGE.max);
	});

	it('never produces a window outside the full domain', () => {
		const next = zoomAbout(fullView, FULL, 0, 8); // anchor hard left
		const d = windowDomain(FULL, next.centerExp, next.zoom);
		expect(d.minExp).toBeGreaterThanOrEqual(FULL.minExp - 1e-9);
		expect(d.maxExp).toBeLessThanOrEqual(FULL.maxExp + 1e-9);
	});
});

describe('panByFraction', () => {
	it('shifts the center toward higher frequency for positive fractions', () => {
		const zoomedIn = { centerExp: center, zoom: 4 }; // span = 6 decades
		const next = panByFraction(zoomedIn, FULL, 0.5);
		expect(next.centerExp).toBeCloseTo(center + 0.5 * (decades(FULL) / 4), 6);
		expect(next.zoom).toBe(4);
	});

	it('cannot pan past the domain edge', () => {
		const zoomedIn = { centerExp: 18, zoom: 2 }; // span 12, max center 18
		const next = panByFraction(zoomedIn, FULL, 5);
		expect(next.centerExp).toBe(18);
	});

	it('is a no-op at full zoom (no room to pan)', () => {
		const next = panByFraction(fullView, FULL, 1);
		expect(next.centerExp).toBe(center);
	});
});
