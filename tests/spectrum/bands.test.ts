import { describe, it, expect } from 'vitest';
import { ITU_BANDS, REGIONS, bandGradientStops } from '$lib/spectrum/bands';
import { FULL_DOMAIN } from '$lib/spectrum/scale';

describe('REGIONS', () => {
	it('has the seven great regions in order', () => {
		expect(REGIONS.map((r) => r.id)).toEqual([
			'radio',
			'microwave',
			'infrared',
			'visible',
			'uv',
			'xray',
			'gamma'
		]);
	});

	it('tiles the full spectrum contiguously (1 Hz → 10^24 Hz)', () => {
		expect(REGIONS[0].lo).toBe(1);
		expect(REGIONS.at(-1)?.hi).toBe(1e24);
		for (let i = 1; i < REGIONS.length; i++) {
			expect(REGIONS[i].lo).toBe(REGIONS[i - 1].hi);
		}
	});

	it('references colors only as CSS variables', () => {
		for (const r of REGIONS) expect(r.colorVar).toMatch(/^var\(--/);
	});
});

describe('ITU_BANDS', () => {
	it('has 12 bands ELF → THF, contiguous from 3 Hz to 3 THz', () => {
		expect(ITU_BANDS).toHaveLength(12);
		expect(ITU_BANDS[0].abbr).toBe('ELF');
		expect(ITU_BANDS[0].lo).toBe(3);
		expect(ITU_BANDS.at(-1)?.abbr).toBe('THF');
		expect(ITU_BANDS.at(-1)?.hi).toBe(3e12);
		for (let i = 1; i < ITU_BANDS.length; i++) {
			expect(ITU_BANDS[i].lo).toBe(ITU_BANDS[i - 1].hi);
		}
	});
});

describe('bandGradientStops', () => {
	const stops = bandGradientStops(FULL_DOMAIN);

	it('fades to transparent at both ends', () => {
		expect(stops[0]).toMatchObject({ offset: 0, opacity: 0 });
		expect(stops.at(-1)).toMatchObject({ offset: 1, opacity: 0 });
	});

	it('has monotonically non-decreasing offsets within [0,1]', () => {
		for (let i = 1; i < stops.length; i++) {
			expect(stops[i].offset).toBeGreaterThanOrEqual(stops[i - 1].offset);
		}
		for (const s of stops) {
			expect(s.offset).toBeGreaterThanOrEqual(0);
			expect(s.offset).toBeLessThanOrEqual(1);
		}
	});

	it('uses CSS-variable colors only', () => {
		for (const s of stops) expect(s.color).toMatch(/^var\(--/);
	});
});
