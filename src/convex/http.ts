import { Hono } from 'hono';
import { HttpRouterWithHono, type HonoWithConvex } from 'convex-helpers/server/hono';
import type { ActionCtx } from './_generated/server';
import { cors } from 'hono/cors';
import { loginRoute } from './api/auth/login';
import { registerRoute } from './api/auth/register';
import { githubRoute } from './api/auth/github';

const app: HonoWithConvex<ActionCtx> = new Hono();
app.use('*', cors());
const auth_routes = app
	.basePath('/convex/api/')
	.route('auth/login', loginRoute)
	.route('auth/signup', registerRoute)
	.route('auth', githubRoute);

export { app };
export default new HttpRouterWithHono(app);
export type auth_router = typeof auth_routes;
