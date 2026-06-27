/**
 * Theme store (light / dark). The toggle UI lands in Task 10; this just holds the state
 * and exposes a helper. `app.html` ships `data-theme="dark"`; the layout keeps the document
 * in sync with this store.
 */

import { writable } from 'svelte/store';

export type Theme = 'dark' | 'light';

export const theme = writable<Theme>('dark');

/** Flip between light and dark. */
export function toggleTheme(): void {
	theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
}
