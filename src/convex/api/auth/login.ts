import { type HonoWithConvex } from 'convex-helpers/server/hono';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { type ActionCtx } from '../../_generated/server';
import { api } from '../../_generated/api';
import { z } from 'zod';
//import { app } from '../../http';
const zLogin = z.object({
	email: z.string().email(),
	password: z.string()
});
const app: HonoWithConvex<ActionCtx> = new Hono();

export const loginRoute = app.post(
	'/',
	zValidator('json', zLogin),
	async (c): Promise<Response> => {
		try {
			const body = c.req.valid('json');
			const result = await c.env.runMutation(api.users.signIn, {
				email: body.email,
				password: body.password,
				sessionId: null
			});

			if (result) {
				c.header('Set-Cookie', result.cookie);
				return c.json(
					{
						message: 'Successfully logged in',
						email: result.email,
						username: result.username,
						avatar: result.avatar
					},
					200
				);
			}
			return c.json({ error: 'Invalid credentials' }, 401);
		} catch (error) {
			console.error('Error during login:', error);
			return c.json({ error: 'Internal server error' }, 500);
		}
	}
);
