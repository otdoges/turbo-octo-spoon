// api/screenshot-proxy.js
const fetch = require('node-fetch');
const crypto = require('crypto');

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get query parameters
  const { url, expires, signature } = req.query;
  
  if (!url || !expires || !signature) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  // Validate parameters
  const currentTime = Math.floor(Date.now() / 1000);
  const expiryTime = parseInt(expires, 10);
  
  // Check if the URL has expired
  if (currentTime > expiryTime) {
    return res.status(400).json({ error: 'URL has expired' });
  }
  
  // Validate signature
  const expectedSignature = crypto
    .createHash('sha256')
    .update(`${url}|${expires}|${process.env.FILE_ENCRYPTION_KEY || 'default-key'}`)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(403).json({ error: 'Invalid signature' });
  }
  
  try {
    // Get API key from environment
    const apiKey = process.env.SCREENSHOT_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
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
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.send(imageBuffer);
  } catch (error) {
    console.error('Screenshot proxy error:', error);
    return res.status(500).json({
      error: 'Failed to proxy screenshot',
      message: error.message
    });
  }
} 