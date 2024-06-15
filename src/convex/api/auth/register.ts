import { type HonoWithConvex } from 'convex-helpers/server/hono';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { type ActionCtx } from '../../_generated/server';
import { api } from '../../_generated/api';
import { z } from 'zod';
const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters long')
	.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
	.regex(/[0-9]/, 'Password must contain at least one number')
	.regex(/[@$!%*?&#]/, 'Password must contain at least one special character');

const zRegister = z
	.object({
		email: z.string().email(),
		username: z.string().min(3, 'Username must be at least 3 characters long'),
		password: passwordSchema,
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords must match',
		path: ['confirmPassword']
	});

const app: HonoWithConvex<ActionCtx> = new Hono();

export const registerRoute = app.post(
	'/',
	zValidator('json', zRegister),
	async (c): Promise<Response> => {
		try {
			const body = c.req.valid('json');
			const result = await c.env.runMutation(api.users.signUp, {
				email: body.email,
				username: body.username,
				password: body.password,
				sessionId: null
			});

			if (result) {
				c.header('Set-Cookie', result.cookie);
				return c.json(
					{
						message: 'Successfully signed up',
						email: result.email,
						username: result.username,
						avatar: result.avatar
					},
					200
				);
			}
			return c.json({ error: 'Invalid credentials' }, 401);
		} catch (error) {
			console.error('Error during signup:', error);
			return c.json({ error: 'Internal server error' }, 500);
		}
	}
);
