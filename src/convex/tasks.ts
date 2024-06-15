import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { mutationWithAuth, queryWithAuth } from './withAuth';
import { entsTableFactory } from 'convex-ents';
import { entDefinitions } from './schema';

// Create a new room with the provided name and description
export const createRoom = mutation({
	args: { name: v.string(), description: v.string() },
	handler: async (ctx, args) => {
		try {
			const newRoom = await ctx.db.insert('rooms', {
				name: args.name,
				description: args.description
			});
			return { success: true, room: newRoom };
		} catch (error) {
			console.error('Error creating room:', error);
			return { success: false, error: 'Failed to create room' };
		}
	}
});

// Retrieve all rooms
export const getAllRooms = query({
	handler: async (ctx) => {
		try {
			const rooms = await ctx.db.query('rooms').collect();
			return rooms;
		} catch (error) {
			console.error('Error retrieving rooms:', error);
			throw new Error('Failed to retrieve rooms');
		}
	}
});

// Create a new message in the specified room
export const createMessage = mutationWithAuth({
	args: { roomId: v.id('rooms'), content: v.string() },
	handler: async (ctx, args) => {
		try {
			const sender = ctx.userSessionContext?.user;
			if (!sender) {
				return { success: false, error: 'You are not logged in' };
			}

			const user = await ctx.db
				.query('users')
				.filter((q) => q.eq(q.field('id'), sender.id))
				.first();
			if (!user) {
				return { success: false, error: 'User not found' };
			}

			const newMessage = await ctx.db.insert('messages', {
				roomId: args.roomId,
				content: args.content,
				userId: user._id
			});
			return { success: true, message: newMessage };
		} catch (error) {
			console.error('Error creating message:', error);
			return { success: false, error: 'Failed to create message' };
		}
	}
});

// Retrieve a specific room by ID
export const getRoom = query({
	args: { roomId: v.string() },
	handler: async (ctx, args) => {
		try {
			const room = await ctx.db
				.query('rooms')
				.filter((q) => q.eq(q.field('_id'), args.roomId))
				.first();
			if (!room) throw new Error('Room not found');
			return room;
		} catch (error) {
			console.error('Error retrieving room:', error);
			throw new Error('Failed to retrieve room');
		}
	}
});
export const getMessagess = queryWithAuth({
	args: { roomId: v.id('rooms') },
	handler: async (ctx, args) => {
		const table = entsTableFactory(ctx, entDefinitions);
		const messages = await table('messages')
			.filter((q) => q.eq(q.field('roomId'), args.roomId))
			.map(async (message) => ({
				...message,
				user: await message.edge('user')
			}));
		return messages;
	}
});
// Retrieve messages from a specific room
export const getMessages = queryWithAuth({
	args: { roomId: v.id('rooms') },
	handler: async (ctx, args) => {
		try {
			const table = entsTableFactory(ctx, entDefinitions);
			return await table('messages')
				.filter((q) => q.eq(q.field('roomId'), args.roomId))
				.map(async (message) => ({
					...message,
					user: await message.edge('user')
				}));
		} catch (error) {
			console.error('Error retrieving messages:', error);
			return { success: false, error: 'Failed to retrieve messages' };
		}
	}
});
