/**
 * Allocation filtering for the current view. LOD filtering lands here in Task 5;
 * content-layer filtering is added in Task 8. Pure — operates on data + a Lod tier.
 */

import { isVisibleAtLod, type Lod } from './lod';
import type { Allocation } from '$lib/data/types';

/** Allocations whose detail tier has been reached at the current LOD. */
export function allocationsAtLod(allocs: readonly Allocation[], lod: Lod): Allocation[] {
	return allocs.filter((a) => isVisibleAtLod(a.minLod, lod));
}
