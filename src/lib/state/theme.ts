/**
 * Theme store (light / dark). Holds the state and exposes a toggle helper. `app.html` ships
 * `data-theme="dark"`; the layout keeps the document in sync with this store and persists the
 * choice to localStorage.
 *
 * Theme is intentionally *not* part of the shareable deep-link (see `state/url.ts`): colour scheme
 * is a per-viewer preference, so it's remembered locally (localStorage) rather than travelling in
 * the URL a link recipient opens.
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'dark' | 'light';

/**
 * Initial theme: in the browser, adopt whatever the blocking script in `app.html` already
 * applied (saved localStorage choice → OS `prefers-color-scheme` → dark). On the server, default
 * to dark so the static markup matches the `<html data-theme="dark">` fallback.
 */
function initialTheme(): Theme {
	return browser && document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export const theme = writable<Theme>(initialTheme());

/** Flip between light and dark. */
export function toggleTheme(): void {
	theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
}
