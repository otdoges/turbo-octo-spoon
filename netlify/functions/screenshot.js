const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const { url } = JSON.parse(event.body);
    
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    // Use a public screenshot API service
    const apiKey = process.env.SCREENSHOT_API_KEY || 'demo';
    const screenshotApiUrl = `https://shot.screenshotapi.net/screenshot?token=${apiKey}&url=${encodeURIComponent(url)}&output=json&full_page=true`;

    const response = await fetch(screenshotApiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to capture screenshot');
    }

    // Return the screenshot URL
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        screenshotUrl: data.screenshot,
        message: 'Screenshot captured successfully'
      })
    };
  } catch (error) {
    console.error('Screenshot error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to capture screenshot',
        message: error.message
      })
    };
  }
}; 