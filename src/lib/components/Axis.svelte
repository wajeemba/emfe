<svelte:options namespace="svg" />

<script lang="ts">
	import { logPos, niceTicks, type FreqDomain } from '$lib/spectrum/scale';
	import { fmtWavelengthOf, fmtFreqTicks, sciParts } from '$lib/spectrum/format';
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

	interface Tick {
		id: string;
		x: number;
		major: boolean;
		/** Whether this tick carries a label at all (decade minors are bare tick marks). */
		labeled: boolean;
		/** SI-prefixed label (e.g. "1 MHz" / "27 MHz") — shown when sci-notation is off. */
		plain: string;
		/** Scientific-notation parts (mantissa + exponent) — shown when sci-notation is on. */
		mant: string;
		sexp: number;
		lambda: string;
	}

	// Two tick regimes. Across many decades, label powers of ten (every third one named). Once you
	// zoom inside ~3 decades the decade ruler thins out, so switch to round 1-2-5 frequencies that
	// keep the scale readable — you can finally measure how wide a single band is. Either way, the
	// scientific-notation toggle re-formats every label as `m×10ⁿ Hz` (not just the decade ruler).
	let ticks = $derived.by<Tick[]>(() => {
		const zoomedIn = domain.maxExp - domain.minExp < 3;
		if (!zoomedIn) {
			return Array.from({ length: 25 }, (_, exp) => {
				const major = exp % 3 === 0;
				const sci = sciParts(10 ** exp, 10 ** exp);
				return {
					id: `p${exp}`,
					x: logPos(10 ** exp, domain) * width,
					major,
					labeled: major,
					plain: NAMES[exp] ?? '',
					mant: sci.mant,
					sexp: sci.exp,
					lambda: fmtWavelengthOf(10 ** exp)
				} satisfies Tick;
			}).filter((t) => t.x >= 0 && t.x <= width);
		}
		const values = niceTicks(10 ** domain.minExp, 10 ** domain.maxExp);
		const step = values.length > 1 ? values[1] - values[0] : values[0] || 1;
		const labels = fmtFreqTicks(values, step);
		return values
			.map((hz, i): Tick => {
				const sci = sciParts(hz, step);
				return {
					id: `n${hz}`,
					x: logPos(hz, domain) * width,
					major: true,
					labeled: true,
					plain: labels[i],
					mant: sci.mant,
					sexp: sci.exp,
					lambda: fmtWavelengthOf(hz)
				};
			})
			.filter((t) => t.x >= 0 && t.x <= width);
	});
</script>

<line x1="0" y1={PLOT.axisY} x2={width} y2={PLOT.axisY} class="axis-line" />
<path d="M {width} {PLOT.axisY} l -8 -4.5 l 0 9 z" class="axis-arrow" />

{#each ticks as t (t.id)}
	<line x1={t.x} y1={PLOT.axisY} x2={t.x} y2={PLOT.axisY + (t.major ? 8 : 4)} class="tick" />
	{#if t.labeled}
		{#if showExp}
			<text x={t.x} y={PLOT.axisY + 20} text-anchor="middle" class="tick-label"
				>{t.mant}×10<tspan class="exp" dy="-5">{t.sexp}</tspan> Hz</text
			>
		{:else}
			<text x={t.x} y={PLOT.axisY + 20} text-anchor="middle" class="tick-label">{t.plain}</text>
		{/if}
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
