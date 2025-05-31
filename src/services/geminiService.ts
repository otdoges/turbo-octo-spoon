import deepseekService from './deepseekService';
import SYSTEM_PROMPTS from './imageAIPromptSystem';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to call our secure API endpoint
async function callGeminiAPI(prompt: string, model = 'gemini-2.5-flash', temperature = 0.7) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
        temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get response from Gemini API');
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// Fallback system prompts if needed
const FALLBACK_SYSTEM_PROMPTS = {
  imageAnalysis: `You are the implementation engineer in an AI team. Your colleague has already analyzed this image and provided recommendations. Use their thinking to generate the best possible analysis. Focus on being practical, specific, and actionable.`,
  contentEnhancement: `You are the content implementation specialist in an AI team. Your strategist colleague has analyzed this content and provided recommendations. Use their insights to produce the best possible content enhancement. Focus on specific improvements and maintain the original voice.`,
  seoAnalysis: `You are the SEO implementation engineer in an AI team. Your strategy colleague has analyzed this website data and provided initial recommendations. Use their insights to deliver concrete, actionable SEO improvements with step-by-step guidance.`,
  conversionOptimization: `You are the conversion optimization implementation specialist in an AI team. Your UX strategist colleague has analyzed this user flow and provided recommendations. Transform their insights into specific, practical conversion improvements that can be implemented right away.`
};

// Thinking prompts for DeepSeek R1
const THINKING_PROMPTS = {
  imageAnalysis: SYSTEM_PROMPTS.IMAGE_ANALYSIS_PROMPT.deepseek,
  contentEnhancement: SYSTEM_PROMPTS.CONTENT_ENHANCEMENT_PROMPT.deepseek,
  seoAnalysis: `I need to analyze website metadata and structure for SEO improvements. Think deeply about technical SEO issues, metadata optimizations, performance enhancements, search ranking factors, and page speed optimizations. What are the most important factors to consider?`,
  conversionOptimization: `I need to optimize user flows and conversion rates. Think deeply about friction points, A/B testing ideas, form field improvements, UI adjustments, and best practices from e-commerce and SaaS. What approaches would be most effective?`
};

// Convert image to base64 for API
const imageToBase64 = async (image: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(image);
  });
};

// Image Analysis Model with thinking from DeepSeek
export const analyzeWebsiteImage = async (image: File, websiteUrl?: string) => {
  try {
    // First, get thinking from DeepSeek R1
    const context = websiteUrl ? `The website URL is: ${websiteUrl}` : undefined;
    const thinking = await deepseekService.generateThinking(THINKING_PROMPTS.imageAnalysis, context);
    
    // Convert image to base64
    const base64Image = await imageToBase64(image);
    
    // Prepare the prompt for Gemini
    const prompt = `${SYSTEM_PROMPTS.IMAGE_ANALYSIS_PROMPT.gemini}

Here's what our strategy team thought about this analysis:

Thinking process:
${thinking.thinking}

Recommendations:
${thinking.recommendation}

Now, analyze this screenshot${websiteUrl ? ` of ${websiteUrl}` : ''} using these insights. The image is attached as base64.`;

    // Call our secure API endpoint
    const analysis = await callGeminiAPI(prompt);
    
    return {
      analysis,
      thinking: thinking.thinking,
      recommendation: thinking.recommendation
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze website image');
  }
};

// Content Enhancement Model with thinking from DeepSeek
export const enhanceContent = async (content: string, targetAudience?: string) => {
  try {
    // First, get thinking from DeepSeek R1
    const context = `Content to enhance: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}${targetAudience ? `\nTarget audience: ${targetAudience}` : ''}`;
    const thinking = await deepseekService.generateThinking(THINKING_PROMPTS.contentEnhancement, context);
    
    // Prepare the prompt for Gemini
    const prompt = `${SYSTEM_PROMPTS.CONTENT_ENHANCEMENT_PROMPT.gemini}

Here's what our content strategy team thought about this enhancement:

Thinking process:
${thinking.thinking}

Recommendations:
${thinking.recommendation}

Now, enhance the following content${targetAudience ? ` for ${targetAudience}` : ''} using these insights:

${content}`;

    // Call our secure API endpoint
    const enhancement = await callGeminiAPI(prompt);
    
    return {
      enhancement,
      thinking: thinking.thinking,
      recommendation: thinking.recommendation
    };
  } catch (error) {
    console.error('Error enhancing content:', error);
    throw new Error('Failed to enhance content');
  }
};

// SEO Analysis Model with thinking from DeepSeek
export const analyzeSEO = async (metadata: Record<string, unknown>, content?: string) => {
  try {
    // First, get thinking from DeepSeek R1
    const metadataString = JSON.stringify(metadata, null, 2);
    const context = `Metadata: ${metadataString}${content ? `\nContent excerpt: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}` : ''}`;
    const thinking = await deepseekService.generateThinking(THINKING_PROMPTS.seoAnalysis, context);
    
    // Prepare the prompt for Gemini
    const prompt = `${FALLBACK_SYSTEM_PROMPTS.seoAnalysis}

Here's what our SEO strategy team thought about this analysis:

Thinking process:
${thinking.thinking}

Recommendations:
${thinking.recommendation}

Now, analyze the following website metadata and provide implementation steps using these insights:

${metadataString}${content ? `\n\nContent:\n${content}` : ''}`;

    // Call our secure API endpoint
    const analysis = await callGeminiAPI(prompt);
    
    return {
      analysis,
      thinking: thinking.thinking,
      recommendation: thinking.recommendation
    };
  } catch (error) {
    console.error('Error analyzing SEO:', error);
    throw new Error('Failed to analyze SEO');
  }
};

// Conversion Optimization Model with thinking from DeepSeek
export const optimizeConversion = async (userFlow: string, conversionData?: Record<string, unknown>) => {
  try {
    // First, get thinking from DeepSeek R1
    const conversionDataString = conversionData ? JSON.stringify(conversionData, null, 2) : '';
    const context = `User flow: ${userFlow}${conversionDataString ? `\nConversion data: ${conversionDataString}` : ''}`;
    const thinking = await deepseekService.generateThinking(THINKING_PROMPTS.conversionOptimization, context);
    
    // Prepare the prompt for Gemini
    const prompt = `${FALLBACK_SYSTEM_PROMPTS.conversionOptimization}

Here's what our UX strategy team thought about this optimization:

Thinking process:
${thinking.thinking}

Recommendations:
${thinking.recommendation}

Now, analyze the following user flow and provide implementation steps using these insights:

${userFlow}${conversionDataString ? `\n\nConversion Data:\n${conversionDataString}` : ''}`;

    // Call our secure API endpoint
    const optimization = await callGeminiAPI(prompt);
    
    return {
      optimization,
      thinking: thinking.thinking,
      recommendation: thinking.recommendation
    };
  } catch (error) {
    console.error('Error optimizing conversion:', error);
    throw new Error('Failed to optimize conversion');
  }
};

// Export all functions
export default {
  analyzeWebsiteImage,
  enhanceContent,
  analyzeSEO,
  optimizeConversion
};