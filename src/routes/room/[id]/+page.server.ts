import { client } from '$lib/convex';
import { api } from '../../../convex/_generated/api';
import type { PageServerLoad } from './$types';
import type { Id } from '../../../convex/_generated/dataModel';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const room = await client.query(api.tasks.getRoom, {
			roomId: params.id as Id<'rooms'>
		});

		const session = (locals as any).session?.id as string | undefined;
		const messages = await client.query(api.tasks.getMessages, {
			roomId: params.id as Id<'rooms'>,
			sessionId: session ?? null
		});
		return {
			messages,
			room
		};
	} catch (e) {
		console.log('error', e);
		let message = 'Failed to load room';
		if (e instanceof Error) {
			message = e.message;
		}
		return error(500, 'Failed to load room');
	}
};
