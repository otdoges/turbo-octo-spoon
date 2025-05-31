/**
 * Server-side proxy for DeepSeek API
 * This keeps the OpenRouter API key secure on the server
 */

import { isRateLimited, getRateLimitInfo } from './utils/rateLimit.js';

// Get API key from environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "deepseek/deepseek-r1-0528-qwen3-8b:free";

// Rate limit options - more strict for AI endpoints
const RATE_LIMIT_OPTIONS = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5 // 5 requests per minute
};

// Validation function for request body
function validateRequest(body) {
  if (!body.prompt) {
    throw new Error('Prompt is required');
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get client IP for rate limiting
  const clientIp = 
    req.headers['x-forwarded-for'] || 
    req.connection.remoteAddress || 
    'unknown';

  // Check rate limit
  if (isRateLimited(clientIp, RATE_LIMIT_OPTIONS)) {
    const rateLimitInfo = getRateLimitInfo(clientIp, RATE_LIMIT_OPTIONS);
    const resetTime = new Date(rateLimitInfo.resetTime).toISOString();
    
    return res.status(429).json({ 
      error: 'Too many requests',
      resetTime,
      message: 'Please try again later'
    });
  }

  try {
    const { prompt, context, system_prompt } = req.body;

    // Validate the request
    try {
      validateRequest(req.body);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    // Check if API key is configured
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Prepare the request to OpenRouter
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": req.headers.origin || 'https://app.example.com',
        "X-Title": "LuminaWeb AI Team",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": MODEL,
        "messages": [
          {
            "role": "system",
            "content": system_prompt
          },
          {
            "role": "user",
            "content": `${prompt}${context ? `\n\nAdditional context: ${context}` : ''}`
          }
        ],
        "temperature": 0.5,
        "max_tokens": 1500
      })
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${openRouterResponse.status}: Failed to get response from OpenRouter`);
    }

    const data = await openRouterResponse.json();
    const content = data.choices[0].message.content;
    
    // Parse the response to extract thinking and recommendation
    const thinkingMatch = content.match(/THINKING:([\s\S]*?)(?=RECOMMENDATION:|$)/i);
    const recommendationMatch = content.match(/RECOMMENDATION:([\s\S]*?)$/i);
    
    // Add rate limit headers to response
    const rateLimitInfo = getRateLimitInfo(clientIp, RATE_LIMIT_OPTIONS);
    res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitInfo.resetTime).toISOString());
    
    // Return parsed results to the client
    return res.status(200).json({
      thinking: thinkingMatch ? thinkingMatch[1].trim() : "No thinking process provided",
      recommendation: recommendationMatch ? recommendationMatch[1].trim() : "No recommendation provided"
    });
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
} 