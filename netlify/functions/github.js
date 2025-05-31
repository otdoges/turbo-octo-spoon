/**
 * Server-side proxy for GitHub AI API
 * This keeps the GitHub token secure on the server
 */

// Get GitHub token from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_AI_ENDPOINT = "https://models.github.ai/inference";

// GitHub AI models
const GITHUB_MODELS = {
  MINI: "openai/o4-mini",
  ADVANCED: "openai/gpt-4.1"
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
    
    // Validate the request
    try {
      validateRequest(body);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      };
    }
    
    // Check if GitHub token is configured
    if (!GITHUB_TOKEN) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'GitHub token not configured' })
      };
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
    } = body;
    
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
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ 
      baseURL: GITHUB_AI_ENDPOINT, 
      apiKey: GITHUB_TOKEN
    });
    
    const response = await client.chat.completions.create({
      messages: requestMessages,
      model: modelName
    });

    // Return the response
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        result: response.choices[0].message.content || "No response generated" 
      }),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    };
  } catch (error) {
    console.error('Error calling GitHub AI API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process request',
        details: error.message 
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
}; 