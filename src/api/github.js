/**
 * Server-side proxy for GitHub AI API
 * This keeps the GitHub token secure on the server
 */

import { isRateLimited, getRateLimitInfo } from './utils/rateLimit.js';
import OpenAI from 'openai';

// Get GitHub token from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_AI_ENDPOINT = "https://models.github.ai/inference";

// GitHub AI models
const GITHUB_MODELS = {
  MINI: "openai/o4-mini",
  ADVANCED: "openai/gpt-4.1"
};

// Rate limit options - more strict for AI endpoints
const RATE_LIMIT_OPTIONS = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5 // 5 requests per minute
};

// Initialize OpenAI client with GitHub AI endpoint
const createClient = () => {
  if (!GITHUB_TOKEN) return null;
  
  return new OpenAI({ 
    baseURL: GITHUB_AI_ENDPOINT, 
    apiKey: GITHUB_TOKEN
  });
};

// Function to validate the request body
function validateRequest(body) {
  if (!body.messages && !body.prompt) {
    throw new Error('Messages or prompt is required');
  }
  
  if (body.type && !['analyze', 'implement', 'refactor', 'security', 'review', 'test', 'chat'].includes(body.type)) {
    throw new Error('Invalid request type');
  }
}

/**
 * Handles GitHub AI API requests
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
    // Validate the request
    try {
      validateRequest(req.body);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Create the client
    const client = createClient();
    if (!client) {
      return res.status(500).json({ error: 'GitHub token not configured' });
    }
    
    const { 
      type, 
      messages, 
      prompt,
      code,
      errorMessage,
      description,
      context,
      goals,
      requirements,
      testFramework,
      language = 'typescript',
      useAdvancedModel = false
    } = req.body;
    
    // Determine which model to use
    const modelName = useAdvancedModel ? GITHUB_MODELS.ADVANCED : GITHUB_MODELS.MINI;
    
    // Prepare messages based on request type
    let requestMessages = [];
    
    if (messages) {
      // Direct chat mode with provided messages
      requestMessages = messages.map(msg => {
        if (msg.role === 'user') {
          return { role: 'user', content: msg.content };
        } else if (msg.role === 'assistant') {
          return { role: 'assistant', content: msg.content };
        } else {
          return { 
            role: 'user', 
            content: msg.role === 'system' 
              ? `[As an AI developer]: ${msg.content}` 
              : msg.content 
          };
        }
      });
    } else {
      // Specific task types
      switch (type) {
        case 'analyze':
          requestMessages = [
            { 
              role: "developer", 
              content: `You are an expert software engineer specializing in fixing ${language} errors. Your task is to analyze code errors, explain the root cause, and provide corrected code.`
            },
            { 
              role: "user", 
              content: `I'm getting the following error in my ${language} code:\n\n${errorMessage}\n\nHere's the code:\n\n\`\`\`${language}\n${code}\n\`\`\``
            }
          ];
          break;
          
        case 'implement':
          requestMessages = [
            { 
              role: "developer", 
              content: `You are an expert ${language} developer. Create clean, well-structured, and efficient code based on requirements.`
            },
            { 
              role: "user", 
              content: `I need to implement the following functionality in ${language}:\n\n${description}${context ? `\n\nAdditional context:\n${context}` : ''}`
            }
          ];
          break;
          
        case 'refactor':
          requestMessages = [
            { 
              role: "developer", 
              content: `You are an expert ${language} developer specializing in code refactoring. Your task is to improve code quality, readability, and performance.`
            },
            { 
              role: "user", 
              content: `I need to refactor the following ${language} code with these goals: ${goals}\n\n\`\`\`${language}\n${code}\n\`\`\``
            }
          ];
          break;
          
        case 'security':
          requestMessages = [
            { 
              role: "developer", 
              content: `You are a security expert specializing in identifying vulnerabilities in ${language} code. Analyze code for security issues and provide recommendations.`
            },
            { 
              role: "user", 
              content: `Please analyze this ${language} code for security vulnerabilities:\n\n\`\`\`${language}\n${code}\n\`\`\``
            }
          ];
          break;
          
        case 'review':
          requestMessages = [
            { 
              role: "developer", 
              content: `You are an expert code reviewer with extensive experience in ${language}. Provide thorough, constructive feedback on code quality, performance, and adherence to requirements.`
            },
            { 
              role: "user", 
              content: `Please review this ${language} code${requirements ? ` against these requirements: ${requirements}` : ''}:\n\n\`\`\`${language}\n${code}\n\`\`\``
            }
          ];
          break;
          
        case 'test':
          requestMessages = [
            { 
              role: "developer", 
              content: `You are an expert in writing unit tests using ${testFramework} for ${language} code. Create comprehensive tests that cover all functionality, edge cases, and ensure high code coverage.`
            },
            { 
              role: "user", 
              content: `Please generate unit tests using ${testFramework} for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
            }
          ];
          break;
          
        default:
          // Generic prompt
          requestMessages = [
            { 
              role: "developer", 
              content: `You are an expert software developer specializing in ${language}.`
            },
            { 
              role: "user", 
              content: prompt
            }
          ];
      }
    }

    // Call GitHub AI API
    const response = await client.chat.completions.create({
      messages: requestMessages,
      model: modelName
    });

    // Add rate limit headers to response
    const rateLimitInfo = getRateLimitInfo(clientIp, RATE_LIMIT_OPTIONS);
    res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitInfo.resetTime).toISOString());

    // Return the response
    res.status(200).json({ 
      result: response.choices[0].message.content || "No response generated" 
    });
  } catch (error) {
    console.error('Error calling GitHub AI API:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
} 