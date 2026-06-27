<svelte:options namespace="svg" />

<script lang="ts">
	import { logPos, type FreqDomain } from '$lib/spectrum/scale';
	import { PLOT } from './plot-layout';

	let { width, domain }: { width: number; domain: FreqDomain } = $props();

	/** Decade labels at every third power of ten (1 Hz, 1 kHz, 1 MHz, …). */
	const NAMES: Record<number, string> = {
		0: '1 Hz',
		3: '1 kHz',
		6: '1 MHz',
		9: '1 GHz',
		12: '1 THz',
		15: '1 PHz',
		18: '1 EHz',
		21: '1 ZHz',
		24: '1 YHz'
	};

	let ticks = $derived(
		Array.from({ length: 25 }, (_, exp) => ({
			exp,
			x: logPos(10 ** exp, domain) * width,
			major: exp % 3 === 0,
			label: exp % 3 === 0 ? (NAMES[exp] ?? '') : ''
		})).filter((t) => t.x >= 0 && t.x <= width)
	);
</script>

<line x1="0" y1={PLOT.axisY} x2={width} y2={PLOT.axisY} class="axis-line" />
<path d="M {width} {PLOT.axisY} l -8 -4.5 l 0 9 z" class="axis-arrow" />

{#each ticks as t (t.exp)}
	<line x1={t.x} y1={PLOT.axisY} x2={t.x} y2={PLOT.axisY + (t.major ? 8 : 4)} class="tick" />
	{#if t.label}
		<text x={t.x} y={PLOT.axisY + 20} text-anchor="middle" class="tick-label">{t.label}</text>
	{/if}
{/each}

<style>
	.axis-line {
		stroke: var(--line);
		stroke-width: 1;
	}
	.axis-arrow {
		fill: var(--faint);
	}
	.tick {
		stroke: var(--faint);
		stroke-width: 1;
	}
	.tick-label {
		font-family: var(--font-mono);
		font-size: 9px;
		fill: var(--sub);
	}
</style>
