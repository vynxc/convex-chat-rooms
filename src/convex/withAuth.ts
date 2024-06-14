import { type ObjectType, type PropertyValidators, v } from 'convex/values';
import { type Session, type User } from 'lucia';
import {
	type DatabaseWriter,
	type MutationCtx,
	type QueryCtx,
	internalMutation,
	internalQuery,
	mutation,
	query
} from './_generated/server';
import { type Auth, getAuth } from './lucia';

export function queryWithAuth<ArgsValidator extends PropertyValidators, Output>({
	args,
	handler
}: QueryWithAuth<ArgsValidator, Output>) {
	return query({
		args: {
			...args,
			sessionId: v.union(v.null(), v.string())
		},
		handler: async (ctx, args: any) => {
			const auth = getAuth(ctx.db as DatabaseWriter);
			const userSessionContext = await getValidExistingSession(auth, args.sessionId);
			return handler({ ...ctx, userSessionContext, auth }, args);
		}
	});
}

export function internalQueryWithAuth<ArgsValidator extends PropertyValidators, Output>({
	args,
	handler
}: QueryWithAuth<ArgsValidator, Output>) {
	return internalQuery({
		args: { ...args, sessionId: v.union(v.null(), v.string()) },
		handler: async (ctx, args: any) => {
			const auth = getAuth(ctx.db as DatabaseWriter);
			const userSessionContext = await getValidExistingSession(auth, args.sessionId);
			return handler({ ...ctx, userSessionContext, auth }, args);
		}
	});
}

export function mutationWithAuth<ArgsValidator extends PropertyValidators, Output>({
	args,
	handler
}: MutationWithAuth<ArgsValidator, Output>) {
	return mutation({
		args: { ...args, sessionId: v.union(v.null(), v.string()) },
		handler: async (ctx, args: any) => {
			const auth = getAuth(ctx.db);
			const userSessionContext = await getValidExistingSession(auth, args.sessionId);
			return handler({ ...ctx, userSessionContext, auth }, args);
		}
	});
}

export function internalMutationWithAuth<ArgsValidator extends PropertyValidators, Output>({
	args,
	handler
}: MutationWithAuth<ArgsValidator, Output>) {
	return internalMutation({
		args: { ...args, sessionId: v.union(v.null(), v.string()) },
		handler: async (ctx, args: any) => {
			const auth = getAuth(ctx.db);
			const userSessionContext = await getValidExistingSession(auth, args.sessionId);
			return handler({ ...ctx, userSessionContext, auth }, args);
		}
	});
}

async function getValidExistingSession(
	auth: Auth,
	sessionId: string | null
): Promise<UserSessionContext> {
	if (!sessionId) return null;
	try {
		return await auth.validateSession(sessionId);
	} catch {
		return null;
	}
}

type UserSessionContext =
	| {
			user: User;
			session: Session;
	  }
	| {
			user: null;
			session: null;
	  }
	| null;

type MutationWithAuth<ArgsValidator extends PropertyValidators, Output> = {
	args: ArgsValidator;
	handler: (
		ctx: Omit<MutationCtx, 'auth'> & {
			auth: Auth;
			userSessionContext: UserSessionContext;
		},
		args: ObjectType<ArgsValidator>
	) => Output;
};

type QueryWithAuth<ArgsValidator extends PropertyValidators, Output> = {
	args: ArgsValidator;
	handler: (
		ctx: Omit<QueryCtx, 'auth'> & {
			auth: Auth;
			userSessionContext: UserSessionContext;
		},
		args: ObjectType<ArgsValidator>
	) => Output;
};
