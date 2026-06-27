<script lang="ts">
	import type { Allocation } from '$lib/data/types';
	import { REGIONS } from '$lib/spectrum/bands';
	import { fmtFreq, fmtWavelengthOf } from '$lib/spectrum/format';

	let { allocation }: { allocation: Allocation } = $props();

	const regionLabel = (id: Allocation['region']) => REGIONS.find((r) => r.id === id)?.label ?? id;

	let bandText = $derived(
		allocation.band ? `${fmtFreq(allocation.band[0])} – ${fmtFreq(allocation.band[1])}` : ''
	);
</script>

<div class="inspector">
	<div class="eyebrow">Inspector</div>

	<div class="title">
		<span class="name">{allocation.name}</span>
		<span class="freq">{fmtFreq(allocation.hz)}</span>
	</div>

	<div class="meta">
		{regionLabel(allocation.region)} · λ {fmtWavelengthOf(allocation.hz)}{bandText
			? ` · ${bandText}`
			: ''}
	</div>

	<p class="note">{allocation.note}</p>

	<div class="source">
		Source:
		{#if allocation.source.url}
			<a href={allocation.source.url} target="_blank" rel="noreferrer noopener">
				{allocation.source.title}
			</a>
		{:else}
			{allocation.source.title}
		{/if}
	</div>
</div>

<style>
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 9px;
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
		font-size: 10.5px;
		color: var(--sub);
		margin: 3px 0 10px;
	}
	.note {
		margin: 0 0 10px;
		font-family: var(--font-sans);
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--sub);
	}
	.source {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--faint);
	}
	.source a {
		color: var(--layer-navigation);
		text-decoration: none;
	}
	.source a:hover {
		text-decoration: underline;
	}
</style>
