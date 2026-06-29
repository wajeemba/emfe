/**
 * Radio-service taxonomy for the allocation substrate (SPEC §The three tiers).
 *
 * §2.106 allocates each band to one or more of ~30 named radio services. For a legible ribbon we
 * fold those into eleven **categories**, each with one CSS-variable colour. The fold is editorial
 * but follows how a reader thinks: a mode (aeronautical / maritime) wins over its sub-function
 * (its radionavigation), GPS-style RNSS reads as "navigation", and every satellite-comms service
 * (fixed/mobile/inter-satellite/DBS) reads as "satellite".
 *
 * Pure module: no DOM, no Svelte, no app state. Colours are `var(--svc-*)` strings only.
 */

export const SERVICE_CATEGORIES = [
	'broadcasting',
	'mobile',
	'fixed',
	'amateur',
	'aeronautical',
	'maritime',
	'radionavigation',
	'radiolocation',
	'satellite',
	'science',
	'other'
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

/** Human label per category, for the legend / control panel. */
export const SERVICE_LABELS: Record<ServiceCategory, string> = {
	broadcasting: 'Broadcasting',
	mobile: 'Mobile',
	fixed: 'Fixed',
	amateur: 'Amateur',
	aeronautical: 'Aeronautical',
	maritime: 'Maritime',
	radionavigation: 'Radionavigation',
	radiolocation: 'Radiolocation (radar)',
	satellite: 'Satellite',
	science: 'Science & passive',
	other: 'Other'
};

/** CSS colour variable for a category. */
export function serviceColorVar(c: ServiceCategory): string {
	return `var(--svc-${c})`;
}

// Ordered rules — first match wins. Order encodes the editorial precedence above.
const RULES: [RegExp, ServiceCategory][] = [
	[/AMATEUR/, 'amateur'],
	[/AERONAUTICAL/, 'aeronautical'],
	[/MARITIME/, 'maritime'],
	[/RADIO ASTRONOMY|SPACE RESEARCH|EARTH EXPLORATION|METEOROLOGICAL|STANDARD FREQUENCY/, 'science'],
	[/RADIONAVIGATION|RADIODETERMINATION/, 'radionavigation'],
	[/RADIOLOCATION/, 'radiolocation'],
	[/BROADCASTING-SATELLITE/, 'satellite'],
	[/BROADCASTING/, 'broadcasting'],
	[/SATELLITE/, 'satellite'],
	[/MOBILE/, 'mobile'],
	[/FIXED/, 'fixed']
];

/** Map a raw §2.106 service name (e.g. `FIXED-SATELLITE (space-to-Earth)`) to a category. */
export function serviceCategory(name: string): ServiceCategory {
	const n = name.toUpperCase();
	for (const [re, cat] of RULES) if (re.test(n)) return cat;
	return 'other';
}

/**
 * The category that colours a band: its first primary service (the table lists the most
 * significant allocation first), falling back to the first secondary, then `other`.
 */
export function bandCategory(band: { primary: string[]; secondary?: string[] }): ServiceCategory {
	const lead = band.primary[0] ?? band.secondary?.[0];
	return lead ? serviceCategory(lead) : 'other';
}
