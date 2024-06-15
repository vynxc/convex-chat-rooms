import { v } from 'convex/values';
import { queryWithAuth, mutationWithAuth } from './withAuth';
import { Scrypt, generateIdFromEntropySize } from 'lucia';

export const getSessionDetails = queryWithAuth({
	args: {},
	handler: async (ctx) => {
		let sessionCookie: string | undefined;

		if (ctx.userSessionContext?.session?.fresh) {
			sessionCookie = ctx.auth.createSessionCookie(ctx.userSessionContext.session.id).serialize();
		}

		return {
			session: JSON.stringify(ctx.userSessionContext),
			cookie: sessionCookie
		};
	}
});

export const getOrCreateOauthUser = mutationWithAuth({
	args: {
		identifier: v.union(
			v.object({
				where: v.literal('github_id'),
				id: v.number()
			}),
			v.object({
				where: v.literal('google_id'),
				id: v.string()
			})
		),
		username: v.string(),
		email: v.union(v.string(), v.null()),
		avatar: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		let user = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field(args.identifier.where), args.identifier.id))
			.first();

		if (!user) {
			const avatar =
				args.avatar ?? `https://api.dicebear.com/8.x/initials/svg?seed=${args.username}`;
			const id = generateIdFromEntropySize(10);

			const newUser = await ctx.db.insert('users', {
				id: id,
				username: args.username,
				avatar: avatar,
				email: args.email ?? undefined
			});

			user = {
				_id: newUser,
				id: id,
				username: args.username,
				avatar: avatar,
				email: args.email ?? undefined,
				google_id: undefined,
				github_id: undefined,
				password: undefined,
				_creationTime: Date.now()
			};
		}

		const session = await ctx.auth.createSession(user.id, {
			username: user.username,
			avatar: user.avatar
		});
		const sessionCookie = ctx.auth.createSessionCookie(session.id).serialize();

		return {
			cookie: sessionCookie
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

		if (!user || user.password === undefined) {
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
