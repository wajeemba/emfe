/**
 * Shared geometry for the plot SVG (user-space coordinates, px). Keeps the axis, band,
 * region labels, ITU row, and (later) markers vertically aligned. Presentational only.
 */
export const PLOT = {
	/** Total SVG height. */
	height: 262,
	/** Top of the marker stagger area (filled in Task 5). */
	markerTop: 0,
	/** Baseline for the always-visible region labels, just above the band. */
	regionLabelY: 100,
	/** The continuous gradient band. */
	bandY: 118,
	bandH: 58,
	/** ITU band row. */
	ituY: 180,
	ituH: 15,
	/** Axis baseline (ticks + labels hang below). */
	axisY: 202
} as const;
