import { describe, it, expect } from 'vitest';
import {
	LOD,
	LOD_LABELS,
	isVisibleAtLod,
	lodForDomain,
	lodForSpan,
	type Lod
} from '$lib/spectrum/lod';
import { FULL_DOMAIN } from '$lib/spectrum/scale';

describe('lodForSpan', () => {
	it('shows only regions when zoomed all the way out', () => {
		expect(lodForSpan(24)).toBe(LOD.REGIONS);
		expect(lodForSpan(12)).toBe(LOD.REGIONS);
	});

	it('reveals ITU bands as the span narrows', () => {
		expect(lodForSpan(11.9)).toBe(LOD.ITU);
		expect(lodForSpan(3)).toBe(LOD.ITU);
	});

	it('reveals allocations, then channels, on further descent', () => {
		expect(lodForSpan(2.9)).toBe(LOD.ALLOCATIONS);
		expect(lodForSpan(0.6)).toBe(LOD.ALLOCATIONS);
		expect(lodForSpan(0.5)).toBe(LOD.CHANNELS);
		expect(lodForSpan(0.01)).toBe(LOD.CHANNELS);
	});

	it('increases monotonically as the span shrinks', () => {
		const spans = [24, 12, 6, 3, 1, 0.5, 0.1];
		const lods = spans.map(lodForSpan);
		for (let i = 1; i < lods.length; i++) {
			expect(lods[i]).toBeGreaterThanOrEqual(lods[i - 1]);
		}
	});
});

describe('lodForDomain', () => {
	it('is Regions for the full spectrum', () => {
		expect(lodForDomain(FULL_DOMAIN)).toBe(LOD.REGIONS);
	});

	it('is Allocations for a ~2-decade window', () => {
		expect(lodForDomain({ minExp: 8, maxExp: 10 })).toBe(LOD.ALLOCATIONS);
	});
});

describe('isVisibleAtLod', () => {
	it('shows an item once the current LOD reaches its minLod', () => {
		expect(isVisibleAtLod(2, 1)).toBe(false);
		expect(isVisibleAtLod(2, 2)).toBe(true);
		expect(isVisibleAtLod(2, 3)).toBe(true);
	});
});

describe('LOD_LABELS', () => {
	it('labels every tier', () => {
		const tiers: Lod[] = [0, 1, 2, 3];
		expect(tiers.map((t) => LOD_LABELS[t])).toEqual([
			'Regions',
			'ITU bands',
			'Allocations',
			'Channels'
		]);
	});
});
