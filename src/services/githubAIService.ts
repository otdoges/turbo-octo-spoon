// Remove the dotenv import as it's a server-side package
// The environment variables should be handled through Vite's define config

// Base API URL for server endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Available models
export const GITHUB_MODELS = {
  MINI: "openai/o4-mini",
  ADVANCED: "openai/gpt-4.1"
};

// Helper function to call our secure API endpoint
async function callGitHubAPI(data: Record<string, unknown>): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/github`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get response from GitHub AI API');
    }

    const responseData = await response.json();
    return responseData.result;
  } catch (error) {
    console.error('Error calling GitHub AI API:', error);
    throw error;
  }
}

/**
 * Error analysis and suggestion generation
 */
export const analyzeCodeError = async (
  code: string,
  errorMessage: string,
  language: string = 'javascript',
  useAdvancedModel: boolean = false
): Promise<string> => {
  try {
    return await callGitHubAPI({
      type: 'analyze',
      code,
      errorMessage,
      language,
      useAdvancedModel
    });
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
  language: string = 'typescript',
  useAdvancedModel: boolean = false
): Promise<string> => {
  try {
    return await callGitHubAPI({
      type: 'implement',
      description,
      context,
      language,
      useAdvancedModel
    });
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
  language: string = 'typescript',
  useAdvancedModel: boolean = false
): Promise<string> => {
  try {
    return await callGitHubAPI({
      type: 'refactor',
      code,
      goals,
      language,
      useAdvancedModel
    });
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
  language: string = 'typescript',
  useAdvancedModel: boolean = false
): Promise<string> => {
  try {
    return await callGitHubAPI({
      type: 'security',
      code,
      language,
      useAdvancedModel
    });
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
  language: string = 'typescript',
  useAdvancedModel: boolean = false
): Promise<string> => {
  try {
    return await callGitHubAPI({
      type: 'review',
      code,
      requirements,
      language,
      useAdvancedModel
    });
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
  language: string = 'typescript',
  useAdvancedModel: boolean = false
): Promise<string> => {
  try {
    return await callGitHubAPI({
      type: 'test',
      code,
      testFramework,
      language,
      useAdvancedModel
    });
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
  try {
    return await callGitHubAPI({
      type: 'chat',
      messages,
      useAdvancedModel
    });
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
  chatWithAI,
  GITHUB_MODELS
}; 