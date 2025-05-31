# LuminaWeb - AI Website Transformation

This application uses serverless functions to take screenshots of websites and upload images for AI analysis and transformation. The application is designed to be deployed on serverless platforms like Vercel and Netlify.

## Features

- Take screenshots of websites using serverless APIs
- Upload website images directly with drag-and-drop
- Analyze website design and structure (AI integration coming soon)
- Apply AI-powered transformations
- Preview before/after comparisons

## Development Setup

1. Install dependencies:
   ```
   bun install
   ```

2. Start the development server:
   ```
   bun run dev
   ```

3. For local testing with the Express server:
   ```
   bun run server
   ```

## Serverless Deployment

The application is configured to work with serverless platforms like Vercel and Netlify. Choose one of the following deployment options:

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure the following environment variables:
   - `SCREENSHOT_API_KEY`: Your screenshot API service key
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
4. Deploy

### Netlify Deployment

1. Push your code to GitHub
2. Import your repository in Netlify
3. Configure the following environment variables:
   - `SCREENSHOT_API_KEY`: Your screenshot API service key
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
4. Deploy

## Serverless Architecture

The application uses the following serverless functions:

1. `/api/screenshot` - Takes screenshots of websites using external screenshot APIs
2. `/api/upload` - Uploads images to Cloudinary for storage
3. `/api/analyze` - Analyzes images (placeholder for future AI integration)

### External Services

- **Image Storage**: Cloudinary (free tier includes 25GB/month)
- **Screenshot API**: Screenshot API, Urlbox, or similar (many offer free tiers)
- **Future AI Integration**: OpenAI Vision API or similar

## Notes

- The serverless functions have been optimized to work within the free tier limits of Vercel and Netlify
- The application supports both direct image uploads and URL-based screenshots
- Maximum file upload size is 10MB
- For heavy usage, consider upgrading to paid plans on the respective platforms 