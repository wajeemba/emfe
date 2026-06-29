import { describe, it, expect } from 'vitest';
import {
	hasPrivilegePlan,
	privilegeBands,
	privilegeNote,
	privilegeStrip,
	HAM_SUBBANDS
} from '$lib/spectrum/license';

describe('hasPrivilegePlan', () => {
	it('is true for the classic HF bands with a documented sub-band plan', () => {
		for (const id of ['ham80m', 'ham40m', 'ham20', 'ham15m', 'ham10m']) {
			expect(hasPrivilegePlan(id)).toBe(true);
		}
	});

	it('is false for bands without a plan', () => {
		expect(hasPrivilegePlan('ham17m')).toBe(false);
		expect(hasPrivilegePlan('wifi')).toBe(false);
		expect(hasPrivilegePlan('does-not-exist')).toBe(false);
	});
});

describe('privilegeBands', () => {
	it('is empty for bands without a documented plan', () => {
		expect(privilegeBands('ham17m', 'extra')).toEqual([]);
		expect(privilegeBands('does-not-exist', 'extra')).toEqual([]);
	});

	it('resolves sub-bands to absolute Hz spanning the whole 20 m band', () => {
		const bands = privilegeBands('ham20', 'extra');
		expect(bands[0].loHz).toBe(14e6);
		expect(bands[bands.length - 1].hiHz).toBe(14.35e6);
	});

	it('enables every sub-band for an Extra holder, none for a Technician on 20 m', () => {
		expect(privilegeBands('ham20', 'extra').every((b) => b.enabled)).toBe(true);
		expect(privilegeBands('ham20', 'technician').some((b) => b.enabled)).toBe(false);
	});

	it('enables only the non-Extra sub-bands for a General holder on 20 m', () => {
		for (const b of privilegeBands('ham20', 'general')) {
			expect(b.enabled).toBe(b.minLicense !== 'extra');
		}
	});
});

describe('privilegeStrip', () => {
	it('is empty for bands without a documented sub-band plan', () => {
		expect(privilegeStrip('cb', 'extra')).toEqual([]);
		expect(privilegeStrip('does-not-exist', 'extra')).toEqual([]);
	});

	it('enables every segment for an Extra holder on 20 m', () => {
		const strip = privilegeStrip('ham20', 'extra');
		expect(strip).toHaveLength(HAM_SUBBANDS.ham20.length);
		expect(strip.every((s) => s.enabled)).toBe(true);
	});

	it('greys out Extra-only segments for a General holder', () => {
		const strip = privilegeStrip('ham20', 'general');
		for (const s of strip) {
			expect(s.enabled).toBe(s.minLicense !== 'extra');
		}
	});

	it('grants a Technician nothing on 20 m', () => {
		const strip = privilegeStrip('ham20', 'technician');
		expect(strip.every((s) => !s.enabled)).toBe(true);
	});

	it('keeps every plan ordered and spanning the full band', () => {
		for (const segs of Object.values(HAM_SUBBANDS)) {
			expect(segs[0].from).toBe(0);
			expect(segs[segs.length - 1].to).toBe(1);
			for (let i = 1; i < segs.length; i++) {
				expect(segs[i].from).toBeCloseTo(segs[i - 1].to, 5);
			}
		}
	});

	it('grants a Technician only the CW window on 80 m', () => {
		const strip = privilegeStrip('ham80m', 'technician');
		const enabled = strip.filter((s) => s.enabled);
		expect(enabled).toHaveLength(1);
		expect(enabled[0].mode).toBe('cw');
	});

	it('covers the classic HF bands with sub-band plans', () => {
		for (const id of ['ham80m', 'ham40m', 'ham20', 'ham15m', 'ham10m']) {
			expect(HAM_SUBBANDS[id]?.length).toBeGreaterThan(0);
		}
	});
});

describe('privilegeNote', () => {
	it('summarises privileges per held class', () => {
		expect(privilegeNote('extra')).toBe('full band');
		expect(privilegeNote('general')).toBe('General privileges');
		expect(privilegeNote('technician')).toContain('Technician');
		expect(privilegeNote('unlicensed')).toBe('No amateur privileges');
	});
});
