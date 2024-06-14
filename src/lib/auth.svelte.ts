import type { User } from './types/user';

export let auth = $state<{ user: User | undefined; session: string | undefined }>({
	user: undefined,
	session: undefined
});

export function useSession() {
	return {
		get value() {
			return auth.session;
		}
	};
}
