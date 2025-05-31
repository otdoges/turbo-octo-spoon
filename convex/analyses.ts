import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateUser, getCurrentTimestamp } from "./utils";

// Create a new analysis
export const createAnalysis = mutation({
  args: {
    fakeAuthToken: v.string(),
    screenshotId: v.id("screenshots"),
  },
  handler: async (ctx, args) => {
    // Validate user
    const user = await validateUser(ctx, args.fakeAuthToken);
    
    // Check if screenshot exists
    const screenshot = await ctx.db.get(args.screenshotId);
    if (!screenshot) {
      throw new Error("Screenshot not found");
    }
    
    // Check if user owns this screenshot
    if (screenshot.userId !== user._id) {
      throw new Error("Not authorized to analyze this screenshot");
    }
    
    // Create analysis entry
    const analysisId = await ctx.db.insert("analyses", {
      screenshotId: args.screenshotId,
      userId: user._id,
      status: "pending",
      createdAt: getCurrentTimestamp(),
    });
    
    return { analysisId };
  },
});

// Get analyses for a user
export const getAnalysesByUser = query({
  args: {
    fakeAuthToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate user
    const user = await validateUser(ctx, args.fakeAuthToken);
    
    // Get all analyses for this user
    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    
    return analyses.map((analysis) => ({
      id: analysis._id,
      screenshotId: analysis.screenshotId,
      status: analysis.status,
      result: analysis.result,
      createdAt: analysis.createdAt,
      completedAt: analysis.completedAt,
    }));
  },
});

// Get analyses for a specific screenshot
export const getAnalysesByScreenshot = query({
  args: {
    fakeAuthToken: v.string(),
    screenshotId: v.id("screenshots"),
  },
  handler: async (ctx, args) => {
    // Validate user
    await validateUser(ctx, args.fakeAuthToken);
    
    // Get analyses for this screenshot
    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_screenshotId", (q) => q.eq("screenshotId", args.screenshotId))
      .order("desc")
      .collect();
    
    return analyses.map((analysis) => ({
      id: analysis._id,
      screenshotId: analysis.screenshotId,
      status: analysis.status,
      result: analysis.result,
      createdAt: analysis.createdAt,
      completedAt: analysis.completedAt,
    }));
  },
});

// Get a specific analysis by ID
export const getAnalysisById = query({
  args: {
    fakeAuthToken: v.string(),
    analysisId: v.id("analyses"),
  },
  handler: async (ctx, args) => {
    // Validate user
    await validateUser(ctx, args.fakeAuthToken);
    
    // Get the analysis
    const analysis = await ctx.db.get(args.analysisId);
    
    if (!analysis) {
      return null;
    }
    
    return {
      id: analysis._id,
      screenshotId: analysis.screenshotId,
      userId: analysis.userId,
      status: analysis.status,
      result: analysis.result,
      createdAt: analysis.createdAt,
      completedAt: analysis.completedAt,
    };
  },
});

// Update analysis with results
export const updateAnalysisResults = mutation({
  args: {
    fakeAuthToken: v.string(),
    analysisId: v.id("analyses"),
    result: v.object({
      colorPalette: v.array(v.string()),
      style: v.optional(v.string()),
      layout: v.optional(v.string()),
      elements: v.optional(
        v.object({
          header: v.optional(
            v.object({
              position: v.optional(v.string()),
              style: v.optional(v.string()),
            })
          ),
          navigation: v.optional(
            v.object({
              type: v.optional(v.string()),
              items: v.optional(v.number()),
            })
          ),
          footer: v.optional(
            v.object({
              size: v.optional(v.string()),
            })
          ),
        })
      ),
      recommendations: v.optional(
        v.object({
          colorAdjustments: v.optional(v.string()),
          layoutImprovements: v.optional(v.string()),
          typographyChanges: v.optional(v.string()),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    // Validate user
    await validateUser(ctx, args.fakeAuthToken);
    
    // Get the analysis
    const analysis = await ctx.db.get(args.analysisId);
    
    if (!analysis) {
      throw new Error("Analysis not found");
    }
    
    // Update analysis with results
    await ctx.db.patch(args.analysisId, {
      status: "complete",
      result: args.result,
      completedAt: getCurrentTimestamp(),
    });
    
    return { success: true };
  },
}); 