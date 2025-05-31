import { randomBytes } from "crypto";

/**
 * Generate a random token for fake authentication.
 * In a real app, this would be replaced with proper JWT or session tokens.
 */
export function generateRandomToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Helper to validate if a user is authenticated
 */
export async function validateUser(ctx: any, fakeAuthToken: string) {
  if (!fakeAuthToken) {
    throw new Error("Authentication required");
  }

  const users = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("fakeAuthToken"), fakeAuthToken))
    .collect();

  if (users.length === 0) {
    throw new Error("Invalid authentication");
  }

  return users[0];
}

/**
 * Get the current timestamp
 */
export function getCurrentTimestamp(): number {
  return Date.now();
} 