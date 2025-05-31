// Vercel API route for file retrieval
import { getFile } from './utils/vercelStorage';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Add CSRF protection headers
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; img-src 'self' data: https://utfs.io;",
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  };

  // Get the file ID and access token from the query
  const { id: fileId, token: accessToken } = req.query;
  
  if (!fileId || !accessToken) {
    return res.status(400).json({ 
      error: 'Missing file ID or access token' 
    });
  }
  
  // Basic input validation
  if (!/^[a-zA-Z0-9-]+$/.test(fileId) || accessToken.length < 32) {
    return res.status(400).json({ 
      error: 'Invalid file ID or access token format' 
    });
  }
  
  try {
    // Perform token validation and get file details
    const fileDetails = await getFile(fileId, accessToken);
    
    if (!fileDetails || !fileDetails.url) {
      throw new Error('Unable to retrieve file');
    }
    
    // Redirect to the UploadThing URL
    res.redirect(302, fileDetails.url);
  } catch (error) {
    console.error('File access error:', error);
    return res.status(404).json({
      error: 'File not found or expired',
      message: error.message
    });
  }
} 