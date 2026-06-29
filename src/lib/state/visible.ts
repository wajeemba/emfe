/**
 * Visible-light sub-filter state. The optical region got busy (lasers, LEDs, gas glows,
 * fireworks), so each group toggles independently. All on by default.
 */

import { writable } from 'svelte/store';
import { OPTICAL_GROUPS, type OpticalGroup } from '$lib/data/types';
import { enableLayer } from './layers';

export type GroupVisibility = Record<OpticalGroup, boolean>;

const allOn = (): GroupVisibility =>
	Object.fromEntries(OPTICAL_GROUPS.map((g) => [g, true])) as GroupVisibility;

export const visibleGroups = writable<GroupVisibility>(allOn());

export const GROUP_LABELS: Record<OpticalGroup, string> = {
	laser: 'Lasers',
	led: 'LEDs',
	gas: 'Gas & flame',
	fireworks: 'Fireworks'
};

// Turning a light source on is pointless if the content layer it lives in is hidden — these
// entries are physical-science — so enabling any group also switches the science layer on.
export function toggleGroup(g: OpticalGroup): void {
	let turnedOn = false;
	visibleGroups.update((s) => {
		turnedOn = !s[g];
		return { ...s, [g]: turnedOn };
	});
	if (turnedOn) enableLayer('science');
}

export function setAllGroups(on: boolean): void {
	visibleGroups.set(Object.fromEntries(OPTICAL_GROUPS.map((g) => [g, on])) as GroupVisibility);
	if (on) enableLayer('science');
}
