<script lang="ts">
	import { visibleDomain, lod } from '$lib/state/view';
	import { LOD_LABELS } from '$lib/spectrum/lod';
	import { PLOT } from '$lib/components/plot-layout';
	import Axis from '$lib/components/Axis.svelte';
	import RegionLabels from '$lib/components/RegionLabels.svelte';
	import SpectrumBand from '$lib/components/SpectrumBand.svelte';

	let width = $state(0);
</script>

<svelte:head>
	<title>EM Frequency Explorer</title>
	<meta
		name="description"
		content="An interactive, zoomable explorer for the electromagnetic spectrum — from below ELF through radio, light, X-ray and gamma, on one logarithmic frequency axis."
	/>
</svelte:head>

<main>
	<section class="card">
		<header>
			<div>
				<h1>The Electromagnetic Spectrum</h1>
				<p class="sub">Everything we broadcast, navigate by, and see — on one continuous scale.</p>
			</div>
			<div class="readout">
				ν, hertz (log)<br />
				Detail: {LOD_LABELS[$lod].toLowerCase()}
			</div>
		</header>

		<div class="plot" style="height: {PLOT.height}px" bind:clientWidth={width}>
			{#if width > 0}
				<svg
					{width}
					height={PLOT.height}
					viewBox="0 0 {width} {PLOT.height}"
					role="img"
					aria-label="Electromagnetic spectrum on a logarithmic frequency axis, 1 Hz to 10^24 Hz"
				>
					<SpectrumBand {width} domain={$visibleDomain} />
					<RegionLabels {width} domain={$visibleDomain} />
					<Axis {width} domain={$visibleDomain} />
				</svg>
			{/if}
		</div>
	</section>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		padding: 16px 28px 48px;
	}

	.card {
		width: 100%;
		max-width: 1280px;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 20px;
		box-shadow: var(--softshadow);
		padding: 24px 40px 22px;
	}

	header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 24px;
	}

	h1 {
		margin: 0;
		font-family: var(--font-serif);
		font-size: 27px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.sub {
		margin: 3px 0 0;
		font-size: 13.5px;
		color: var(--sub);
	}

	.readout {
		flex-shrink: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--faint);
		text-align: right;
		line-height: 1.5;
	}

	.plot {
		position: relative;
		width: 100%;
	}

	svg {
		display: block;
	}
</style>
