# LuminaWeb - AI Website Transformation

This application uses Playwright to take screenshots of websites for AI analysis and transformation.

## Features

- Take screenshots of websites using Playwright
- Analyze website design and structure
- Apply AI-powered transformations
- Preview before/after comparisons

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the React application:
   ```
   npm run dev
   ```

3. Start the screenshot server:
   ```
   npm run server
   ```

## Screenshot Functionality

The application uses Playwright to capture screenshots of websites for analysis. The screenshot service is implemented as a separate Express server that:

1. Captures full-page screenshots
2. Stores images locally
3. Provides URLs to access the screenshots

### How It Works

1. Enter a website URL in the "New Transformation" section
2. The application sends the URL to the screenshot server
3. Playwright navigates to the URL and takes a screenshot
4. The screenshot is used for AI analysis and transformation

## Notes

- Playwright requires compatible browsers to be installed. If you encounter issues, you might need to install browsers manually.
- The screenshot server runs on port 3001 by default. 