import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HttpRouterWithHono, type HonoWithConvex } from 'convex-helpers/server/hono';
import type { ActionCtx } from './_generated/server';
import { api } from './_generated/api';
import { cors } from 'hono/cors';
import z from 'zod';

const app: HonoWithConvex<ActionCtx> = new Hono();
app.use('*', cors());
const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters long')
	.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
	.regex(/[0-9]/, 'Password must contain at least one number')
	.regex(/[@$!%*?&#]/, 'Password must contain at least one special character');

export const zRegister = z
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

export const zLogin = z.object({
	email: z.string().email(),
	password: z.string()
});

const auth_routes = app
	.basePath('/convex/api/')
	.post('auth/login', zValidator('json', zLogin), async (c) => {
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
	})
	.post('auth/signup', zValidator('json', zRegister), async (c) => {
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
	});

export default new HttpRouterWithHono(app);
export type auth_router = typeof auth_routes;
