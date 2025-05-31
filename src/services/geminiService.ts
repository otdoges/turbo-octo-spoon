import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';
import 'dotenv/config';
import deepseekService from './deepseekService';

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompts for different models
const SYSTEM_PROMPTS = {
  imageAnalysis: `You are the implementation engineer in an AI team. Your colleague has already analyzed this image and provided recommendations. Use their thinking to generate the best possible analysis. Focus on being practical, specific, and actionable.`,
  
  contentEnhancement: `You are the content implementation specialist in an AI team. Your strategist colleague has analyzed this content and provided recommendations. Use their insights to produce the best possible content enhancement. Focus on specific improvements and maintain the original voice.`,
  
  seoAnalysis: `You are the SEO implementation engineer in an AI team. Your strategy colleague has analyzed this website data and provided initial recommendations. Use their insights to deliver concrete, actionable SEO improvements with step-by-step guidance.`,
  
  conversionOptimization: `You are the conversion optimization implementation specialist in an AI team. Your UX strategist colleague has analyzed this user flow and provided recommendations. Transform their insights into specific, practical conversion improvements that can be implemented right away.`
};

// Thinking prompts for DeepSeek R1
const THINKING_PROMPTS = {
  imageAnalysis: `I need to analyze a website screenshot for design improvements. Think deeply about UI elements, color schemes, layout patterns, responsive design issues, modern design principles, accessibility, and user experience. What should I look for and what recommendations would be most valuable?`,
  
  contentEnhancement: `I need to analyze and enhance website content. Think deeply about clarity, engagement, SEO performance, headline improvements, call-to-action enhancements, content structure, readability, and conversion potential. What strategies would be most effective?`,
  
  seoAnalysis: `I need to analyze website metadata and structure for SEO improvements. Think deeply about technical SEO issues, metadata optimizations, performance enhancements, search ranking factors, and page speed optimizations. What are the most important factors to consider?`,
  
  conversionOptimization: `I need to optimize user flows and conversion rates. Think deeply about friction points, A/B testing ideas, form field improvements, UI adjustments, and best practices from e-commerce and SaaS. What approaches would be most effective?`
};

// Initialize models with Gemini 2.5 Flash
const MODEL_NAME = 'gemini-2.5-flash';
let imageAnalysisModel: GenerativeModel;
let contentModel: GenerativeModel;
let seoModel: GenerativeModel;
let conversionModel: GenerativeModel;

// Initialize all models
const initializeModels = () => {
  const config = { temperature: 0.7, topP: 0.95, topK: 40 };
  
  imageAnalysisModel = genAI.getGenerativeModel({ model: MODEL_NAME, ...config });
  contentModel = genAI.getGenerativeModel({ model: MODEL_NAME, ...config });
  seoModel = genAI.getGenerativeModel({ model: MODEL_NAME, ...config });
  conversionModel = genAI.getGenerativeModel({ model: MODEL_NAME, ...config });
};

// Convert image to Parts for Gemini
const imageToGenerativePart = async (image: File): Promise<Part> => {
  const buffer = await image.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(buffer).toString('base64'),
      mimeType: image.type,
    },
  };
};

// Image Analysis Model with thinking from DeepSeek
export const analyzeWebsiteImage = async (image: File, websiteUrl?: string) => {
  if (!imageAnalysisModel) initializeModels();
  
  try {
    // First, get thinking from DeepSeek R1
    const context = websiteUrl ? `The website URL is: ${websiteUrl}` : undefined;
    const thinking = await deepseekService.generateThinking(THINKING_PROMPTS.imageAnalysis, context);
    
    // Then, use Gemini with the thinking input
    const imagePart = await imageToGenerativePart(image);
    
    const result = await imageAnalysisModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_PROMPTS.imageAnalysis },
            { text: `Here's what our strategy team thought about this analysis:\n\nThinking process:\n${thinking.thinking}\n\nRecommendations:\n${thinking.recommendation}\n\nNow, analyze this screenshot${websiteUrl ? ` of ${websiteUrl}` : ''} using these insights:` },
            imagePart
          ]
        }
      ]
    });
    
    return {
      analysis: result.response.text(),
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
  if (!contentModel) initializeModels();
  
  try {
    // First, get thinking from DeepSeek R1
    const context = `Content to enhance: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}${targetAudience ? `\nTarget audience: ${targetAudience}` : ''}`;
    const thinking = await deepseekService.generateThinking(THINKING_PROMPTS.contentEnhancement, context);
    
    // Then, use Gemini with the thinking input
    const result = await contentModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_PROMPTS.contentEnhancement },
            { text: `Here's what our content strategy team thought about this enhancement:\n\nThinking process:\n${thinking.thinking}\n\nRecommendations:\n${thinking.recommendation}\n\nNow, enhance the following content${targetAudience ? ` for ${targetAudience}` : ''} using these insights:\n\n${content}` }
          ]
        }
      ]
    });
    
    return {
      enhancement: result.response.text(),
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
  if (!seoModel) initializeModels();
  
  try {
    // First, get thinking from DeepSeek R1
    const metadataString = JSON.stringify(metadata, null, 2);
    const context = `Metadata: ${metadataString}${content ? `\nContent excerpt: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}` : ''}`;
    const thinking = await deepseekService.generateThinking(THINKING_PROMPTS.seoAnalysis, context);
    
    // Then, use Gemini with the thinking input
    const result = await seoModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_PROMPTS.seoAnalysis },
            { text: `Here's what our SEO strategy team thought about this analysis:\n\nThinking process:\n${thinking.thinking}\n\nRecommendations:\n${thinking.recommendation}\n\nNow, analyze the following website metadata and provide implementation steps using these insights:\n\n${metadataString}${content ? `\n\nContent:\n${content}` : ''}` }
          ]
        }
      ]
    });
    
    return {
      analysis: result.response.text(),
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
  if (!conversionModel) initializeModels();
  
  try {
    // First, get thinking from DeepSeek R1
    const conversionDataString = conversionData ? JSON.stringify(conversionData, null, 2) : '';
    const context = `User flow: ${userFlow}${conversionDataString ? `\nConversion data: ${conversionDataString}` : ''}`;
    const thinking = await deepseekService.generateThinking(THINKING_PROMPTS.conversionOptimization, context);
    
    // Then, use Gemini with the thinking input
    const result = await conversionModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_PROMPTS.conversionOptimization },
            { text: `Here's what our UX strategy team thought about this optimization:\n\nThinking process:\n${thinking.thinking}\n\nRecommendations:\n${thinking.recommendation}\n\nNow, analyze the following user flow and provide implementation steps using these insights:\n\n${userFlow}${conversionDataString ? `\n\nConversion Data:\n${conversionDataString}` : ''}` }
          ]
        }
      ]
    });
    
    return {
      optimization: result.response.text(),
      thinking: thinking.thinking,
      recommendation: thinking.recommendation
    };
  } catch (error) {
    console.error('Error optimizing conversion:', error);
    throw new Error('Failed to optimize conversion');
  }
};

// Initialize all models on service import
initializeModels();

// Export all functions
export default {
  analyzeWebsiteImage,
  enhanceContent,
  analyzeSEO,
  optimizeConversion
}; 