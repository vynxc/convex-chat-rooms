import { client } from '$lib/convex';
import type { Handle } from '@sveltejs/kit';
import { api } from './convex/_generated/api';
import { log } from 'console';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('auth_session');
	//@ts-ignore
	event.locals.user = null;
	//@ts-ignore

	event.locals.session = null;
	if (!sessionId) {
		return resolve(event);
	}

	const user = await client.query(api.users.get, { sessionId });

	if (!user.session) {
		return resolve(event);
	}
	const session = JSON.parse(user.session);
	if (!user) {
		return resolve(event);
	}
	if (user.cookie) {
		event.setHeaders({
			'Set-Cookie': user.cookie
		});
	}
	if (session) {
		//@ts-ignore
		event.locals.user = session.user;
		//@ts-ignore
		event.locals.session = session.session;
		console.log(session);
	}
	return resolve(event);
};
