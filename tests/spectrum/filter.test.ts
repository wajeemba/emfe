import { describe, it, expect } from 'vitest';
import { allocationsAtLod, layerCounts, visibleAllocations } from '$lib/spectrum/filter';
import type { Lod } from '$lib/spectrum/lod';
import { LAYERS, type Allocation, type LayerId } from '$lib/data/types';
import { allocations } from '$lib/data/loader';

const allLayersOn: Record<LayerId, boolean> = Object.fromEntries(
	LAYERS.map((l) => [l, true])
) as Record<LayerId, boolean>;

function at(minLod: Lod): Allocation {
	return {
		id: `a${minLod}-${Math.random()}`,
		name: 'A',
		hz: 1e6,
		layer: 'consumer',
		region: 'radio',
		minLod,
		note: 'n',
		source: { id: 's', title: 'S' }
	};
}

describe('allocationsAtLod', () => {
	const fixture = [at(0), at(1), at(2), at(3)];

	it('reveals items as the LOD descends', () => {
		expect(allocationsAtLod(fixture, 0)).toHaveLength(1); // only minLod 0
		expect(allocationsAtLod(fixture, 1)).toHaveLength(2);
		expect(allocationsAtLod(fixture, 2)).toHaveLength(3);
		expect(allocationsAtLod(fixture, 3)).toHaveLength(4); // all
	});

	it('shows the six hero markers on the real seed at the Regions tier', () => {
		const hero = allocationsAtLod(allocations, 0);
		expect(hero).toHaveLength(6);
		expect(hero.map((a) => a.id).sort()).toEqual(['am', 'fm', 'gps', 'vis', 'wifi', 'xray']);
	});

	it('shows the 8 allocation-tier entries at the Allocations LOD', () => {
		expect(allocationsAtLod(allocations, 2)).toHaveLength(8);
		expect(allocationsAtLod(allocations, 3)).toHaveLength(20);
	});
});

describe('visibleAllocations', () => {
	it('also filters by enabled content layers', () => {
		expect(visibleAllocations(allocations, 2, allLayersOn)).toHaveLength(8);
		const noScience = { ...allLayersOn, science: false };
		// drops the two science entries at LOD 2 (Visible, Medical X-ray)
		expect(visibleAllocations(allocations, 2, noScience)).toHaveLength(6);
		expect(visibleAllocations(allocations, 2, noScience).every((a) => a.layer !== 'science')).toBe(
			true
		);
	});
});

describe('layerCounts', () => {
	it('counts allocations per layer at a LOD, ignoring toggles', () => {
		expect(layerCounts(allocations, 2)).toEqual({
			consumer: 3,
			amateur: 2,
			navigation: 1,
			gov: 0,
			science: 2
		});
	});
});
