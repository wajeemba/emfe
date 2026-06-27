<script lang="ts">
	import { theme, toggleTheme } from '$lib/state/theme';

	// Show the state you'll switch *to* (click-to-toggle): a sun in dark, a moon in light.
	let icon = $derived($theme === 'dark' ? '☀' : '☾');
	let label = $derived($theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
</script>

<button type="button" class="theme-toggle" onclick={toggleTheme} title={label} aria-label={label}>
	<span aria-hidden="true">{icon}</span>
</button>

<style>
	.theme-toggle {
		position: absolute;
		top: 1rem;
		right: 1rem;
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		border: 1px solid var(--panelb);
		background: var(--chip);
		color: var(--ink);
		font-size: 18px;
		line-height: 1;
		padding: 0;
		cursor: pointer;
		transition:
			background 0.15s,
			border-color 0.15s;
	}
	.theme-toggle:hover {
		border-color: var(--sub);
	}
</style>
