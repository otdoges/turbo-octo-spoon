// DeepSeek R1 service for providing thinking capabilities
// This serves as the "thinking brain" for our collaborative AI system

// Get API key from environment variables - never hardcoded
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const MODEL = "deepseek/deepseek-r1-0528-qwen3-8b:free";

if (!OPENROUTER_API_KEY) {
  console.error('OpenRouter API key is missing. Please check your .env file.');
}

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
 * Requests DeepSeek R1 to think about a problem and generate recommendations
 * @param prompt The problem to think about
 * @param context Additional context for the thinking process
 * @returns The thinking process and recommendations
 */
export const generateThinking = async (prompt: string, context?: string): Promise<ThinkingResponse> => {
  try {
    // Use the host origin or a fallback
    const hostOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://app.example.com';
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": hostOrigin,
        "X-Title": "LuminaWeb AI Team",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": MODEL,
        "messages": [
          {
            "role": "system",
            "content": SYSTEM_PROMPT
          },
          {
            "role": "user",
            "content": `${prompt}${context ? `\n\nAdditional context: ${context}` : ''}`
          }
        ],
        "temperature": 0.5, // Lower temperature for more focused thinking
        "max_tokens": 1500  // Ensure we get comprehensive thinking
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`OpenRouter API error ${response.status}: ${errorData ? JSON.stringify(errorData) : response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the response to extract thinking and recommendation
    const thinkingMatch = content.match(/THINKING:([\s\S]*?)(?=RECOMMENDATION:|$)/i);
    const recommendationMatch = content.match(/RECOMMENDATION:([\s\S]*?)$/i);
    
    return {
      thinking: thinkingMatch ? thinkingMatch[1].trim() : "No thinking process provided",
      recommendation: recommendationMatch ? recommendationMatch[1].trim() : "No recommendation provided"
    };
  } catch (error) {
    console.error("Error generating thinking:", error);
    return {
      thinking: "Error generating thinking process. Please check your API key and connection.",
      recommendation: "Unable to provide recommendations due to an error. Please try again later."
    };
  }
};

export default {
  generateThinking
}; 