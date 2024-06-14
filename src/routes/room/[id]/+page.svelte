<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { page } from '$app/stores';
	import { api } from '../../../convex/_generated/api';
	import { useSession } from '$lib/auth.svelte';
	import type { Id } from '../../../convex/_generated/dataModel';

	let { data } = $props();
	const client = useConvexClient();
	const roomId = $page.params.id as Id<'rooms'>;
	const session = useSession();
	const messagesQuery = useQuery(
		api.tasks.getMessages,
		{ roomId, sessionId: session.value ?? null },
		{ initialData: data.messages }
	);
	const roomQuery = useQuery(api.tasks.getRoom, { roomId }, { initialData: data.room });
	let message = $state('');

	async function sendMessage() {
		if (!message.trim() || message === '' || message === undefined || roomQuery.data === undefined)
			return;

		const room = await client.query(api.tasks.getRoom, { roomId });
		if (!room) return;
		const mutation = await client.mutation(api.tasks.createMessage, {
			roomId: room._id,
			content: message,
			sessionId: session.value ?? null
		});
		if (!mutation) alert('Failed to send message');
		message = '';
	}
	$effect(() => {
		console.log(messagesQuery.data);
		scrollMessagesToBottom();
	});
	function scrollMessagesToBottom() {
		console.log('scrolling');

		const messagesContainer = document.getElementById('messages-container');
		if (messagesContainer) {
			console.log('scrolling to bottom');
			messagesContainer.scrollTo({
				top: messagesContainer.scrollHeight,
				behavior: 'instant'
			});
		}
	}
</script>

<div class=" w-full max-w-5xl p-4 md:w-[80vw]">
	{#if messagesQuery.isLoading}
		<p class="text-gray-500">Loading...</p>
	{:else if messagesQuery.error}
		<p class="text-red-500">Failed to load: {messagesQuery.error.toString()}</p>
	{:else}
		<div>
			<a href="/">back</a>
		</div>
		<p class="mb-4 text-2xl">{roomQuery.data?.name}</p>
		<div class="mb-4 w-full space-y-8 rounded-lg">
			<ul class="space-y-4" id="messages-container">
				{#each messagesQuery.data as task}
					<li class="uk-card flex min-h-24 gap-4 p-4">
						<img
							src={task.user.avatar}
							alt="{task.user.username}'s avatar"
							class="h-10 w-10 rounded-full object-cover"
						/>
						<div>
							<p class="text-sm text-gray-600 dark:text-gray-400">{task.user.username}</p>
							<p class="text-gray-900 dark:text-gray-50">{task.content}</p>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
	<div class="flex items-center gap-2">
		<input
			id="message-input"
			type="text"
			bind:value={message}
			class="uk-input"
			placeholder="Type your message..."
			onkeydown={(e) => {
				if (e.key === 'Enter') sendMessage();
			}}
		/>
		<button onclick={sendMessage} class="uk-button uk-button-default block"> Send </button>
	</div>
</div>

<style>
	#messages-container {
		overflow: auto;
		height: 80vh;
		scroll-behavior: smooth; /* Enable smooth scrolling behavior */
	}
</style>
