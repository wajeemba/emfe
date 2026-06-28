<script lang="ts">
	import type { Allocation, LicenseRank } from '$lib/data/types';
	import Inspector from './Inspector.svelte';

	let {
		allocation,
		license,
		open,
		onclose
	}: {
		allocation: Allocation;
		license: LicenseRank;
		open: boolean;
		onclose: () => void;
	} = $props();

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) onclose();
	}
</script>

<svelte:window onkeydown={onKey} />

<!-- Backdrop: dims + closes the drawer when clicked. Esc + the close button are the
     keyboard-accessible paths, so this stays aria-hidden. -->
<div class="backdrop" class:show={open} onclick={onclose} aria-hidden="true"></div>

<div
	class="drawer"
	class:open
	role="dialog"
	aria-modal="true"
	aria-label="Allocation details"
	inert={!open}
>
	<button type="button" class="close" onclick={onclose} aria-label="Close details">×</button>
	<div class="content">
		<Inspector {allocation} {license} />
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: rgba(0, 0, 0, 0.4);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.25s ease;
	}
	.backdrop.show {
		opacity: 1;
		pointer-events: auto;
	}

	.drawer {
		position: fixed;
		z-index: 61;
		background: var(--panel);
		border: 1px solid var(--line);
		box-shadow: -18px 0 50px rgba(0, 0, 0, 0.28);
		overflow: hidden auto;
		overscroll-behavior: contain;
		/* desktop / landscape: a right-hand side sheet */
		top: 0;
		right: 0;
		height: 100dvh;
		width: min(380px, 92vw);
		border-radius: 18px 0 0 18px;
		transform: translateX(102%);
		transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.drawer.open {
		transform: translateX(0);
	}

	.content {
		padding: 40px 22px 24px;
	}

	.close {
		position: absolute;
		top: 10px;
		right: 12px;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 8px;
		background: var(--chip);
		color: var(--sub);
		font-size: 20px;
		line-height: 1;
		cursor: pointer;
		z-index: 1;
	}
	.close:hover {
		background: var(--panelb);
		color: var(--ink);
	}

	/* Portrait phones: a bottom sheet instead of a side sheet. */
	@media (max-width: 720px) {
		.drawer {
			top: auto;
			bottom: 0;
			left: 0;
			right: 0;
			width: auto;
			height: auto;
			max-height: 78dvh;
			border-radius: 18px 18px 0 0;
			box-shadow: 0 -18px 50px rgba(0, 0, 0, 0.3);
			transform: translateY(102%);
		}
		.drawer.open {
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.drawer,
		.backdrop {
			transition: none;
		}
	}
</style>
