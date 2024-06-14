<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { goto } from '$app/navigation';
	import { api } from '../../../convex/_generated/api';

	let name = $state('');
	let description = $state('');
	const client = useConvexClient();
	async function createRoom(e: SubmitEvent) {
		e.preventDefault();
		const roomId = await client.mutation(api.tasks.createRoom, { name, description });
		goto(`/room/${roomId}`);
	}
</script>

<div class="w-full max-w-md space-y-8">
	<div class="text-center">
		<h2 class="text-3xl font-bold">Create a Room</h2>
		<p class="mt-2">Fill out the form to create a new room.</p>
	</div>
	<form class="space-y-6" onsubmit={createRoom}>
		<div>
			<label for="name" class="uk-form-label"> Name </label>
			<div class="mt-1">
				<input
					bind:value={name}
					id="name"
					name="name"
					type="text"
					required
					class="uk-input"
					placeholder="Enter a name for your room"
				/>
			</div>
		</div>
		<div>
			<label for="description" class="uk-form-label"> Description </label>
			<div class="mt-1">
				<textarea
					bind:value={description}
					id="description"
					name="description"
					rows={3}
					required
					class="uk-textarea"
					placeholder="Enter a description for your room"
				></textarea>
			</div>
		</div>
		<div>
			<button type="submit" class="uk-button uk-button-primary w-full"> Create Room </button>
		</div>
	</form>
</div>
