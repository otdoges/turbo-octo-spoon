import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Auth, DatabaseReader } from "convex/server";

/**
 * Helper function to get the current user ID from a Clerk token
 */
export const getUserId = async (
  auth: Auth,
  db: DatabaseReader,
): Promise<string | null> => {
  // Get the Clerk user ID from the token
  const identity = await auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // Get the user from the database
  const user = await db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
    .first();

  // If no user found, create one
  if (!user) {
    const userId = await db.insert("users", {
      name: identity.name || "Anonymous User",
      email: identity.email || "",
      clerkId: identity.tokenIdentifier,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    });
    return userId;
  }

  // Update last login time
  await db.patch(user._id, { lastLogin: Date.now() });
  return user._id;
};

/**
 * Get the current user, or throw if not authenticated
 */
export const getUser = async (
  auth: Auth,
  db: DatabaseReader,
): Promise<string> => {
  const userId = await getUserId(auth, db);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
};

/**
 * Query to check if the current user is authenticated
 */
export const isAuthenticated = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return !!identity;
  },
});

/**
 * Query to get the current user
 */
export const me = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.tokenIdentifier))
      .first();

    return user;
  },
});

/**
 * Internal mutation to create or update a user when they log in
 */
export const createOrUpdateUser = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      return ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        lastLogin: Date.now(),
      });
    } else {
      // Create new user
      return ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: args.name,
        email: args.email,
        createdAt: Date.now(),
        lastLogin: Date.now(),
      });
    }
  },
});

/**
 * Action to synchronize a user from Clerk to Convex
 */
export const syncUser = action({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.runMutation(internal.auth.createOrUpdateUser, {
      clerkId: identity.tokenIdentifier,
      name: identity.name || "Anonymous User",
      email: identity.email || "",
    });
  },
}); 