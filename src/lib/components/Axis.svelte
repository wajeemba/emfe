<svelte:options namespace="svg" />

<script lang="ts">
	import { logPos, type FreqDomain } from '$lib/spectrum/scale';
	import { fmtWavelengthOf } from '$lib/spectrum/format';
	import { PLOT } from './plot-layout';

	let {
		width,
		domain,
		showExp = false,
		showLambda = false
	}: { width: number; domain: FreqDomain; showExp?: boolean; showLambda?: boolean } = $props();

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
		Array.from({ length: 25 }, (_, exp) => {
			const major = exp % 3 === 0;
			const name = major ? (NAMES[exp] ?? '') : '';
			// The non-exponent part of the label; the exponent is drawn as a raised <tspan> so
			// the sci-notation reads as proper superscript (not a tiny Unicode glyph).
			const base = showExp ? (name ? `${name} · 10` : '10') : name;
			return {
				exp,
				x: logPos(10 ** exp, domain) * width,
				major,
				base,
				lambda: fmtWavelengthOf(10 ** exp)
			};
		}).filter((t) => t.x >= 0 && t.x <= width)
	);
</script>

<line x1="0" y1={PLOT.axisY} x2={width} y2={PLOT.axisY} class="axis-line" />
<path d="M {width} {PLOT.axisY} l -8 -4.5 l 0 9 z" class="axis-arrow" />

{#each ticks as t (t.exp)}
	<line x1={t.x} y1={PLOT.axisY} x2={t.x} y2={PLOT.axisY + (t.major ? 8 : 4)} class="tick" />
	{#if t.base}
		<text x={t.x} y={PLOT.axisY + 20} text-anchor="middle" class="tick-label" class:minor={!t.major}
			>{t.base}{#if showExp}<tspan class="exp" dy="-5">{t.exp}</tspan>{/if}</text
		>
	{/if}
	{#if showLambda && t.major}
		<text x={t.x} y={PLOT.axisY + 33} text-anchor="middle" class="lambda-label">{t.lambda}</text>
	{/if}
{/each}

{#if showLambda}
	<text x={width} y={PLOT.axisY + 33} text-anchor="end" class="lambda-axis">λ →</text>
{/if}

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
		font-size: 11px;
		fill: var(--sub);
	}
	.tick-label.minor {
		font-size: 10px;
		fill: var(--faint);
	}
	/* Raised exponent numerals — readable, unlike Unicode superscript glyphs. */
	.exp {
		font-size: 9px;
	}
	.lambda-label {
		font-family: var(--font-mono);
		font-size: 10px;
		fill: var(--layer-science);
		opacity: 0.9;
	}
	.lambda-axis {
		font-family: var(--font-mono);
		font-size: 10.5px;
		fill: var(--faint);
	}
</style>
