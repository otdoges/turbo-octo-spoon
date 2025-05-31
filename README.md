# LuminaWeb - AI Website Transformation

This application uses Playwright to take screenshots of websites for AI analysis and transformation. It also supports direct image uploads for sites that can't be accessed via URL.

## Features

- Take screenshots of websites using Playwright
- Upload website images directly
- Analyze website design and structure (AI integration coming soon)
- Apply AI-powered transformations
- Preview before/after comparisons

## Setup

1. Install dependencies:
   ```
   bun install
   ```

2. Install server dependencies:
   ```
   cd server && bun install
   ```

3. Start the React application:
   ```
   bun run dev
   ```

4. Start the screenshot server:
   ```
   bun run server
   ```

## Screenshot Functionality

The application offers two ways to input website content for analysis:

### 1. URL-based Screenshot
- Enter a website URL in the "New Transformation" section
- The server-side Playwright engine navigates to the URL and takes a screenshot
- The screenshot is stored on the server and made available for analysis

### 2. Direct Image Upload
- Upload an image of a website directly
- Supports drag-and-drop functionality
- Images are stored on the server for analysis

## Placeholder for AI Integration

The current implementation includes placeholders for future AI analysis:

- Server-side `/api/analyze` endpoint that will process images
- Mock data structure for design analysis
- Integration points for connecting AI services

## Notes

- Playwright requires compatible browsers to be installed. If you encounter issues, you might need to install browsers manually.
- The screenshot server runs on port 3001 by default.
- Maximum file upload size is 10MB. 