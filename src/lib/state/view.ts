/**
 * The view store — the single source of truth for what's on screen.
 *
 * State is `{ centerExp, zoom }` (log10-Hz center + linear magnification). The visible
 * domain and the LOD tier are *derived* from it, so rendering, semantic zoom (Task 7), and
 * deep-linking (Task 12) all read one shape and can't drift.
 */

import { derived, writable } from 'svelte/store';
import { FULL_DOMAIN, decades, windowDomain } from '$lib/spectrum/scale';
import { lodForDomain } from '$lib/spectrum/lod';

export interface ViewState {
	/** log10 of the center frequency, in Hz. */
	centerExp: number;
	/** Linear magnification; 1 = whole spectrum. */
	zoom: number;
}

/** Initial view: the entire spectrum, centered. */
export const INITIAL_VIEW: ViewState = {
	centerExp: (FULL_DOMAIN.minExp + FULL_DOMAIN.maxExp) / 2,
	zoom: 1
};

export const view = writable<ViewState>({ ...INITIAL_VIEW });

/** The currently visible frequency window (clamped to the full spectrum). */
export const visibleDomain = derived(view, ($v) =>
	windowDomain(FULL_DOMAIN, $v.centerExp, $v.zoom)
);

/** The semantic-zoom detail tier for the current view. */
export const lod = derived(visibleDomain, ($d) => lodForDomain($d));

/** How many decades are currently visible (handy for readouts/labels). */
export const visibleDecades = derived(visibleDomain, ($d) => decades($d));

/** Reset the view to the full spectrum. */
export function resetView(): void {
	view.set({ ...INITIAL_VIEW });
}
