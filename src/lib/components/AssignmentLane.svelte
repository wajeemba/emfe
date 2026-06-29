<svelte:options namespace="svg" />

<script lang="ts">
	import { logPos, type FreqDomain } from '$lib/spectrum/scale';
	import { visibleAllocations } from '$lib/spectrum/filter';
	import { allocations } from '$lib/data/loader';
	import { fmtFreq } from '$lib/spectrum/format';
	import { operatorColorVar } from '$lib/spectrum/operators';
	import type { LayerId } from '$lib/data/types';
	import { select } from '$lib/state/selection';
	import { PLOT } from './plot-layout';

	let {
		width,
		domain,
		layers,
		selected
	}: {
		width: number;
		domain: FreqDomain;
		layers: Record<LayerId, boolean>;
		selected: string | null;
	} = $props();

	const yTop = PLOT.assignY;
	const yBot = PLOT.assignY + PLOT.assignH;
	const h = PLOT.assignH;
	/** Min px between two labels before the later one is dropped. */
	const LABEL_GAP = 56;

	// Assignment-tier entries passing the content-layer filter. Two flavours: operator/licensee
	// *holdings* (a band someone owns nationally) drawn as coloured bars, and *designated
	// frequencies* (a single channel set aside for a job — distress, calling) drawn as pins.
	let visible = $derived(
		visibleAllocations(allocations, 3, layers).filter((a) => a.tier === 'assignment')
	);

	// Operator holdings → coloured bars spanning the band, labelled with greedy de-overlap.
	let bars = $derived.by(() => {
		const items = visible
			.filter((a) => a.operator && a.band)
			.map((a) => {
				const x0 = Math.max(logPos(a.band![0], domain) * width, 0);
				const x1 = Math.min(logPos(a.band![1], domain) * width, width);
				return { a, x0, w: x1 - x0, cx: (x0 + x1) / 2 };
			})
			.filter((b) => b.w > 0.3 && b.x0 < width && b.x0 + b.w > 0)
			.sort((p, q) => p.cx - q.cx);
		let lastLabel = -Infinity;
		return items.map((b) => {
			const labelled = b.cx - lastLabel >= LABEL_GAP && b.w >= 16 && b.cx > 20 && b.cx < width - 20;
			if (labelled) lastLabel = b.cx;
			return { ...b, labelled };
		});
	});

	// Designated single frequencies → pins.
	let pins = $derived.by(() => {
		const items = visible
			.filter((a) => !a.operator)
			.map((a) => ({ a, x: logPos(a.hz, domain) * width }))
			.filter((p) => p.x >= -2 && p.x <= width + 2)
			.sort((p, q) => p.x - q.x);
		let lastLabelX = -Infinity;
		return items.map((p) => {
			const labelled = p.x - lastLabelX >= LABEL_GAP && p.x > 24 && p.x < width - 24;
			if (labelled) lastLabelX = p.x;
			return { ...p, labelled };
		});
	});

	function activate(id: string) {
		select(id);
	}
	function onKey(e: KeyboardEvent, id: string) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			select(id);
		}
	}
</script>

<g class="assignments" aria-label="Assignment lane — operator holdings and designated frequencies">
	<!-- Operator/licensee holdings. -->
	{#each bars as b (b.a.id)}
		{@const sel = selected === b.a.id}
		<g
			class="op"
			class:sel
			role="button"
			tabindex="0"
			aria-label="{b.a.name}, {fmtFreq(b.a.band![0])} to {fmtFreq(b.a.band![1])} — operator holding"
			onclick={() => activate(b.a.id)}
			onkeydown={(e) => onKey(e, b.a.id)}
		>
			<title>{b.a.name} · {fmtFreq(b.a.band![0])}–{fmtFreq(b.a.band![1])}</title>
			<rect
				x={b.x0}
				y={yTop}
				width={Math.max(b.w, 1.5)}
				height={h}
				rx="2.5"
				style="fill: {operatorColorVar(b.a.operator!)}"
				class="op-bar"
				class:sel
			/>
			{#if b.labelled}
				<text x={b.cx} y={PLOT.assignLabelY} class="lbl" class:sel>{b.a.name}</text>
			{/if}
		</g>
	{/each}

	<!-- Designated single frequencies (distress / calling / emergency). -->
	{#each pins as p (p.a.id)}
		{@const sel = selected === p.a.id}
		<g
			class="pin"
			class:sel
			role="button"
			tabindex="0"
			aria-label="{p.a.name}, {fmtFreq(p.a.hz)} — designated frequency"
			onclick={() => activate(p.a.id)}
			onkeydown={(e) => onKey(e, p.a.id)}
		>
			<title>{p.a.name} · {fmtFreq(p.a.hz)}</title>
			<line
				x1={p.x}
				y1={yTop}
				x2={p.x}
				y2={yBot}
				class="stem"
				style="stroke: var(--layer-{p.a.layer})"
			/>
			<path
				d="M {p.x} {yTop - 3} l 3.2 3.4 l -3.2 3.4 l -3.2 -3.4 z"
				style="fill: var(--layer-{p.a.layer})"
				class="diamond"
			/>
			{#if p.labelled}
				<text x={p.x} y={PLOT.assignLabelY} class="lbl" class:sel>{p.a.name}</text>
			{/if}
		</g>
	{/each}
</g>

<style>
	.op,
	.pin {
		cursor: pointer;
	}
	.op:focus-visible,
	.pin:focus-visible {
		outline: none;
	}
	.op-bar {
		opacity: 0.78;
		stroke: var(--marker-stroke);
		stroke-width: 0.75;
	}
	.op:hover .op-bar,
	.op:focus-visible .op-bar,
	.op.sel .op-bar {
		opacity: 1;
		stroke: var(--ink);
		stroke-width: 1;
	}
	.op.sel .op-bar {
		filter: drop-shadow(0 0 5px currentColor);
	}
	.stem {
		stroke-width: 1.4;
		opacity: 0.85;
	}
	.diamond {
		stroke: var(--marker-stroke);
		stroke-width: 1;
	}
	.pin:hover .stem,
	.pin:focus-visible .stem,
	.pin.sel .stem {
		opacity: 1;
		stroke-width: 2;
	}
	.pin.sel .diamond {
		filter: drop-shadow(0 0 4px currentColor);
	}
	.lbl {
		font-family: var(--font-sans);
		font-size: 11px;
		font-weight: 500;
		fill: var(--sub);
		text-anchor: middle;
	}
	.lbl.sel {
		fill: var(--ink);
	}
	.op:hover .lbl,
	.pin:hover .lbl {
		fill: var(--ink);
	}
</style>
