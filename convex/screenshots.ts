import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentTimestamp } from "./utils";

// Create a new screenshot entry
export const createScreenshot = mutation({
  args: {
    url: v.optional(v.string()),
    imageUrl: v.string(),
    fileId: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        format: v.optional(v.string()),
        size: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }
    
    // Create screenshot entry
    const screenshotId = await ctx.db.insert("screenshots", {
      userId: user._id,
      url: args.url,
      imageUrl: args.imageUrl,
      fileId: args.fileId,
      accessToken: args.accessToken,
      expiresAt: args.expiresAt,
      status: "complete",
      createdAt: getCurrentTimestamp(),
      metadata: args.metadata,
    });
    
    return { screenshotId };
  },
});

// Get screenshots for a user
export const getScreenshotsByUser = query({
  handler: async (ctx) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }
    
    // Get all screenshots for this user
    const screenshots = await ctx.db
      .query("screenshots")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    
    return screenshots.map((screenshot) => ({
      id: screenshot._id,
      url: screenshot.url,
      imageUrl: screenshot.imageUrl,
      status: screenshot.status,
      createdAt: screenshot.createdAt,
      metadata: screenshot.metadata,
    }));
  },
});

// Get a specific screenshot by ID
export const getScreenshotById = query({
  args: {
    screenshotId: v.id("screenshots"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Get the screenshot
    const screenshot = await ctx.db.get(args.screenshotId);
    
    if (!screenshot) {
      return null;
    }
    
    return {
      id: screenshot._id,
      userId: screenshot.userId,
      url: screenshot.url,
      imageUrl: screenshot.imageUrl,
      status: screenshot.status,
      createdAt: screenshot.createdAt,
      metadata: screenshot.metadata,
    };
  },
});

// Update screenshot status
export const updateScreenshotStatus = mutation({
  args: {
    screenshotId: v.id("screenshots"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Get the screenshot
    const screenshot = await ctx.db.get(args.screenshotId);
    
    if (!screenshot) {
      throw new Error("Screenshot not found");
    }
    
    // Update status
    await ctx.db.patch(args.screenshotId, {
      status: args.status,
    });
    
    return { success: true };
  },
});

// Delete a screenshot
export const deleteScreenshot = mutation({
  args: {
    screenshotId: v.id("screenshots"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }
    
    // Get the screenshot
    const screenshot = await ctx.db.get(args.screenshotId);
    
    if (!screenshot) {
      throw new Error("Screenshot not found");
    }
    
    // Check if user owns this screenshot
    if (screenshot.userId !== user._id) {
      throw new Error("Not authorized to delete this screenshot");
    }
    
    // Delete the screenshot
    await ctx.db.delete(args.screenshotId);
    
    return { success: true };
  },
}); 