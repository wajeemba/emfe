import { describe, it, expect } from 'vitest';
import { fmtExp, fmtFreq, fmtLambda, fmtWavelengthOf, toSuperscript } from '$lib/spectrum/format';

describe('fmtFreq', () => {
	it('picks the right SI prefix across the spectrum', () => {
		expect(fmtFreq(535e3)).toBe('535 kHz');
		expect(fmtFreq(1e6)).toBe('1 MHz');
		expect(fmtFreq(98e6)).toBe('98 MHz');
		expect(fmtFreq(2.45e9)).toBe('2.45 GHz');
		expect(fmtFreq(5.4e14)).toBe('540 THz');
		expect(fmtFreq(3e18)).toBe('3 EHz');
		expect(fmtFreq(1e24)).toBe('1 YHz');
	});

	it('uses integers ≥ 10 and two decimals below', () => {
		expect(fmtFreq(14e6)).toBe('14 MHz');
		// 1.575 GHz shows as "1.57 GHz" — JS toFixed(2) rounds the binary-imperfect
		// 1.575 down, matching the prototype's GPS L1 readout.
		expect(fmtFreq(1.575e9)).toBe('1.57 GHz');
	});

	it('degrades gracefully below 1 Hz and to plain hertz', () => {
		expect(fmtFreq(7.83)).toBe('7.83 Hz');
		expect(fmtFreq(3)).toBe('3 Hz');
		expect(fmtFreq(0.5)).toBe('0.5 Hz');
	});
});

describe('fmtLambda', () => {
	it('picks the right unit across the wavelength ladder', () => {
		expect(fmtLambda(1500)).toBe('1.5 km');
		expect(fmtLambda(3)).toBe('3 m');
		expect(fmtLambda(0.12)).toBe('12 cm');
		expect(fmtLambda(550e-9)).toBe('550 nm');
		expect(fmtLambda(5e-13)).toBe('500 fm');
	});

	it('returns an em dash below the smallest unit', () => {
		expect(fmtLambda(1e-16)).toBe('—');
	});

	it('returns an em dash for invalid input', () => {
		expect(fmtLambda(0)).toBe('—');
		expect(fmtLambda(-1)).toBe('—');
		expect(fmtLambda(Number.NaN)).toBe('—');
		expect(fmtLambda(Number.POSITIVE_INFINITY)).toBe('—');
	});
});

describe('fmtWavelengthOf', () => {
	it('converts frequency to a formatted wavelength', () => {
		expect(fmtWavelengthOf(299_792_458)).toBe('1 m');
		expect(fmtWavelengthOf(5.45e14)).toBe('550 nm');
	});
});

describe('toSuperscript / fmtExp', () => {
	it('renders superscript digits incl. the minus sign', () => {
		expect(toSuperscript(9)).toBe('⁹');
		expect(toSuperscript(24)).toBe('²⁴');
		expect(toSuperscript(-12)).toBe('⁻¹²');
	});

	it('builds power-of-ten labels', () => {
		expect(fmtExp(0)).toBe('10⁰');
		expect(fmtExp(9)).toBe('10⁹');
		expect(fmtExp(-9)).toBe('10⁻⁹');
	});
});
