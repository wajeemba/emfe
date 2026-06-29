/**
 * National spectrum operators/licensees for the assignment tier (SPEC §The three tiers).
 *
 * These are *approximate, national-level* holdings — who broadly holds a band across the country —
 * not the per-market, per-block ULS truth (FCC licences are bought, sold and split market by
 * market). They cover several company types: cellular carriers, satellite radio/TV, MSS sat-phone,
 * broadband constellations, and the government's GPS. Colours are `var(--op-*)` strings only.
 */

export const OPERATORS = [
	'verizon',
	'att',
	'tmobile',
	'dish',
	'siriusxm',
	'globalstar',
	'iridium',
	'gps',
	'starlink'
] as const;
export type OperatorId = (typeof OPERATORS)[number];

export const OPERATOR_LABELS: Record<OperatorId, string> = {
	verizon: 'Verizon',
	att: 'AT&T',
	tmobile: 'T-Mobile',
	dish: 'Dish',
	siriusxm: 'SiriusXM',
	globalstar: 'Globalstar',
	iridium: 'Iridium',
	gps: 'GPS · Space Force',
	starlink: 'Starlink'
};

export function operatorColorVar(op: string): string {
	return (OPERATORS as readonly string[]).includes(op) ? `var(--op-${op})` : 'var(--op-iridium)';
}

export function operatorLabel(op: string): string {
	return OPERATOR_LABELS[op as OperatorId] ?? op;
}
