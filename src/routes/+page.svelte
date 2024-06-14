<script lang="ts">
	import Room from '$lib/components/Room.svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../convex/_generated/api';

	const query = useQuery(api.tasks.getAllRooms, {});
</script>

<div class="w-[80vw]">
	<div class="uk-card">
		<div class="uk-card-header">
			<h1 class="uk-card-title text-2xl font-bold">Rooms</h1>
		</div>
		<div class="uk-card-body flex flex-wrap gap-4">
			{#if query.isLoading}
				<p class="text-gray-500">Loading...</p>
			{:else if query.error}
				<p class="text-red-500">Failed to load: {query.error.toString()}</p>
			{:else}
				{#each query.data as room}
					<Room {room} />
				{/each}
			{/if}
		</div>
		<div class="uk-card-footer flex items-end justify-end">
			<a href="/room/create" class="uk-button uk-button-primary"> Create Room </a>
		</div>
	</div>
</div>
