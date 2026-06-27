/**
 * `zoomable` — a Svelte action that turns wheel gestures over the plot into view updates.
 *
 *   - **scroll** → zoom about the cursor
 *   - **shift + scroll** → pan
 *
 * The action owns only the DOM event plumbing; the actual math lives in the pure
 * `spectrum/zoom` module, and the resulting state lives in the `view` store. This is the
 * Svelte↔(zoom-logic) boundary: the action never mutates rendered SVG — it maps a gesture to
 * a `view` mutation and lets Svelte re-render from the derived domain.
 */

import { clamp01, FULL_DOMAIN } from '$lib/spectrum/scale';
import { panByFraction, zoomAbout, type ZoomView } from '$lib/spectrum/zoom';

/** Wheel-notch → zoom factor sensitivity (per deltaY pixel). */
const ZOOM_SENSITIVITY = 0.002;
/** Wheel-notch → pan fraction sensitivity (per delta pixel). */
const PAN_SENSITIVITY = 0.0015;

export interface ZoomableParams {
	/** Current plot width in px (reactive — read fresh on each gesture). */
	width: () => number;
	/** Apply a pure view transform to the store. */
	apply: (transform: (view: ZoomView) => ZoomView) => void;
}

export function zoomable(node: SVGElement, params: ZoomableParams) {
	let current = params;

	function onWheel(event: WheelEvent) {
		const width = current.width();
		if (width <= 0) return;
		event.preventDefault();

		if (event.shiftKey) {
			// Trackpads report horizontal intent on deltaX; mice on deltaY — fold both in.
			const delta = event.deltaX + event.deltaY;
			current.apply((v) => panByFraction(v, FULL_DOMAIN, delta * PAN_SENSITIVITY));
			return;
		}

		const rect = node.getBoundingClientRect();
		const anchor = clamp01((event.clientX - rect.left) / width);
		const factor = Math.exp(-event.deltaY * ZOOM_SENSITIVITY);
		current.apply((v) => zoomAbout(v, FULL_DOMAIN, anchor, factor));
	}

	// Non-passive so we can preventDefault the page scroll while zooming.
	node.addEventListener('wheel', onWheel, { passive: false });

	return {
		update(next: ZoomableParams) {
			current = next;
		},
		destroy() {
			node.removeEventListener('wheel', onWheel);
		}
	};
}
