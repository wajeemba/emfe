<script lang="ts">
	import { licenseRank, type Allocation, type LicenseRank } from '$lib/data/types';
	import { REGIONS } from '$lib/spectrum/bands';
	import { fmtFreq, fmtPhotonEv, fmtWavelengthOf } from '$lib/spectrum/format';
	import { axisOptions } from '$lib/state/axis';
	import {
		LICENSE_ICON,
		RANK_LABELS,
		privilegeNote,
		privilegeStrip,
		type RenderedSegment
	} from '$lib/spectrum/license';

	let { allocation, license }: { allocation: Allocation; license: LicenseRank } = $props();

	const regionLabel = (id: Allocation['region']) => REGIONS.find((r) => r.id === id)?.label ?? id;

	/** Optional "learn more" deep links for allocations whose story rewards a click-through. */
	const LEARN_MORE: Record<string, { url: string; label: string }> = {
		frs: {
			url: 'https://www.fcc.gov/general-mobile-radio-service-gmrs',
			label: 'About the GMRS licence'
		}
	};
	let learnMore = $derived(LEARN_MORE[allocation.id]);

	/** Badge copy for the band's required class — a neutral "what licence opens this band" cue.
	 *  License-free reads better than "Unlicensed" for the licence-free services. */
	const REQ_LABEL: Record<LicenseRank, string> = {
		unlicensed: 'License-free',
		technician: 'Technician licence',
		general: 'General licence',
		extra: 'Amateur Extra licence'
	};

	/** Operating-mode labels, spelt out so the abbreviations explain themselves on hover. */
	const MODE_LABEL: Record<RenderedSegment['mode'], string> = {
		cw: 'CW (Morse code)',
		data: 'Data (digital)',
		phone: 'Phone (voice)'
	};

	/** A hover tooltip that keeps the mode info the pink fill no longer encodes. */
	function segTitle(seg: RenderedSegment): string {
		if (!allocation.band) return '';
		const [lo, hi] = allocation.band;
		const from = lo + seg.from * (hi - lo);
		const to = lo + seg.to * (hi - lo);
		return `${fmtFreq(from)} – ${fmtFreq(to)} · ${RANK_LABELS[seg.minLicense]} · ${MODE_LABEL[seg.mode]}`;
	}

	let bandText = $derived(
		allocation.band ? `${fmtFreq(allocation.band[0])} – ${fmtFreq(allocation.band[1])}` : ''
	);
	let reqClass = $derived(allocation.reqLicense);
	let segments = $derived(privilegeStrip(allocation.id, license));
	/** Distinct licence classes present in this band, low → high, for the glyph key. */
	let classKey = $derived(
		[...new Set(segments.map((s) => s.minLicense))].sort((a, b) => licenseRank(a) - licenseRank(b))
	);
</script>

