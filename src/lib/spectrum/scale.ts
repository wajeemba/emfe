/**
 * Log-frequency scale math — the heart of the explorer.
 *
 * We work entirely in *log10 space* (domain ≈ 0–24), so the ~24-orders-of-magnitude
 * range is never a precision problem. A `FreqDomain` is just the visible exponent window;
 * `logPos` maps a frequency to its normalized [0,1] position within that window.
 *
 * Pure module: no DOM, no Svelte, no app state (SPEC §Boundaries).
 */

/** Speed of light in vacuum, m/s — for frequency ↔ wavelength conversion. */
export const SPEED_OF_LIGHT = 299_792_458;

/** A visible window of the spectrum, expressed as log10(Hz) bounds. */
export interface FreqDomain {
	/** log10 of the lowest visible frequency, in Hz. */
	minExp: number;
	/** log10 of the highest visible frequency, in Hz. */
	maxExp: number;
}

/**
 * The full spectrum: 1 Hz (10⁰) → 10²⁴ Hz (1 YHz).
 * Covers below-ELF (Schumann ≈ 7.83 Hz sits just above the floor) through gamma.
 */
export const FULL_DOMAIN: FreqDomain = { minExp: 0, maxExp: 24 };

/** Width of a domain in decades (orders of magnitude). */
export function decades(d: FreqDomain): number {
	return d.maxExp - d.minExp;
}

/** Normalized [0,1] position of a frequency on the log axis (unclamped). */
export function logPos(hz: number, d: FreqDomain): number {
	return (Math.log10(hz) - d.minExp) / (d.maxExp - d.minExp);
}

/** Inverse of {@link logPos}: the frequency (Hz) at a normalized position. */
export function posToHz(pos: number, d: FreqDomain): number {
	return 10 ** (d.minExp + pos * (d.maxExp - d.minExp));
}

/** Clamp a value to the [0,1] range (handy for off-screen positions). */
export function clamp01(v: number): number {
	return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Wavelength (metres) of an electromagnetic wave at the given frequency (Hz). */
export function freqToWavelength(hz: number): number {
	return SPEED_OF_LIGHT / hz;
}

/** Frequency (Hz) of an electromagnetic wave at the given wavelength (metres). */
export function wavelengthToFreq(metres: number): number {
	return SPEED_OF_LIGHT / metres;
}
