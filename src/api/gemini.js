import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google's Generative AI with the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Handles Gemini API requests
 * @param {Request} req - The incoming request
 * @param {Response} res - The response object
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model = 'gemini-2.5-flash', temperature = 0.7, maxOutputTokens = 1024 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const modelInstance = genAI.getGenerativeModel({ 
      model,
      generationConfig: { temperature, maxOutputTokens }
    });

    const result = await modelInstance.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ result: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}
