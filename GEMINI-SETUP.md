# AI Collaboration Team Setup

This project integrates a collaborative AI approach using two powerful models working together:

1. **DeepSeek R1** (via OpenRouter): Handles strategic thinking, analysis and recommendations
2. **Google Gemini 2.5 Flash**: Implements concrete solutions based on DeepSeek's thinking

Together they provide AI-powered analysis features:

1. **Image Analysis**: Analyze website screenshots for design improvements
2. **Content Enhancement**: Improve website copy and content
3. **SEO Analysis**: Get recommendations for better search engine performance
4. **Conversion Optimization**: Improve user flows and conversion rates

## How It Works

Our AI collaboration approach mirrors how a team of engineers would work together:

1. **Strategy Phase (DeepSeek R1)**: The "thinking brain" deeply analyzes the problem and generates strategic recommendations
2. **Implementation Phase (Gemini 2.5)**: Takes the strategic thinking and converts it into specific, actionable implementations
3. **User Interface**: Shows both the thinking process and the final output, allowing you to see how the AI team approached the problem

## Setup Instructions

### 1. API Keys

The system requires two API keys:

1. **Gemini API Key** from Google AI Studio
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy the key for the next step

2. **OpenRouter API Key** (already configured)
   - This is pre-configured with the key: 
   - No action needed unless you want to use your own key

### 2. Set Up Environment Variables

Create a `.env` file in the root of the project with the following content:

```
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Model Configuration
GEMINI_MODEL=gemini-2.5-flash
TEMPERATURE=0.7
TOP_P=0.95
TOP_K=40

# Application Settings
NODE_ENV=development
```

Replace `your_gemini_api_key_here` with the API key you obtained from Google AI Studio.

### 3. Install Dependencies

Make sure you have Bun installed, then run:

```bash
bun install
```

### 4. Start the Development Server

```bash
bun run dev
```

## Usage

1. Navigate to the dashboard
2. Find the "AI Analysis" panel
3. Choose the type of analysis you want to perform:
   - **Image Analysis**: Upload a screenshot of a website
   - **Content Enhancement**: Paste website content to improve
   - **SEO Analysis**: Enter website URL and content for SEO recommendations
   - **Conversion Optimization**: Describe user flows for improvement suggestions
4. Click the "View AI Thinking Process" button to see how the DeepSeek R1 model approached the problem

## Customizing System Prompts

The system prompts for each model can be customized:

- **DeepSeek R1 Thinking Prompts**: Edit the `THINKING_PROMPTS` object in `src/services/geminiService.ts`
- **Gemini Implementation Prompts**: Edit the `SYSTEM_PROMPTS` object in the same file

## Troubleshooting

- **API Key Issues**: Make sure your Google API key is correctly set in the .env file
- **Model Errors**: Check that you're using the correct model names (gemini-2.5-flash and deepseek-r1)
- **Rate Limiting**: If you hit rate limits, consider implementing a delay between requests or upgrading your API plan
- **Network Issues**: Ensure your application has internet access to reach both the Google AI API and OpenRouter API 