/**
 * Allocation filtering for the current view. LOD filtering lands here in Task 5;
 * content-layer filtering is added in Task 8. Pure — operates on data + a Lod tier.
 */

import { isVisibleAtLod, type Lod } from './lod';
import {
	LAYERS,
	licenseRank,
	type Allocation,
	type LayerId,
	type LicenseRank
} from '$lib/data/types';

/** Allocations whose detail tier has been reached at the current LOD. */
export function allocationsAtLod(allocs: readonly Allocation[], lod: Lod): Allocation[] {
	return allocs.filter((a) => isVisibleAtLod(a.minLod, lod));
}

/** Whether a held licence class may transmit on an allocation (always true for non-amateur). */
function licensed(a: Allocation, held: LicenseRank | undefined): boolean {
	if (a.reqLicense === undefined || held === undefined) return true;
	return licenseRank(held) >= licenseRank(a.reqLicense);
}

/** Whether either of an allocation's content layers is currently enabled. */
function layerOn(a: Allocation, layers: Record<LayerId, boolean>): boolean {
	return layers[a.layer] || (a.altLayer !== undefined && layers[a.altLayer]);
}

/**
 * The layer an allocation should be *coloured* as, given which layers are on. The primary
 * `layer` wins when its toggle is on; otherwise the `altLayer` (for dual-membership entries such
 * as UV-A, which is both physical-science and consumer — science colour preferred when shown).
 */
export function effectiveLayer(a: Allocation, layers: Record<LayerId, boolean>): LayerId {
	if (layers[a.layer]) return a.layer;
	if (a.altLayer !== undefined && layers[a.altLayer]) return a.altLayer;
	return a.layer;
}

/**
 * Allocations visible at the current LOD whose content layer is enabled. When a held licence
 * is given, amateur bands the class can't transmit on are also hidden (a band's `reqLicense`
 * is the lowest class with any privilege there).
 */
export function visibleAllocations(
	allocs: readonly Allocation[],
	lod: Lod,
	layers: Record<LayerId, boolean>,
	held?: LicenseRank
): Allocation[] {
	return allocs.filter(
		(a) => isVisibleAtLod(a.minLod, lod) && layerOn(a, layers) && licensed(a, held)
	);
}

/** Count of allocations per content layer at the current LOD (counts both layers of a dual entry). */
export function layerCounts(allocs: readonly Allocation[], lod: Lod): Record<LayerId, number> {
	const counts = Object.fromEntries(LAYERS.map((l) => [l, 0])) as Record<LayerId, number>;
	for (const a of allocs) {
		if (!isVisibleAtLod(a.minLod, lod)) continue;
		counts[a.layer]++;
		if (a.altLayer !== undefined) counts[a.altLayer]++;
	}
	return counts;
}
