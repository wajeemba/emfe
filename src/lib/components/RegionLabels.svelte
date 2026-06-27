<svelte:options namespace="svg" />

<script lang="ts">
	import { logPos, type FreqDomain } from '$lib/spectrum/scale';
	import { REGIONS } from '$lib/spectrum/bands';
	import { PLOT } from './plot-layout';

	let { width, domain }: { width: number; domain: FreqDomain } = $props();

	/** Geometric mean = the log-axis midpoint of a region. */
	const mid = (lo: number, hi: number) => Math.sqrt(lo * hi);
</script>

{#each REGIONS as r (r.id)}
	<text
		x={logPos(mid(r.lo, r.hi), domain) * width}
		y={PLOT.regionLabelY}
		text-anchor="middle"
		class="region"
		style="fill: {r.colorVar}">{r.label}</text
	>
{/each}

<style>
	.region {
		font-family: var(--font-sans);
		font-weight: 600;
		font-size: 12.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
</style>
