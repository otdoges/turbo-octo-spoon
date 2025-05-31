import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google's Generative AI with the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Function to validate the request body
function validateRequest(body) {
  if (!body.prompt) {
    throw new Error('Prompt is required');
  }

  if (body.image) {
    if (!body.image.data || !body.image.mimeType) {
      throw new Error('Image data and mimeType are required when providing an image');
    }
  }
}

/**
 * Handles Gemini API requests
 * @param {Request} req - The incoming request
 * @param {Response} res - The response object
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model = 'gemini-2.5-flash', temperature = 0.7, image } = req.body;

    // Validate the request
    try {
      validateRequest(req.body);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get the appropriate model
    const genAIModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: { temperature }
    });

    // Prepare the parts array with text and optional image
    const parts = [{ text: prompt }];
    
    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }


    // Generate content
    const result = await genAIModel.generateContent({
      contents: [
        {
          role: 'user',
          parts,
        },
      ]
    });

    // Extract and return the response
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ result: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}
