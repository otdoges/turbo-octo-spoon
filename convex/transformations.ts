import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateUser, getCurrentTimestamp } from "./utils";

// Create a new transformation
export const createTransformation = mutation({
  args: {
    fakeAuthToken: v.string(),
    analysisId: v.id("analyses"),
    style: v.string(),
  },
  handler: async (ctx: { db: { get: (arg0: any) => any; insert: (arg0: string, arg1: { analysisId: any; screenshotId: any; userId: any; style: any; status: string; createdAt: number; }) => any; }; }, args: { fakeAuthToken: string; analysisId: any; style: any; }) => {
    // Validate user
    const user = await validateUser(ctx, args.fakeAuthToken);
    
    // Check if analysis exists
    const analysis = await ctx.db.get(args.analysisId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }
    
    // Check if user owns this analysis
    if (analysis.userId !== user._id) {
      throw new Error("Not authorized to transform this analysis");
    }
    
    // Get the screenshot ID from the analysis
    const screenshotId = analysis.screenshotId;
    
    // Create transformation entry
    const transformationId = await ctx.db.insert("transformations", {
      analysisId: args.analysisId,
      screenshotId,
      userId: user._id,
      style: args.style,
      status: "pending",
      createdAt: getCurrentTimestamp(),
    });
    
    return { transformationId };
  },
});

// Get transformations for a user
export const getTransformationsByUser = query({
  args: {
    fakeAuthToken: v.string(),
  },
  handler: async (ctx: { db: { query: (arg0: string) => { (): any; new(): any; withIndex: { (arg0: string, arg1: (q: any) => any): { (): any; new(): any; order: { (arg0: string): { (): any; new(): any; collect: { (): any; new(): any; }; }; new(): any; }; }; new(): any; }; }; }; }, args: { fakeAuthToken: string; }) => {
    // Validate user
    const user = await validateUser(ctx, args.fakeAuthToken);
    
    // Get all transformations for this user
    const transformations = await ctx.db
      .query("transformations")
      .withIndex("by_userId", (q: { eq: (arg0: string, arg1: any) => any; }) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    
    return transformations.map((transformation: { _id: any; analysisId: any; screenshotId: any; style: any; status: any; result: any; createdAt: any; completedAt: any; }) => ({
      id: transformation._id,
      analysisId: transformation.analysisId,
      screenshotId: transformation.screenshotId,
      style: transformation.style,
      status: transformation.status,
      result: transformation.result,
      createdAt: transformation.createdAt,
      completedAt: transformation.completedAt,
    }));
  },
});

// Get transformations for a specific analysis
export const getTransformationsByAnalysis = query({
  args: {
    fakeAuthToken: v.string(),
    analysisId: v.id("analyses"),
  },
  handler: async (ctx: { db: { query: (arg0: string) => { (): any; new(): any; withIndex: { (arg0: string, arg1: (q: any) => any): { (): any; new(): any; order: { (arg0: string): { (): any; new(): any; collect: { (): any; new(): any; }; }; new(): any; }; }; new(): any; }; }; }; }, args: { fakeAuthToken: string; analysisId: any; }) => {
    // Validate user
    await validateUser(ctx, args.fakeAuthToken);
    
    // Get transformations for this analysis
    const transformations = await ctx.db
      .query("transformations")
      .withIndex("by_analysisId", (q: { eq: (arg0: string, arg1: any) => any; }) => q.eq("analysisId", args.analysisId))
      .order("desc")
      .collect();
    
    return transformations.map((transformation: { _id: any; analysisId: any; screenshotId: any; style: any; status: any; result: any; createdAt: any; completedAt: any; }) => ({
      id: transformation._id,
      analysisId: transformation.analysisId,
      screenshotId: transformation.screenshotId,
      style: transformation.style,
      status: transformation.status,
      result: transformation.result,
      createdAt: transformation.createdAt,
      completedAt: transformation.completedAt,
    }));
  },
});

// Get a specific transformation by ID
export const getTransformationById = query({
  args: {
    fakeAuthToken: v.string(),
    transformationId: v.id("transformations"),
  },
  handler: async (ctx: { db: { get: (arg0: any) => any; }; }, args: { fakeAuthToken: string; transformationId: any; }) => {
    // Validate user
    await validateUser(ctx, args.fakeAuthToken);
    
    // Get the transformation
    const transformation = await ctx.db.get(args.transformationId);
    
    if (!transformation) {
      return null;
    }
    
    return {
      id: transformation._id,
      analysisId: transformation.analysisId,
      screenshotId: transformation.screenshotId,
      userId: transformation.userId,
      style: transformation.style,
      status: transformation.status,
      result: transformation.result,
      createdAt: transformation.createdAt,
      completedAt: transformation.completedAt,
    };
  },
});

// Update transformation with results
export const updateTransformationResults = mutation({
  args: {
    fakeAuthToken: v.string(),
    transformationId: v.id("transformations"),
    result: v.object({
      transformedImageUrl: v.optional(v.string()),
      htmlCode: v.optional(v.string()),
      cssCode: v.optional(v.string()),
    }),
  },
  handler: async (ctx: { db: { get: (arg0: any) => any; patch: (arg0: any, arg1: { status: string; result: any; completedAt: number; }) => any; }; }, args: { fakeAuthToken: string; transformationId: any; result: any; }) => {
    // Validate user
    await validateUser(ctx, args.fakeAuthToken);
    
    // Get the transformation
    const transformation = await ctx.db.get(args.transformationId);
    
    if (!transformation) {
      throw new Error("Transformation not found");
    }
    
    // Update transformation with results
    await ctx.db.patch(args.transformationId, {
      status: "complete",
      result: args.result,
      completedAt: getCurrentTimestamp(),
    });
    
    return { success: true };
  },
}); 