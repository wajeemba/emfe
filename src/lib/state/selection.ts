/**
 * Selection store — the id of the currently inspected allocation (or null).
 * The Inspector (Task 6) reads it; markers (Task 5) write it on click.
 */

import { writable } from 'svelte/store';

export const selection = writable<string | null>(null);

/** Select an allocation by id. */
export function select(id: string): void {
	selection.set(id);
}

/** Clear the current selection. */
export function clearSelection(): void {
	selection.set(null);
}