<div class="inspector">
	<div class="eyebrow">Inspector</div>

	<div class="title">
		<span class="name">{allocation.name}</span>
		<span class="freq">{fmtFreq(allocation.hz)}</span>
	</div>

	<div class="meta">
		{regionLabel(allocation.region)} · λ {fmtWavelengthOf(allocation.hz)}{$axisOptions.showEv
			? ` · E ${fmtPhotonEv(allocation.hz)}`
			: ''}{bandText ? ` · ${bandText}` : ''}
	</div>

	{#if reqClass}
		<div class="class-badge">
			<span class="badge-glyph">{LICENSE_ICON[reqClass]}</span>
			<span>{REQ_LABEL[reqClass]}</span>
		</div>
	{/if}

	{#if segments.length > 0 && allocation.band}
		<div class="strip">
			{#each segments as seg, i (i)}
				<span
					class="seg"
					class:off={!seg.enabled}
					style="left: {seg.from * 100}%; width: {(seg.to - seg.from) * 100}%"
					title={segTitle(seg)}
				>
					<span class="seg-mark">{LICENSE_ICON[seg.minLicense]}</span>
				</span>
			{/each}
		</div>
		<div class="strip-legend">
			<span>{fmtFreq(allocation.band[0])}</span>
			<span>{privilegeNote(license)}</span>
			<span>{fmtFreq(allocation.band[1])}</span>
		</div>
		{#if classKey.length > 0}
			<div class="class-key">
				{#each classKey as rank (rank)}
					<span><b>{LICENSE_ICON[rank]}</b> {RANK_LABELS[rank]}</span>
				{/each}
			</div>
		{/if}
	{/if}

	<p class="note">{allocation.note}</p>

	{#if learnMore}
		<!-- External explainer (absolute https), not an internal SvelteKit route. -->
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a class="learn-more" href={learnMore.url} target="_blank" rel="noreferrer noopener">
			{learnMore.label} →
		</a>
	{/if}

	<div class="source">
		Source:
		{#if allocation.source.url}
			<!-- External source URL (absolute https), not an internal SvelteKit route. -->
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={allocation.source.url} target="_blank" rel="noreferrer noopener">
				{allocation.source.title}
			</a>
		{:else}
			{allocation.source.title}
		{/if}
	</div>

	{#if allocation.extraSource}
		<div class="source">
			Also:
			{#if allocation.extraSource.url}
				<!-- External source URL (absolute https), not an internal SvelteKit route. -->
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={allocation.extraSource.url} target="_blank" rel="noreferrer noopener">
					{allocation.extraSource.title}
				</a>
			{:else}
				{allocation.extraSource.title}
			{/if}
		</div>
	{/if}
</div>

<style>
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.14em;
		color: var(--faint);
		text-transform: uppercase;
		margin-bottom: 10px;
	}
	.title {
		display: flex;
		align-items: baseline;
		gap: 10px;
		flex-wrap: wrap;
	}
	.name {
		font-family: var(--font-sans);
		font-size: 18px;
		font-weight: 700;
	}
	.freq {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--sub);
	}
	.meta {
		font-family: var(--font-mono);
		font-size: 12.5px;
		color: var(--sub);
		margin: 3px 0 10px;
	}
	/* Neutral "what licence opens this band" badge — the held class is shown by which sub-bands
	   light up on the chart and in the strip, so this no longer flips green/red by privilege. */
	.class-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-sans);
		font-size: 13.5px;
		font-weight: 600;
		padding: 4px 11px 4px 5px;
		border-radius: 999px;
		margin-bottom: 9px;
		color: var(--layer-amateur);
		background: color-mix(in srgb, var(--layer-amateur) 13%, transparent);
		border: 1px solid color-mix(in srgb, var(--layer-amateur) 33%, transparent);
	}
	.badge-glyph {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 19px;
		height: 19px;
		border-radius: 50%;
		flex-shrink: 0;
		background: var(--layer-amateur);
		color: #fff;
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: 11px;
		line-height: 1;
	}
	.strip {
		position: relative;
		height: 18px;
		border-radius: 5px;
		overflow: hidden;
		border: 1px solid var(--line);
		margin-bottom: 4px;
	}
	.seg {
		position: absolute;
		top: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: var(--layer-amateur);
		box-shadow: inset -1px 0 0 color-mix(in srgb, var(--bg) 55%, transparent);
	}
	.strip > .seg:last-child {
		box-shadow: none;
	}
	.seg.off {
		background: color-mix(in srgb, var(--layer-amateur) 20%, var(--panelb));
	}
	.seg-mark {
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 700;
		line-height: 1;
		color: var(--marker-stroke);
	}
	.seg.off .seg-mark {
		color: var(--faint);
		font-weight: 600;
	}
	.strip-legend {
		display: flex;
		justify-content: space-between;
		font-family: var(--font-mono);
		font-size: 10.5px;
		color: var(--faint);
		margin-bottom: 5px;
	}
	.class-key {
		display: flex;
		gap: 12px;
		font-family: var(--font-mono);
		font-size: 10.5px;
		color: var(--faint);
		margin-bottom: 10px;
	}
	.class-key b {
		color: var(--layer-amateur);
		font-weight: 700;
	}
	.note {
		margin: 0 0 10px;
		font-family: var(--font-sans);
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--sub);
	}
	.learn-more {
		display: inline-block;
		margin: 0 0 12px;
		font-family: var(--font-sans);
		font-size: 12.5px;
		font-weight: 600;
		color: var(--layer-amateur);
		text-decoration: none;
	}
	.learn-more:hover {
		text-decoration: underline;
	}
	.source {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--faint);
	}
	.source + .source {
		margin-top: 4px;
	}
	.source a {
		color: var(--layer-navigation);
		text-decoration: none;
	}
	.source a:hover {
		text-decoration: underline;
	}
</style>
