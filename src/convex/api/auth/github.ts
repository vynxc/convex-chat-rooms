import type { HonoWithConvex } from 'convex-helpers/server/hono';
import { Hono } from 'hono';
import type { ActionCtx } from '../../_generated/server';
import { generateState, GitHub, OAuth2RequestError } from 'arctic';
import { api } from '../../_generated/api';

const app: HonoWithConvex<ActionCtx> = new Hono();

const github =
	typeof process !== 'undefined'
		? new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRETE!)
		: undefined;

interface GitHubUserResult {
	id: number;
	login: string;
	avatar_url: string;
	email: string;
}
export const githubRoute = app
	.get('github', async (c) => {
		try {
			const state = generateState();
			const url = await github!.createAuthorizationURL(state, {
				scopes: ['user:email']
			});
			return c.redirect(url.toString());
		} catch (error) {
			console.error('Error generating GitHub authorization URL:', error);
			return c.json({ error: 'Internal server error' }, 500);
		}
	})
	.get('login/github/callback', async (c) => {
		try {
			const state = c.req.query('state');
			const code = c.req.query('code');

			if (!state || !code) {
				return c.json({ error: 'Missing state or code in query parameters' }, 400);
			}

			const tokens = await github!.validateAuthorizationCode(code);
			const githubUserResponse = await fetch('https://api.github.com/user', {
				headers: {
					'User-Agent': 'convex-chat-rooms',
					Authorization: `Bearer ${tokens.accessToken}`
				}
			});

			const body = await githubUserResponse.text();
			const githubUserResult: GitHubUserResult = JSON.parse(body);

			const cookie = await c.env.runMutation(api.users.getOrCreateOauthUser, {
				identifier: {
					where: 'github_id',
					id: githubUserResult.id
				},
				username: githubUserResult.login,
				avatar: githubUserResult.avatar_url,
				email: githubUserResult.email,
				sessionId: null
			});

			if (cookie) {
				c.header('Set-Cookie', cookie.cookie);
				return c.redirect('/');
			}
		} catch (e) {
			console.error('Error during GitHub OAuth callback:', e);
			if (e instanceof OAuth2RequestError) {
				return c.json({ error: 'OAuth2 request error' }, 400);
			}
			return c.json({ error: 'Internal server error' }, 500);
		}
	});
