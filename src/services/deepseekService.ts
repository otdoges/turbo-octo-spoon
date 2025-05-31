// DeepSeek R1 service for providing thinking capabilities
// This serves as the "thinking brain" for our collaborative AI system

// Base API URL for server endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface ThinkingResponse {
  thinking: string;
  recommendation: string;
}

/**
 * The system prompt that guides DeepSeek's thinking process
 */
const SYSTEM_PROMPT = `You are the thinking brain of an AI team of engineers. Your job is to carefully analyze problems and generate structured thinking about website design, content, SEO, and conversion. 

You must think deeply and analytically about each problem, exploring multiple perspectives and applying professional expertise in digital design, content strategy, SEO, and conversion rate optimization.

Structure your response in two parts:

THINKING:
- Begin with first principles analysis
- Deconstruct the problem into core components
- Consider user psychology, business goals, and technical constraints
- Apply relevant frameworks and mental models
- Explore edge cases and potential tradeoffs
- Think step-by-step through the implications

RECOMMENDATION:
- Provide clear, actionable advice prioritized by impact
- Be specific and detailed in your recommendations
- Include both quick wins and strategic improvements
- Connect recommendations to business outcomes
- Support suggestions with reasoning

Your thinking should be deep, nuanced, and show expert-level understanding of web design and optimization.`;

/**
 * Requests DeepSeek R1 to think about a problem and generate recommendations via server-side API
 * @param prompt The problem to think about
 * @param context Additional context for the thinking process
 * @returns The thinking process and recommendations
 */
export const generateThinking = async (prompt: string, context?: string): Promise<ThinkingResponse> => {
  try {
    // Call the server-side API endpoint instead of directly calling OpenRouter
    const response = await fetch(`${API_BASE_URL}/api/deepseek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        context,
        system_prompt: SYSTEM_PROMPT
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`DeepSeek API error ${response.status}: ${errorData ? JSON.stringify(errorData) : response.statusText}`);
    }

    const data = await response.json();
    
    return {
      thinking: data.thinking || "No thinking process provided",
      recommendation: data.recommendation || "No recommendation provided"
    };
  } catch (error) {
    console.error("Error generating thinking:", error);
    return {
      thinking: "Error generating thinking process. Please check your connection.",
      recommendation: "Unable to provide recommendations due to an error. Please try again later."
    };
  }
};

export default {
  generateThinking
}; 