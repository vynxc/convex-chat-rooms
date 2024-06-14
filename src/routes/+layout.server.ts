import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { User } from '$lib/types/user';

export const load: LayoutServerLoad = async ({ locals, route }) => {
	const session = (locals as any).session?.id as string | undefined;
	const user = (locals as any).user as User | undefined;
	if (route.id != '/login' && !user) {
		redirect(302, '/login');
	}

	return { user, session };
};
