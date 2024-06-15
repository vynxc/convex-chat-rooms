<script lang="ts">
	import { hc } from 'hono/client';
	import { type auth_router } from '../../convex/http';
	import { goto } from '$app/navigation';
	let isRegistering = $state(false);
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let username = $state('');

	function toggleForm() {
		isRegistering = !isRegistering;
	}
	const client = hc<auth_router>('/');

	async function auth() {
		if (isRegistering) {
			const result = await client.convex.api.auth.signup.$post({
				json: {
					email,
					username,
					password,
					confirmPassword
				}
			});
			if (result.ok) {
				window.location.href = '/';
			} else {
				alert('Invalid credentials');
			}
		} else {
			const result = await client.convex.api.auth.login.$post({
				json: {
					email,
					password
				}
			});
			if (result.ok) {
				window.location.href = '/';
			} else {
				alert('Invalid credentials');
			}
		}
	}
</script>

<div class="uk-card">
	<div class="uk-card-header">
		<h3 class="text-2xl font-semibold tracking-tight">Create an account</h3>
		<p class="text-sm text-muted-foreground">Enter your email below to create your account</p>
	</div>
	<div class="uk-card-body space-y-4 py-0">
		{#if isRegistering}
			<div class="space-y-2">
				<label class="uk-form-label" for="username">Username</label>
				<input
					class="uk-input"
					bind:value={username}
					id="username"
					type="text"
					placeholder="Username"
				/>
			</div>
		{/if}
		<div class="space-y-2">
			<label class="uk-form-label" for="email">Email</label>
			<input
				class="uk-input"
				id="email"
				bind:value={email}
				type="text"
				placeholder="m@example.com"
			/>
		</div>
		<div class="space-y-2">
			<label class="uk-form-label" for="password">Password</label>
			<input
				class="uk-input"
				id="password"
				bind:value={password}
				type="password"
				placeholder="Password"
			/>
		</div>
		{#if isRegistering}
			<div class="space-y-2">
				<label class="uk-form-label" for="cpassword">Confirm Password</label>
				<input
					class="uk-input"
					bind:value={confirmPassword}
					id="cpassword"
					type="password"
					placeholder="Confirm Password"
				/>
			</div>
		{/if}
		<div class="relative">
			<div class="absolute inset-0 flex items-center">
				<span class="w-full border-t border-border"></span>
			</div>
			<div class="relative flex justify-end text-xs">
				<button
					onclick={toggleForm}
					class="bg-background px-2 uppercase text-muted-foreground underline"
				>
					{isRegistering ? 'Sign in' : 'Register now'}
				</button>
			</div>
		</div>
	</div>
	<div class="uk-card-footer">
		<button onclick={auth} class="uk-button uk-button-primary w-full">
			{isRegistering ? 'Register' : 'Sign in'}
		</button>
		<button
			onclick={() => goto('convex/api/auth/github')}
			class="uk-button uk-button-primary w-full"
		>
			Continue with GitHub
		</button>
	</div>
</div>
