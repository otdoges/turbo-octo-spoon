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

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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