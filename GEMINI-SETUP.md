# AI-Powered Website & Code Enhancement System

This document explains how to set up and use the AI-powered enhancement features that use multiple AI models working together as a collaborative team.

## Overview

Our system uses three AI models working in collaboration:

1. **DeepSeek R1** - Acts as the "thinking brain" that performs strategic analysis for website optimization
2. **Gemini 2.5 Flash** - Functions as the "implementation brain" for transforming strategy into visual and content improvements
3. **GitHub AI Models** - Provides specialized code intelligence for debugging, refactoring, security analysis, and test generation

This collaborative approach combines deep strategic thinking with practical implementation to deliver powerful website and code enhancement capabilities.

## Features

### 1. Image Analysis (Gemini + DeepSeek)

Upload website screenshots to get detailed analysis and recommendations for:

- Visual hierarchy improvements
- Color scheme optimization
- Typography enhancements
- Layout and spacing adjustments
- UI element refinements
- Accessibility improvements
- Responsiveness suggestions
- Branding consistency recommendations
- Conversion optimization ideas

### 2. Content Enhancement (Gemini + DeepSeek)

Paste your website content to receive AI-powered enhancements for:

- Messaging clarity
- Audience alignment
- Persuasive structure
- Call-to-action effectiveness
- SEO optimization
- Voice and tone consistency
- Readability improvements
- Credibility signals
- Technical accuracy

### 3. Code Assistant (GitHub AI Models)

Leverage GitHub's AI models for code assistance:

- **Error Analysis**: Debug code by explaining errors and suggesting fixes
- **Code Generation**: Generate implementation from feature descriptions
- **Refactoring**: Improve existing code based on specific goals
- **Security Analysis**: Identify vulnerabilities in your code
- **Code Review**: Get feedback on code quality and adherence to requirements
- **Test Generation**: Automatically create unit tests for your code

## Setup Instructions

1. **Environment Variables**

   Create a `.env` file in the root directory with the following variables:

   ```
   # Gemini API Configuration
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   
   # DeepSeek API Configuration (via OpenRouter)
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
   
   # GitHub AI Configuration
   # Create a personal access token with models:read permission
   VITE_GITHUB_TOKEN=your_github_token_here
   ```

   **IMPORTANT:** Never commit API keys to the repository. The `.env` file is included in `.gitignore`.

2. **Install Dependencies**

   ```bash
   bun install
   ```

3. **Start Development Server**

   ```bash
   bun run dev
   ```

## How to Use

1. Navigate to the dashboard
2. Select one of the three tools:
   - **Image Analysis**: Upload a screenshot for website design analysis
   - **Content Enhancement**: Paste your content for improvement suggestions
   - **Code Assistant**: Choose from multiple code tools (error analysis, generation, refactoring, etc.)
3. Provide the required input
4. Click the appropriate action button
5. Review the results

## Obtaining API Keys

### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key

### OpenRouter API Key (for DeepSeek)
1. Go to [OpenRouter](https://openrouter.ai/)
2. Create an account and subscribe to a plan
3. Generate an API key

### GitHub Personal Access Token
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Select "models:read" permission
4. Copy the generated token

## Technical Implementation

The system is built with:

- React + TypeScript + Vite
- Tailwind CSS for styling
- Google's Generative AI SDK for Gemini integration
- OpenRouter API for DeepSeek R1 integration
- OpenAI SDK with GitHub AI endpoint for code assistance

## API Usage and Quotas

Be mindful of API usage limits:

- Gemini API has usage quotas based on your Google Cloud account
- OpenRouter charges per token for DeepSeek access
- GitHub AI models have usage limits based on your GitHub plan

Monitor your usage to avoid unexpected charges 