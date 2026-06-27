<script lang="ts">
	import '../app.css';
	import { theme } from '$lib/state/theme';

	let { children } = $props();

	// Keep the document theme attribute in sync with the store (browser only).
	$effect(() => {
		document.documentElement.dataset.theme = $theme;
	});
</script>

{@render children()}
