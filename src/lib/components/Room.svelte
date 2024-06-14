<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Id } from '../../convex/_generated/dataModel';
	let {
		room
	}: { room: { _id: Id<'rooms'>; _creationTime: number; name: string; description: string } } =
		$props();
	function joinRoom() {
		console.log('join room', room._id);
		goto(`/room/${room._id}`);
	}
</script>

<div class="uk-card w-full max-w-sm rounded-lg">
	<div class="uk-card-body p-4">
		<h2 class="text-xl font-bold">{room.name}</h2>
		<p class="mt-2">
			{room.description}
		</p>
	</div>
	<div class="uk-card-footer flex justify-end">
		<button onclick={joinRoom} class="uk-button uk-button-secondary">Talk</button>
	</div>
</div>
