/**
 * `zoomable` — a Svelte action that turns pointer/wheel gestures over the plot into view
 * updates.
 *
 *   - **scroll** → zoom about the cursor      (desktop)
 *   - **shift + scroll** → pan                (desktop)
 *   - **one-finger drag** → pan               (touch / pen)
 *   - **two-finger pinch** → zoom about the midpoint (touch / pen)
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
/** Keyboard zoom step (per +/- press) and pan step (fraction of span per arrow). */
const KEY_ZOOM = 1.6;
const KEY_PAN = 0.15;

export interface ZoomableParams {
	/** Current plot width in px (reactive — read fresh on each gesture). */
	width: () => number;
	/** Apply a pure view transform to the store. */
	apply: (transform: (view: ZoomView) => ZoomView) => void;
}

export function zoomable(node: SVGElement, params: ZoomableParams) {
	let current = params;
	const localX = (clientX: number) => clientX - node.getBoundingClientRect().left;

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

		const anchor = clamp01(localX(event.clientX) / width);
		const factor = Math.exp(-event.deltaY * ZOOM_SENSITIVITY);
		current.apply((v) => zoomAbout(v, FULL_DOMAIN, anchor, factor));
	}

	// ── Touch / pen: one-finger pan, two-finger pinch — anywhere on screen ────────────────
	// Listening on `window` (not just the plot) means pinch/pan work wherever the user touches:
	// there's usually only one thing to zoom. Touches that start on the controls dock or the
	// inspector drawer are left alone, so those panels handle their own gestures and a
	// two-finger gesture split across a panel and the band resolves each side independently.
	const IGNORE_SELECTOR = '.dock, .drawer, .backdrop';
	const startedInPanel = (target: EventTarget | null) =>
		target instanceof Element && target.closest(IGNORE_SELECTOR) !== null;

	// Track active non-mouse pointers by their x position; mouse stays on the wheel path.
	const pointers = new Map<number, number>();
	let lastPanX = 0;
	let pinchDist = 0;

	function onPointerDown(event: PointerEvent) {
		if (event.pointerType === 'mouse') return;
		if (startedInPanel(event.target)) return; // a panel owns this gesture
		pointers.set(event.pointerId, event.clientX);
		if (pointers.size === 1) {
			lastPanX = event.clientX;
		} else if (pointers.size === 2) {
			const [a, b] = [...pointers.values()];
			pinchDist = Math.abs(a - b);
		}
	}

	function onPointerMove(event: PointerEvent) {
		if (event.pointerType === 'mouse' || !pointers.has(event.pointerId)) return;
		const width = current.width();
		if (width <= 0) return;
		pointers.set(event.pointerId, event.clientX);
		event.preventDefault();

		if (pointers.size >= 2) {
			// Pinch: zoom about the two-finger midpoint by the change in finger spread.
			const [a, b] = [...pointers.values()];
			const dist = Math.abs(a - b);
			if (pinchDist > 0 && dist > 0) {
				const factor = dist / pinchDist;
				const anchor = clamp01((localX(a) + localX(b)) / 2 / width);
				current.apply((v) => zoomAbout(v, FULL_DOMAIN, anchor, factor));
			}
			pinchDist = dist;
			return;
		}

		// One finger: drag-pan. Moving content right (finger right) lowers the frequencies.
		const dx = event.clientX - lastPanX;
		lastPanX = event.clientX;
		current.apply((v) => panByFraction(v, FULL_DOMAIN, -dx / width));
	}

	function onPointerUp(event: PointerEvent) {
		if (event.pointerType === 'mouse' || !pointers.has(event.pointerId)) return;
		pointers.delete(event.pointerId);
		// Re-seed pan anchor from a remaining finger so lifting one of two doesn't jump.
		if (pointers.size === 1) lastPanX = [...pointers.values()][0];
		if (pointers.size >= 2) {
			const [a, b] = [...pointers.values()];
			pinchDist = Math.abs(a - b);
		}
	}

	// ── Keyboard: arrows pan, +/- zoom about center, 0 resets ──────────────────────────
	function onKeyDown(event: KeyboardEvent) {
		let handled = true;
		switch (event.key) {
			case '+':
			case '=':
				current.apply((v) => zoomAbout(v, FULL_DOMAIN, 0.5, KEY_ZOOM));
				break;
			case '-':
			case '_':
				current.apply((v) => zoomAbout(v, FULL_DOMAIN, 0.5, 1 / KEY_ZOOM));
				break;
			case 'ArrowLeft':
				current.apply((v) => panByFraction(v, FULL_DOMAIN, -KEY_PAN));
				break;
			case 'ArrowRight':
				current.apply((v) => panByFraction(v, FULL_DOMAIN, KEY_PAN));
				break;
			case '0':
				current.apply(() => ({
					centerExp: (FULL_DOMAIN.minExp + FULL_DOMAIN.maxExp) / 2,
					zoom: 1
				}));
				break;
			default:
				handled = false;
		}
		if (handled) event.preventDefault();
	}

	// Non-passive so we can preventDefault the page scroll/gesture while interacting.
	// Wheel + keyboard stay on the plot (so the page still scrolls elsewhere, and the SVG is the
	// focusable widget); touch gestures listen on the window so pinch/pan work anywhere.
	node.addEventListener('wheel', onWheel, { passive: false });
	node.addEventListener('keydown', onKeyDown);
	window.addEventListener('pointerdown', onPointerDown);
	window.addEventListener('pointermove', onPointerMove, { passive: false });
	window.addEventListener('pointerup', onPointerUp);
	window.addEventListener('pointercancel', onPointerUp);

	return {
		update(next: ZoomableParams) {
			current = next;
		},
		destroy() {
			node.removeEventListener('wheel', onWheel);
			node.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerUp);
		}
	};
}
