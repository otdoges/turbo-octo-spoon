# GitHub AI Code Assistant

This document explains how to set up and use the GitHub AI Code Assistant feature which leverages GitHub's AI models to provide code assistance, debugging, and analysis.

## Overview

The GitHub AI Code Assistant is integrated into our application and provides the following features:

1. **Error Analysis**: Debug code errors with detailed explanations and suggested fixes
2. **Code Generation**: Create implementations from feature descriptions
3. **Code Refactoring**: Improve existing code based on specific goals
4. **Security Analysis**: Identify vulnerabilities in your code
5. **Code Review**: Get feedback on code quality and adherence to requirements
6. **Test Generation**: Automatically create unit tests for your code

## Setup Instructions

### 1. Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token" (classic)
3. Give your token a descriptive name
4. Select the **models:read** permission scope
5. Click "Generate token"
6. Copy the generated token (you won't be able to see it again)

### 2. Configure Environment Variables

Add your GitHub token to your `.env` file:

```
VITE_GITHUB_TOKEN=your_github_token_here
```

**IMPORTANT**: Never commit your actual token to the repository. The `.env` file is included in `.gitignore`.

## Usage Guide

1. Navigate to the AI Analysis Dashboard
2. Select the "Code Assistant" tab
3. Choose from the available tools:
   - **Error Analysis**: Paste your code and the error message
   - **Code Generation**: Describe the functionality you need
   - **Refactoring**: Paste your code and specify refactoring goals
   - **Security Analysis**: Paste your code for vulnerability scanning
   - **Code Review**: Paste your code and optional requirements
   - **Test Generation**: Paste your code and select a test framework
4. Select the programming language
5. Click the action button
6. Review the results

## Technical Implementation

The Code Assistant is implemented using:

- GitHub's AI model API via OpenAI SDK
- React with TypeScript for the frontend
- Custom-designed UI components

## API Rate Limits

GitHub's AI models have usage limits based on your GitHub plan:

- Free: Limited number of queries per month
- Pro/Team: Higher number of queries per month
- Enterprise: Highest number of queries per month

Monitor your usage on the [GitHub Copilot Portal](https://github.com/settings/copilot).

## Troubleshooting

### Common Issues

1. **"Unable to analyze error: GitHub token not configured"**
   - Ensure your GitHub token is correctly set in the `.env` file
   - Verify the token has the `models:read` permission

2. **"Error chatting with AI: 401 Unauthorized"**
   - Your token may have expired - generate a new one
   - Check that your token has the correct permissions

3. **"Error: Request failed with status code 429"**
   - You've hit the rate limit - wait and try again later

### Getting Help

If you encounter issues with the GitHub AI Code Assistant, please:

1. Check the console for error messages
2. Verify your GitHub token is valid and has the correct permissions
3. Contact support with details about the error

## Security Considerations

- The GitHub AI Code Assistant sends code to GitHub's AI model API
- Do not send sensitive code or data through the assistant
- Review all generated code before using it in production
- Generated code may have security issues - always perform security reviews

## Future Enhancements

Planned features for future versions:

- Support for more programming languages
- Integration with GitHub repositories
- Collaborative coding features
- Code explanation and documentation generation 