import { v } from 'convex/values';
import { queryWithAuth, mutationWithAuth } from './withAuth';
import { Scrypt, generateIdFromEntropySize } from 'lucia';

export const get = queryWithAuth({
	args: {},
	handler: async (ctx) => {
		let cookie: string | undefined;

		if (ctx.userSessionContext?.session?.fresh) {
			cookie = ctx.auth.createSessionCookie(ctx.userSessionContext.session.id).serialize();
		}

		return {
			session: JSON.stringify(ctx.userSessionContext),
			cookie
		};
	}
});

export const signIn = mutationWithAuth({
	args: {
		email: v.string(),
		password: v.string()
	},
	handler: async (ctx, { email, password }) => {
		const user = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('email'), email))
			.first();
		if (!user) {
			return null;
		}

		const validPassword = await new Scrypt().verify(user.password, password);
		if (!validPassword) {
			return null;
		}

		const session = await ctx.auth.createSession(user.id, {
			username: user.username,
			avatar: user.avatar
		});

		return {
			cookie: ctx.auth.createSessionCookie(session.id).serialize(),
			email: user.email,
			username: user.username,
			avatar: user.avatar
		};
	}
});

export const signUp = mutationWithAuth({
	args: {
		email: v.string(),
		username: v.string(),
		password: v.string()
	},
	handler: async (ctx, { email, password, username }) => {
		const hashedPassword = await new Scrypt().hash(password);
		const avatar = `https://api.dicebear.com/8.x/initials/svg?seed=${username}`;
		const id = generateIdFromEntropySize(10);

		await ctx.db.insert('users', {
			id,
			email,
			username,
			avatar,
			password: hashedPassword
		});

		const session = await ctx.auth.createSession(id, { username, avatar });

		return {
			cookie: ctx.auth.createSessionCookie(session.id).serialize(),
			email,
			username,
			avatar
		};
	}
});
