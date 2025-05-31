import OpenAI from "openai";
import 'dotenv/config';

// Get GitHub token from environment variables - never hardcoded
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
const GITHUB_AI_ENDPOINT = "https://models.github.ai/inference";
const DEFAULT_MODEL = "openai/o4-mini"; // Default model, can be changed for different use cases

// Check if token is available
if (!GITHUB_TOKEN) {
  console.error('GitHub token is missing. Please check your .env file and ensure you have added GITHUB_TOKEN with models:read permissions.');
}

// Initialize OpenAI client with GitHub AI endpoint
const createClient = () => {
  if (!GITHUB_TOKEN) return null;
  
  return new OpenAI({ 
    baseURL: GITHUB_AI_ENDPOINT, 
    apiKey: GITHUB_TOKEN
  });
};


/**
 * Error analysis and suggestion generation
 */
export const analyzeCodeError = async (
  code: string,
  errorMessage: string,
  language: string = 'javascript'
): Promise<string> => {
  const client = createClient();
  if (!client) {
    return "Unable to analyze error: GitHub token not configured";
  }

  try {
    const response = await client.chat.completions.create({
      messages: [
        { 
          role: "developer", 
          content: `You are an expert software engineer specializing in fixing ${language} errors. Your task is to analyze code errors, explain the root cause, and provide corrected code.`
        },
        { 
          role: "user", 
          content: `I'm getting the following error in my ${language} code:\n\n${errorMessage}\n\nHere's the code:\n\n\`\`\`${language}\n${code}\n\`\`\``
        }
      ],
      model: DEFAULT_MODEL
    });

    return response.choices[0].message.content || "No analysis returned";
  } catch (error) {
    console.error("Error analyzing code:", error);
    return `Error analyzing code: ${error instanceof Error ? error.message : String(error)}`;
  }
};

/**
 * Generate code implementation from description
 */
export const generateImplementation = async (
  description: string,
  context: string = '',
  language: string = 'typescript'
): Promise<string> => {
  const client = createClient();
  if (!client) {
    return "Unable to generate implementation: GitHub token not configured";
  }

  try {
    const response = await client.chat.completions.create({
      messages: [
        { 
          role: "developer", 
          content: `You are an expert ${language} developer. Create clean, well-structured, and efficient code based on requirements.`
        },
        { 
          role: "user", 
          content: `I need to implement the following functionality in ${language}:\n\n${description}${context ? `\n\nAdditional context:\n${context}` : ''}`
        }
      ],
      model: DEFAULT_MODEL
    });

    return response.choices[0].message.content || "No implementation generated";
  } catch (error) {
    console.error("Error generating implementation:", error);
    return `Error generating implementation: ${error instanceof Error ? error.message : String(error)}`;
  }
};

/**
 * Refactor code for improvement
 */
export const refactorCode = async (
  code: string,
  goals: string,
  language: string = 'typescript'
): Promise<string> => {
  const client = createClient();
  if (!client) {
    return "Unable to refactor code: GitHub token not configured";
  }

  try {
    const response = await client.chat.completions.create({
      messages: [
        { 
          role: "developer", 
          content: `You are an expert ${language} developer specializing in code refactoring. Your task is to improve code quality, readability, and performance.`
        },
        { 
          role: "user", 
          content: `I need to refactor the following ${language} code with these goals: ${goals}\n\n\`\`\`${language}\n${code}\n\`\`\``
        }
      ],
      model: DEFAULT_MODEL
    });

    return response.choices[0].message.content || "No refactoring suggestions returned";
  } catch (error) {
    console.error("Error refactoring code:", error);
    return `Error refactoring code: ${error instanceof Error ? error.message : String(error)}`;
  }
};

/**
 * Analyze code for security vulnerabilities
 */
