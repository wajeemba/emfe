/**
 * Theme store (light / dark). The toggle UI lands in Task 10; this just holds the state
 * and exposes a helper. `app.html` ships `data-theme="dark"`; the layout keeps the document
 * in sync with this store.
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'dark' | 'light';

/**
 * Initial theme: in the browser, adopt whatever the blocking script in `app.html` already
 * applied (deep-link `?t=` → OS `prefers-color-scheme` → dark). On the server, default to dark
 * so the static markup matches the `<html data-theme="dark">` fallback.
 */
function initialTheme(): Theme {
	return browser && document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export const theme = writable<Theme>(initialTheme());

/** Flip between light and dark. */
export function toggleTheme(): void {
	theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
}
