/**
 * Allocation filtering for the current view. LOD filtering lands here in Task 5;
 * content-layer filtering is added in Task 8. Pure — operates on data + a Lod tier.
 */

import { isVisibleAtLod, type Lod } from './lod';
import { LAYERS, type Allocation, type LayerId } from '$lib/data/types';

/** Allocations whose detail tier has been reached at the current LOD. */
export function allocationsAtLod(allocs: readonly Allocation[], lod: Lod): Allocation[] {
	return allocs.filter((a) => isVisibleAtLod(a.minLod, lod));
}

/** Allocations visible at the current LOD whose content layer is enabled. */
export function visibleAllocations(
	allocs: readonly Allocation[],
	lod: Lod,
	layers: Record<LayerId, boolean>
): Allocation[] {
	return allocs.filter((a) => isVisibleAtLod(a.minLod, lod) && layers[a.layer]);
}

/** Count of allocations per content layer at the current LOD (ignores layer toggles). */
export function layerCounts(allocs: readonly Allocation[], lod: Lod): Record<LayerId, number> {
	const counts = Object.fromEntries(LAYERS.map((l) => [l, 0])) as Record<LayerId, number>;
	for (const a of allocs) if (isVisibleAtLod(a.minLod, lod)) counts[a.layer]++;
	return counts;
}
