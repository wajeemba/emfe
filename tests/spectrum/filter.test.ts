import { describe, it, expect } from 'vitest';
import { allocationsAtLod } from '$lib/spectrum/filter';
import type { Lod } from '$lib/spectrum/lod';
import type { Allocation } from '$lib/data/types';
import { allocations } from '$lib/data/loader';

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

	it('shows nothing on the real seed at the Regions tier', () => {
		expect(allocationsAtLod(allocations, 0)).toHaveLength(0);
	});

	it('shows the 8 allocation-tier entries at the Allocations LOD', () => {
		expect(allocationsAtLod(allocations, 2)).toHaveLength(8);
		expect(allocationsAtLod(allocations, 3)).toHaveLength(20);
	});
});
