import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateRandomToken } from "./utils";

// Create a new user (fake signup)
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user with this email already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Generate a fake auth token
    const fakeAuthToken = generateRandomToken();

    // Create the user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      fakeAuthToken,
      createdAt: Date.now(),
    });

    return {
      userId,
      name: args.name,
      email: args.email,
      fakeAuthToken,
    };
  },
});

// Login with email (fake login)
export const login = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Update last login time
    await ctx.db.patch(user._id, {
      lastLogin: Date.now(),
    });

    // Return user with auth token
    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      fakeAuthToken: user.fakeAuthToken,
    };
  },
});

// Get current user by auth token
export const me = query({
  args: {
    fakeAuthToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the user with this auth token
    // In a real app, this would validate a JWT or session token
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("fakeAuthToken"), args.fakeAuthToken))
      .collect();

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    return {
      userId: user._id,
      name: user.name,
      email: user.email,
    };
  },
});

// Get user by ID
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
    };
  },
}); 