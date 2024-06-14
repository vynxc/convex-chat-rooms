<script lang="ts">
	let { children }: { children: () => any } = $props();
	import { auth } from '$lib/auth.svelte';
</script>

{#if auth.user}
	{@render children()}
{/if}
