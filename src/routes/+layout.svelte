<script>
	import '../app.css';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';
	import { browser } from '$app/environment';
	import { auth } from '$lib/auth.svelte';

	const { children, data } = $props();
	setupConvex(PUBLIC_CONVEX_URL, {
		skipConvexDeploymentUrlCheck: true,
		disabled: !browser
	});
	auth.user = data.user;
	auth.session = data.session;
</script>

<div class="container mx-auto h-screen flex-col">
	<div class="m-auto flex h-full w-full max-w-md flex-col items-center justify-center">
		{@render children()}
	</div>
</div>
