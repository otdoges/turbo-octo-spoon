import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table to store user information
  users: defineTable({
    name: v.string(),
    email: v.string(),
    // Store auth information - this would be replaced with a proper auth system later
    fakeAuthToken: v.string(),
    createdAt: v.number(),
    lastLogin: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // Screenshots table to store metadata about screenshots
  screenshots: defineTable({
    userId: v.id("users"),
    url: v.optional(v.string()), // Original URL if screenshot was taken via URL
    imageUrl: v.string(), // URL or path to the screenshot image
    fileId: v.optional(v.string()), // For temporary file storage
    accessToken: v.optional(v.string()), // Token for accessing the file
    expiresAt: v.optional(v.number()), // When the file will expire
    status: v.string(), // "pending", "complete", "failed"
    createdAt: v.number(),
    metadata: v.optional(v.object({
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      format: v.optional(v.string()),
      size: v.optional(v.number()), // Size in bytes
    })),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // Analyses table to store AI analysis results
  analyses: defineTable({
    screenshotId: v.id("screenshots"),
    userId: v.id("users"),
    status: v.string(), // "pending", "complete", "failed"
    result: v.optional(v.object({
      colorPalette: v.array(v.string()),
      style: v.optional(v.string()),
      layout: v.optional(v.string()),
      elements: v.optional(v.object({
        header: v.optional(v.object({
          position: v.optional(v.string()),
          style: v.optional(v.string()),
        })),
        navigation: v.optional(v.object({
          type: v.optional(v.string()),
          items: v.optional(v.number()),
        })),
        footer: v.optional(v.object({
          size: v.optional(v.string()),
        })),
      })),
      recommendations: v.optional(v.object({
        colorAdjustments: v.optional(v.string()),
        layoutImprovements: v.optional(v.string()),
        typographyChanges: v.optional(v.string()),
      })),
    })),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_screenshotId", ["screenshotId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // Transformations table to store website transformations
  transformations: defineTable({
    analysisId: v.id("analyses"),
    screenshotId: v.id("screenshots"),
    userId: v.id("users"),
    status: v.string(), // "pending", "in_progress", "complete", "failed"
    style: v.optional(v.string()), // Selected style for transformation
    result: v.optional(v.object({
      transformedImageUrl: v.optional(v.string()),
      htmlCode: v.optional(v.string()),
      cssCode: v.optional(v.string()),
    })),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_analysisId", ["analysisId"]),
}); 