// netlify/functions/screenshot-proxy.js
const fetch = require('node-fetch');
const crypto = require('crypto');

exports.handler = async function(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'X-Content-Type-Options': 'nosniff'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get query parameters
  const { url, expires, signature } = event.queryStringParameters;
  
  if (!url || !expires || !signature) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required parameters' })
    };
  }
  
  // Validate parameters
  const currentTime = Math.floor(Date.now() / 1000);
  const expiryTime = parseInt(expires, 10);
  
  // Check if the URL has expired
  if (currentTime > expiryTime) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'URL has expired' })
    };
  }
  
  // Validate signature
  const expectedSignature = crypto
    .createHash('sha256')
    .update(`${url}|${expires}|${process.env.FILE_ENCRYPTION_KEY || 'default-key'}`)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Invalid signature' })
    };
  }
  
  try {
    // Get API key from environment
    const apiKey = process.env.SCREENSHOT_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }
    
    // Create the actual Screenshot One API URL
    const screenshotApiUrl = `https://api.screenshot-one.com/snapshot?access_key=${apiKey}&url=${encodeURIComponent(url)}&full_page=true&device=desktop&file_type=png&wait_for_page_load=true`;
    
    // Forward to Screenshot One API
    const response = await fetch(screenshotApiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Luminaweb/1.0'
      },
      timeout: 25000 // 25 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Screenshot API returned ${response.status}: ${response.statusText}`);
    }
    
    // Get image data
    const imageBuffer = await response.buffer();
    
    // Return the image
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff'
      },
      body: imageBuffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Screenshot proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to proxy screenshot',
        message: error.message
      })
    };
  }
}; 