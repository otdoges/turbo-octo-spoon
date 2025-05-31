/**
 * Simple rate limiting utility for API endpoints
 * Uses in-memory storage with request IP as key
 */

// Store request counts with timestamp
const requestCounts = new Map();

// Default rate limits
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 20; // Max requests per window

/**
 * Checks if a request exceeds the rate limit
 * 
 * @param {string} ip - Request IP address
 * @param {object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 * @returns {boolean} - True if rate limit exceeded
 */
export function isRateLimited(ip, options = {}) {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests || DEFAULT_MAX_REQUESTS;
  
  const now = Date.now();
  const requestData = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };
  
  // Reset counter if window has passed
  if (now > requestData.resetTime) {
    requestData.count = 1;
    requestData.resetTime = now + windowMs;
    requestCounts.set(ip, requestData);
    return false;
  }
  
  // Increment counter
  requestData.count++;
  requestCounts.set(ip, requestData);
  
  // Check if limit exceeded
  return requestData.count > maxRequests;
}

/**
 * Gets remaining requests and reset time
 * 
 * @param {string} ip - Request IP address
 * @param {object} options - Rate limiting options
 * @returns {object} - Remaining requests and reset time
 */
export function getRateLimitInfo(ip, options = {}) {
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests || DEFAULT_MAX_REQUESTS;
  
  const requestData = requestCounts.get(ip) || { count: 0, resetTime: Date.now() + windowMs };
  
  return {
    remaining: Math.max(0, maxRequests - requestData.count),
    resetTime: requestData.resetTime
  };
}

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, CLEANUP_INTERVAL);

// Export both functions
export default {
  isRateLimited,
  getRateLimitInfo
}; 