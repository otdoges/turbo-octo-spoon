/**
 * Security utilities for API endpoints
 * Provides functions to detect and block suspicious requests
 */

// Suspicious patterns to detect in request payloads
const SUSPICIOUS_PATTERNS = [
  /<script>/i,                      // Basic XSS
  /javascript:/i,                   // JavaScript protocol
  /on\w+\s*=\s*['"]/i,              // Event handlers
  /SELECT.+FROM.+/i,                // SQL injection attempts
  /UNION\s+SELECT/i,                // SQL UNION attacks
  /\/etc\/passwd/i,                 // Path traversal
  /\.\.\/\.\.\/\.\.\//i,            // Directory traversal
  /(curl|wget|bash)\s+-/i,          // Command injection
  /\$\{\s*[^\s]+\s*[\(\[]/i,        // Template injection
  /__proto__\s*[:=]/i,              // Prototype pollution
  /constructor\s*[:=]/i,            // Prototype pollution
  /\beval\s*\(/i                    // Eval execution
];

// Block list for suspicious IPs (can be updated dynamically)
const BLOCKED_IPS = new Set();

/**
 * Checks if a request payload contains suspicious patterns
 * @param {object} payload - The request body or query parameters
 * @returns {boolean} - True if suspicious
 */
export function isSuspiciousPayload(payload) {
  const payloadString = JSON.stringify(payload);
  
  return SUSPICIOUS_PATTERNS.some(pattern => {
    return pattern.test(payloadString);
  });
}

/**
 * Checks if an IP address is blocked
 * @param {string} ip - The IP address to check
 * @returns {boolean} - True if IP is blocked
 */
export function isIPBlocked(ip) {
  return BLOCKED_IPS.has(ip);
}

/**
 * Blocks an IP address
 * @param {string} ip - The IP address to block
 */
export function blockIP(ip) {
  BLOCKED_IPS.add(ip);
  console.warn(`Blocked suspicious IP: ${ip}`);
}

/**
 * Unblocks an IP address
 * @param {string} ip - The IP address to unblock
 */
export function unblockIP(ip) {
  BLOCKED_IPS.delete(ip);
}

/**
 * Sanitizes user input by removing potentially dangerous patterns
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
export function sanitizeUserInput(input) {
  if (typeof input !== 'string') return input;
  
  // Replace common XSS patterns
  return input
    .replace(/<(script|iframe|object|embed|form)/gi, '&lt;$1')
    .replace(/on\w+(\s*=\s*['"][^'"]*['"])/gi, 'disabled$1')
    .replace(/javascript:/gi, 'disabled:');
}

/**
 * Validates URL to ensure it's not a security risk
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is valid and safe
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.toLowerCase();
    
    // Only allow http and https protocols
    return protocol === 'http:' || protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Middleware to check for suspicious requests
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {Function} next - The next middleware function
 */
export function securityMiddleware(req, res, next) {
  // Get client IP
  const clientIp = req.headers['x-forwarded-for'] || 
                  req.connection.remoteAddress || 
                  'unknown';
  
  // Check if IP is blocked
  if (isIPBlocked(clientIp)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Check for suspicious payload in body or query
  if (isSuspiciousPayload(req.body) || isSuspiciousPayload(req.query)) {
    // Block the IP
    blockIP(clientIp);
    
    // Log the attempt
    console.warn(`Blocked suspicious request from ${clientIp}`);
    
    return res.status(403).json({ error: 'Request denied for security reasons' });
  }
  
  // Continue to next middleware
  if (typeof next === 'function') {
    next();
  }
}

export default {
  isSuspiciousPayload,
  isIPBlocked,
  blockIP,
  unblockIP,
  sanitizeUserInput,
  isValidUrl,
  securityMiddleware
}; 