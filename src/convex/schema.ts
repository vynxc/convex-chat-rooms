import { defineEnt, defineEntSchema, getEntDefinitions } from 'convex-ents';
import { Validator, v } from 'convex/values';

export const schema = defineEntSchema({
	...authTables({
		user: {
			email: v.optional(v.string()),
			username: v.string(),
			avatar: v.string(),
			password: v.optional(v.string()),
			github_id: v.optional(v.number()), // Optional for GitHub OAuth
			google_id: v.optional(v.string())
		},

		session: {}
	}),
	rooms: defineEnt({
		name: v.string(),
		description: v.string()
	}),

	messages: defineEnt({
		roomId: v.id('rooms'),
		content: v.string()
	})
		.edge('user')
		.index('by_roomId', ['roomId'])
});

function authTables<
	UserFields extends Record<string, Validator<any, any, any>>,
	SchemaFields extends Record<string, Validator<any, any, any>>
>({ user, session }: { user: UserFields; session: SchemaFields }) {
	return {
		users: defineEnt({
			...user,
			id: v.string()
		})
			.index('byId', ['id'])
			.edges('messages', { ref: true }),
		sessions: defineEnt({
			...session,
			id: v.string(),
			user_id: v.string(),
			expires_at: v.float64()
		})
			.index('byId', ['id' as any])
			.index('byUserId', ['user_id' as any])
	};
}

//console.log(schemaToMermaid(schema));
export default schema;
export const entDefinitions = getEntDefinitions(schema);
