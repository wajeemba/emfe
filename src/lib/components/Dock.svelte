<script lang="ts">
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';

	let { children }: { children: Snippet } = $props();

	// Collapsed by default on phones (the dock is fixed and would cover the plot); open on desktop.
	let open = $state(browser ? !window.matchMedia('(max-width: 720px)').matches : true);
</script>

<section class="dock" class:open>
	<button
		type="button"
		class="handle"
		aria-expanded={open}
		aria-controls="dock-body"
		onclick={() => (open = !open)}
	>
		<span class="grip" aria-hidden="true"></span>
		<span class="label">Controls</span>
		<span class="chevron" aria-hidden="true">{open ? '▾' : '▴'}</span>
	</button>

	{#if open}
		<div id="dock-body" class="body">
			{@render children()}
		</div>
	{/if}
</section>

<style>
	.dock {
		position: fixed;
		left: 18px;
		right: 18px;
		bottom: 0;
		z-index: 50;
		background: var(--panel);
		border: 1px solid var(--line);
		border-bottom: none;
		border-radius: 16px 16px 0 0;
		box-shadow: 0 -18px 50px rgba(0, 0, 0, 0.3);
	}

	.handle {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 9px 22px;
		background: none;
		border: none;
		cursor: pointer;
		color: inherit;
	}

	.grip {
		width: 34px;
		height: 4px;
		border-radius: 2px;
		background: var(--panelb);
	}

	.label {
		flex: 1;
		text-align: left;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.16em;
		color: var(--sub);
		text-transform: uppercase;
	}

	.chevron {
		font-family: var(--font-mono);
		font-size: 13px;
		color: var(--sub);
	}

	.body {
		display: flex;
		gap: 0;
		padding: 16px 22px 22px;
		border-top: 1px solid var(--line);
	}

	@media (max-width: 720px) {
		.dock {
			left: 0;
			right: 0;
			border-radius: 0;
		}
		.body {
			flex-direction: column;
			gap: 16px;
			/* Never let the (fixed) dock cover the whole screen — scroll its contents instead. */
			max-height: 68vh;
			overflow-y: auto;
		}
	}
</style>
