// Vercel adapter for UploadThing
import { createRouteHandler } from 'uploadthing/server';

// Import your UploadThing router configuration
// This requires converting the netlify router to ESM format or creating a new one
import { uploadthing } from '../../netlify/functions/uploadthing/router.mjs';

// Create the UploadThing route handler
const { GET, POST } = createRouteHandler({
  router: uploadthing,
  config: {
    uploadthingId: process.env.UPLOADTHING_APP_ID,
    uploadthingSecret: process.env.UPLOADTHING_SECRET,
    isDev: process.env.NODE_ENV === 'development'
  }
});

// Export the request handler for Vercel
export default async function handler(req, res) {
  // Route based on HTTP method
  if (req.method === 'GET') {
    return await GET(req, res);
  } else if (req.method === 'POST') {
    return await POST(req, res);
  } else {
    // Handle unsupported methods
    res.status(405).json({ error: 'Method not allowed' });
  }
} 