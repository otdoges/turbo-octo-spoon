// DeepSeek R1 service for providing thinking capabilities
// This serves as the "thinking brain" for our collaborative AI system

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = "deepseek/deepseek-r1-0528-qwen3-8b:free";

if (!OPENROUTER_API_KEY) {
  console.error('OpenRouter API key is missing. Please check your .env file.');
}

interface ThinkingResponse {
  thinking: string;
  recommendation: string;
}

/**
 * Requests DeepSeek R1 to think about a problem and generate recommendations
 * @param prompt The problem to think about
 * @param context Additional context for the thinking process
 * @returns The thinking process and recommendations
 */
export const generateThinking = async (prompt: string, context?: string): Promise<ThinkingResponse> => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "LuminaWeb AI Team",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": MODEL,
        "messages": [
          {
            "role": "system",
            "content": "You are the thinking brain of an AI team of engineers. Your job is to carefully analyze problems and generate structured thinking about website design, content, SEO, and conversion. Structure your response in two parts: THINKING and RECOMMENDATION. In THINKING, show detailed analysis. In RECOMMENDATION, provide clear actionable advice for implementation."
          },
          {
            "role": "user",
            "content": `${prompt}${context ? `\n\nAdditional context: ${context}` : ''}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
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
      thinking: "Error generating thinking process",
      recommendation: "Unable to provide recommendations due to an error"
    };
  }
};

export default {
  generateThinking
}; 