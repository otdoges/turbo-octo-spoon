import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google's Generative AI with the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;

// Simple in-memory rate limiting
const rateLimits: Record<string, {count: number, resetTime: number}> = {};

const RATE_LIMIT_OPTIONS = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5 // 5 requests per minute
};

// Function to check if a client is rate limited
function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  
  // Initialize rate limit entry for new clients
  if (!rateLimits[clientIp]) {
    rateLimits[clientIp] = {
      count: 1,
      resetTime: now + RATE_LIMIT_OPTIONS.windowMs
    };
    return false;
  }
  
  const clientLimit = rateLimits[clientIp];
  
  // Reset counter if window has expired
  if (now > clientLimit.resetTime) {
    clientLimit.count = 1;
    clientLimit.resetTime = now + RATE_LIMIT_OPTIONS.windowMs;
    return false;
  }
  
  // Check if limit exceeded
  if (clientLimit.count >= RATE_LIMIT_OPTIONS.maxRequests) {
    return true;
  }
  
  // Increment counter
  clientLimit.count++;
  return false;
}

// Function to get rate limit info
function getRateLimitInfo(clientIp: string) {
  if (!rateLimits[clientIp]) {
    return {
      remaining: RATE_LIMIT_OPTIONS.maxRequests,
      resetTime: Date.now() + RATE_LIMIT_OPTIONS.windowMs
    };
  }
  
  return {
    remaining: Math.max(0, RATE_LIMIT_OPTIONS.maxRequests - rateLimits[clientIp].count),
    resetTime: rateLimits[clientIp].resetTime
  };
}

// Function to validate the request body
function validateRequest(body: any ) {
  if (!body.prompt) {
    throw new Error('Prompt is required');
  }

  if (body.image) {
    if (!body.image.data || !body.image.mimeType) {
      throw new Error('Image data and mimeType are required when providing an image');
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get client IP for rate limiting
  const clientIp = 
    (req.headers['x-forwarded-for'] as string) || 
    '127.0.0.1';

  // Check rate limit
  if (isRateLimited(clientIp)) {
    const rateLimitInfo = getRateLimitInfo(clientIp);
    const resetTime = new Date(rateLimitInfo.resetTime).toISOString();
    
    return res.status(429).json({ 
      error: 'Too many requests',
      resetTime,
      message: 'Please try again later'
    });
  }

  try {
    const { prompt, model = 'gemini-2.5-flash', temperature = 0.7, image } = req.body;

    // Validate the request
    try {
      validateRequest(req.body);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }

    // Check if API key is configured
    if (!API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    // Get the appropriate model
    const genAIModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: { temperature }
    });

    // Prepare the parts array with text and optional image
    const parts: any[] = [{ text: prompt }];
    
    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }

    // Generate content
    const result = await genAIModel.generateContent({
      contents: [
        {
          role: 'user',
          parts,
        },
      ]
    });

    // Extract and return the response
    const response = await result.response;
    const text = response.text();
    
    // Add rate limit headers to response
    const rateLimitInfo = getRateLimitInfo(clientIp);
    res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitInfo.resetTime).toISOString());

    res.status(200).json({ result: text });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}
