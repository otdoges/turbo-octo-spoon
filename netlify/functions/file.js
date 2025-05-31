const { getFile } = require('./utils/secureStorage');
const crypto = require('crypto');

exports.handler = async function(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Add CSRF protection headers
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; img-src 'self' data: https://uploadthing.com https://*.uploadthing.com;",
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  };

  // Get the file ID and access token from the query
  const fileId = event.queryStringParameters?.id;
  const accessToken = event.queryStringParameters?.token;
  
  if (!fileId || !accessToken) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing file ID or access token' })
    };
  }
  
  // Basic input validation
  if (!/^[a-zA-Z0-9-]+$/.test(fileId) || accessToken.length < 32) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid file ID or access token format' })
    };
  }
  
  try {
    // Perform token validation and get file details
    const fileDetails = await getFile(fileId, accessToken);
    
    if (!fileDetails || !fileDetails.url) {
      throw new Error('Unable to retrieve file');
    }
    
    // Redirect to the UploadThing URL
    return {
      statusCode: 302,
      headers: {
        ...headers,
        'Location': fileDetails.url
      },
      body: ''
    };
  } catch (error) {
    console.error('File access error:', error);
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'File not found or expired',
        message: error.message
      })
    };
  }
}; 