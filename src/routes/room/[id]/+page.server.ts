import { client } from '$lib/convex';
import { api } from '../../../convex/_generated/api';
import type { PageServerLoad } from './$types';
import type { Id } from '../../../convex/_generated/dataModel';

export const load: PageServerLoad = async ({ params, locals }) => {
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
};
