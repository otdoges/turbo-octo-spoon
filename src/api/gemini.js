import { GoogleGenerativeAI } from '@google/generative-ai';
import { isRateLimited, getRateLimitInfo } from './utils/rateLimit.js';

// Initialize Google's Generative AI with the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Rate limit options - more strict for AI endpoints
const RATE_LIMIT_OPTIONS = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5 // 5 requests per minute
};

// Function to validate the request body
function validateRequest(body) {
  if (!body.prompt) {
    throw new Error('Prompt is required');
  }

  if (body.image) {
    if (!body.image.data || !body.image.mimeType) {
      throw new Error('Image data and mimeType are required when providing an image');
    }
  }
}

/**
 * Handles Gemini API requests
 * @param {Request} req - The incoming request
 * @param {Response} res - The response object
 */
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
    const { prompt, model = 'gemini-2.5-flash', temperature = 0.7, image } = req.body;

    // Validate the request
    try {
      validateRequest(req.body);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    // Check if API key is configured
    if (!API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Get the appropriate model
    const genAIModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: { temperature }
    });

    // Prepare the parts array with text and optional image
    const parts = [{ text: prompt }];
    
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
    const rateLimitInfo = getRateLimitInfo(clientIp, RATE_LIMIT_OPTIONS);
    res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitInfo.resetTime).toISOString());

    res.status(200).json({ result: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}
