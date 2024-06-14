import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { mutationWithAuth, queryWithAuth } from './withAuth';
import { entsTableFactory } from 'convex-ents';
import { entDefinitions } from './schema';

export const createRoom = mutation({
	args: { name: v.string(), description: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db.insert('rooms', {
			name: args.name,
			description: args.description
		});
	}
});

export const getAllRooms = query({
	handler: async (ctx) => {
		return await ctx.db.query('rooms').collect();
	}
});

export const createMessage = mutationWithAuth({
	args: { roomId: v.id('rooms'), content: v.string() },
	handler: async (ctx, args) => {
		const sender = ctx.userSessionContext?.user;
		if (!sender) {
			return { error: 'You are not logged in' };
		}

		const user = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('id'), sender.id))
			.first();
		if (!user) {
			return null;
		}

		return await ctx.db.insert('messages', {
			roomId: args.roomId,
			content: args.content,
			userId: user._id
		});
	}
});

export const getRoom = query({
	args: { roomId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('rooms')
			.filter((q) => q.eq(q.field('_id'), args.roomId))
			.first();
	}
});

export const getMessages = queryWithAuth({
	args: { roomId: v.id('rooms') },
	handler: async (ctx, args) => {
		const table = entsTableFactory(ctx, entDefinitions);
		return await table('messages')
			.filter((q) => q.eq(q.field('roomId'), args.roomId))
			.map(async (message) => ({
				...message,
				user: await message.edge('user')
			}));
	}
});
