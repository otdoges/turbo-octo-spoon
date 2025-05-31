import fetch from 'node-fetch';

// Serverless API endpoint for screenshots
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Use a public screenshot API service instead of Playwright
    // Options include: Screenshot API, Urlbox, Screenshotlayer, etc.
    // This example uses a mock endpoint - replace with actual service
    const apiKey = process.env.SCREENSHOT_API_KEY || 'demo';
    const screenshotApiUrl = `https://shot.screenshotapi.net/screenshot?token=${apiKey}&url=${encodeURIComponent(url)}&output=json&full_page=true`;

    const response = await fetch(screenshotApiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to capture screenshot');
    }

    // Return the screenshot URL directly from the service
    res.status(200).json({
      success: true,
      screenshotUrl: data.screenshot,
      message: 'Screenshot captured successfully'
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({
      error: 'Failed to capture screenshot',
      message: error.message
    });
  }
} 