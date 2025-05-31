const fetch = require('node-fetch');
const { AbortController } = require('abort-controller');
const crypto = require('crypto');

// Helper function to validate URLs
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'X-Content-Type-Options': 'nosniff'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check for CSRF token in headers if this is accessed from a browser
  const csrfToken = event.headers['x-csrf-token'] || event.headers['X-CSRF-Token'];
  // In a real application, you would validate this token against a stored value
  
  try {
    // Parse the request body
    const { url } = JSON.parse(event.body);
    
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }
    
    // Validate URL format
    if (!isValidUrl(url)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid URL format' })
      };
    }

    // Get API key from environment
    const apiKey = process.env.SCREENSHOT_API_KEY;
    if (!apiKey || apiKey === 'demo') {
      console.warn('WARNING: Using demo API key for Screenshot One. This may not work in production.');
    }
    
    // Build the Screenshot One API URL but don't include the API key in the response
    const screenshotApiBaseUrl = 'https://api.screenshot-one.com/snapshot';
    
    // Create a secure request URL with the API key
    const requestUrl = `${screenshotApiBaseUrl}?access_key=${apiKey}&url=${encodeURIComponent(url)}&full_page=true&device=desktop&file_type=png&wait_for_page_load=true`;
    
    // Create a public-facing URL without the API key for the response
    const publicUrl = `${screenshotApiBaseUrl}?url=${encodeURIComponent(url)}&full_page=true&device=desktop&file_type=png`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 second timeout

    try {
      // Fetch with timeout
      const response = await fetch(requestUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Luminaweb/1.0'
        },
        timeout: 25000 // 25 second timeout as fallback
      });
      
      // Check if the response is successful
      if (!response.ok) {
        let errorMessage = 'Failed to capture screenshot';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      // Screenshot One returns the image directly, not JSON
      // For security, we'll create a signed URL that doesn't expose our API key
      
      // Generate a signed token for the URL
      const expires = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry
      const signature = crypto
        .createHash('sha256')
        .update(`${url}|${expires}|${process.env.FILE_ENCRYPTION_KEY || 'default-key'}`)
        .digest('hex');
      
      // Build a signed URL that can be validated later
      const screenshotUrl = `/.netlify/functions/screenshot-proxy?url=${encodeURIComponent(url)}&expires=${expires}&signature=${signature}`;
      
      // Return the screenshot URL with our proxy
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          screenshotUrl,
          message: 'Screenshot captured successfully'
        })
      };
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error('Screenshot error:', error);
    
    if (error.name === 'AbortError') {
      return {
        statusCode: 504,
        body: JSON.stringify({
          error: 'Screenshot request timed out',
          message: 'The request to capture the screenshot took too long and was aborted'
        })
      };
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to capture screenshot',
        message: error.message
      })
    };
  }
}; 