export const analyzeCodeSecurity = async (
  code: string,
  language: string = 'typescript'
): Promise<string> => {
  const client = createClient();
  if (!client) {
    return "Unable to analyze code security: GitHub token not configured";
  }

  try {
    const response = await client.chat.completions.create({
      messages: [
        { 
          role: "developer", 
          content: `You are a security expert specializing in identifying vulnerabilities in ${language} code. Analyze code for security issues and provide recommendations.`
        },
        { 
          role: "user", 
          content: `Please analyze this ${language} code for security vulnerabilities:\n\n\`\`\`${language}\n${code}\n\`\`\``
        }
      ],
      model: DEFAULT_MODEL
    });

    return response.choices[0].message.content || "No security analysis returned";
  } catch (error) {
    console.error("Error analyzing code security:", error);
    return `Error analyzing security: ${error instanceof Error ? error.message : String(error)}`;
  }
};

/**
 * Code review assistant
 */
export const reviewCode = async (
  code: string,
  requirements: string = '',
  language: string = 'typescript'
): Promise<string> => {
  const client = createClient();
  if (!client) {
    return "Unable to review code: GitHub token not configured";
  }

  try {
    const response = await client.chat.completions.create({
      messages: [
        { 
          role: "developer", 
          content: `You are an expert code reviewer with extensive experience in ${language}. Provide thorough, constructive feedback on code quality, performance, and adherence to requirements.`
        },
        { 
          role: "user", 
          content: `Please review this ${language} code${requirements ? ` against these requirements: ${requirements}` : ''}:\n\n\`\`\`${language}\n${code}\n\`\`\``
        }
      ],
      model: DEFAULT_MODEL
    });

    return response.choices[0].message.content || "No review returned";
  } catch (error) {
    console.error("Error reviewing code:", error);
    return `Error reviewing code: ${error instanceof Error ? error.message : String(error)}`;
  }
};

/**
 * Generate unit tests
 */
export const generateTests = async (
  code: string,
  testFramework: string = 'jest',
  language: string = 'typescript'
): Promise<string> => {
  const client = createClient();
  if (!client) {
    return "Unable to generate tests: GitHub token not configured";
  }

  try {
    const response = await client.chat.completions.create({
      messages: [
        { 
          role: "developer", 
          content: `You are an expert in writing unit tests using ${testFramework} for ${language} code. Create comprehensive tests that cover all functionality, edge cases, and ensure high code coverage.`
        },
        { 
          role: "user", 
          content: `Please generate unit tests using ${testFramework} for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
        }
      ],
      model: DEFAULT_MODEL
    });

    return response.choices[0].message.content || "No tests generated";
  } catch (error) {
    console.error("Error generating tests:", error);
    return `Error generating tests: ${error instanceof Error ? error.message : String(error)}`;
  }
};

/**
 * Chat with an AI assistant about code
 */
export const chatWithAI = async (
  messages: Array<{role: string, content: string}>,
  useAdvancedModel: boolean = false
): Promise<string> => {
  const client = createClient();
  if (!client) {
    return "Unable to chat: GitHub token not configured";
  }

  // Use more advanced model if requested
  const modelName = useAdvancedModel ? "openai/gpt-4.1" : DEFAULT_MODEL;

  try {
    // Format messages properly for the API with correct typing
    const formattedMessages = messages.map(msg => {
      // For GitHub's API, valid roles are 'user', 'assistant', or 'system'
      // For 'system', we map to 'user' with a special prefix
      if (msg.role === 'user') {
        return { role: 'user' as const, content: msg.content };
      } else if (msg.role === 'assistant') {
        return { role: 'assistant' as const, content: msg.content };
      } else {
        // For system or any other role, map to user with a prefix
        return { 
          role: 'user' as const, 
          content: msg.role === 'system' 
            ? `[As an AI developer]: ${msg.content}` 
            : msg.content 
        };
      }
    });

    const response = await client.chat.completions.create({
      messages: formattedMessages,
      model: modelName
    });

    return response.choices[0].message.content || "No response generated";
  } catch (error) {
    console.error("Error chatting with AI:", error);
    return `Error chatting with AI: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export default {
  analyzeCodeError,
  generateImplementation,
  refactorCode,
  analyzeCodeSecurity,
  reviewCode,
  generateTests,
  chatWithAI
}; 