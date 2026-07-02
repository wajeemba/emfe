import { describe, it, expect } from 'vitest';
import { cardToken, resolveCard } from '$lib/state/card';
import { allocations } from '$lib/data/loader';
import { substrate } from '$lib/data/substrate';
import { FAMILIES } from '$lib/spectrum/grouping';

describe('card token round-trip', () => {
	it('resolves a marker (sig) token back to its id', () => {
		const id = allocations[0].id;
		expect(resolveCard(cardToken({ kind: 'sig', id }))).toEqual({ kind: 'sig', id });
	});

	it('resolves a neighbourhood (grp) token back to the same family', () => {
		const group = FAMILIES[0];
		const token = cardToken({ kind: 'grp', group });
		expect(token).toBe(`grp:${group.id}`);
		const t = resolveCard(token);
		expect(t?.kind).toBe('grp');
		expect(t?.kind === 'grp' && t.group.id).toBe(group.id);
	});

	it('resolves a substrate band token back to the same band (id-less, keyed by admin + edges)', () => {
		const band = substrate[0];
		const token = cardToken({ kind: 'band', band });
		expect(token).toBe(`band:${band.federal ? 'f' : 'n'}:${band.lo}-${band.hi}`);
		const t = resolveCard(token);
		expect(t?.kind === 'band' && t.band).toBe(band); // same object, not a copy
	});
});

describe('resolveCard degrades safely', () => {
	it('returns null for empty / unknown-kind tokens', () => {
		expect(resolveCard(null)).toBeNull();
		expect(resolveCard('')).toBeNull();
		expect(resolveCard('zzz:foo')).toBeNull();
		expect(resolveCard('sig')).toBeNull(); // kind with no id
	});

	it('returns null when the id no longer exists in the dataset', () => {
		expect(resolveCard('sig:not-an-allocation')).toBeNull();
		expect(resolveCard('grp:no-such-family')).toBeNull();
		expect(resolveCard('band:n:1-2')).toBeNull();
	});
});
