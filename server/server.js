const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/screenshots', express.static(screenshotsDir));

// Screenshot endpoint
app.post('/api/screenshot', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  let browser = null;
  
  try {
    console.log(`Taking screenshot of ${url}`);
    
    // Launch browser (no-sandbox needed for some environments)
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `screenshot-${timestamp}.png`;
    const filepath = path.join(screenshotsDir, filename);
    
    // Take screenshot
    await page.screenshot({ path: filepath, fullPage: true });
    
    await browser.close();
    
    res.json({ 
      success: true, 
      screenshotUrl: `/screenshots/${filename}`,
      message: 'Screenshot captured successfully'
    });
    
  } catch (error) {
    console.error('Screenshot error:', error);
    
    if (browser) {
      await browser.close();
    }
    
    res.status(500).json({ 
      error: 'Failed to capture screenshot', 
      message: error.message 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Screenshot server running on port ${port}`);
}); 