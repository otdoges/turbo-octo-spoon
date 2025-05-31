/**
 * Server-side proxy for DeepSeek API
 * This keeps the OpenRouter API key secure on the server
 */

// Get API key from environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "deepseek/deepseek-r1-0528-qwen3-8b:free";

// Validation function for request body
function validateRequest(body) {
  if (!body.prompt) {
    throw new Error('Prompt is required');
  }
}

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const { prompt, context, system_prompt } = body;

    // Validate the request
    try {
      validateRequest(body);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      };
    }

    // Check if API key is configured
    if (!OPENROUTER_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OpenRouter API key not configured' })
      };
    }

    // Prepare the request to OpenRouter
    const fetch = require('node-fetch');
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": event.headers.origin || event.headers.referer || 'https://app.example.com',
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
    
    // Return parsed results to the client
    return {
      statusCode: 200,
      body: JSON.stringify({
        thinking: thinkingMatch ? thinkingMatch[1].trim() : "No thinking process provided",
        recommendation: recommendationMatch ? recommendationMatch[1].trim() : "No recommendation provided"
      })
    };
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process request',
        details: error.message 
      })
    };
  }
}; 