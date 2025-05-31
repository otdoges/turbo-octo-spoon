const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3001;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'upload-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/screenshots', express.static(screenshotsDir));
app.use('/uploads', express.static(uploadsDir));

// Generate nonce for CSP
app.use((req, res, next) => {
  // Generate a new random nonce value for each request
  const nonce = crypto.randomBytes(16).toString('base64');
  
  // Store nonce for use in templates
  res.locals.cspNonce = nonce;
  
  // Set CSP header with nonce and other directives
  const cspHeader = {
    'Content-Security-Policy': `default-src 'self'; 
      script-src 'self' 'nonce-${nonce}'; 
      style-src 'self' 'nonce-${nonce}' https://api.fontshare.com https://fonts.googleapis.com; 
      font-src 'self' https://api.fontshare.com https://fonts.gstatic.com; 
      img-src 'self' data: blob: https:; 
      connect-src 'self' https://api.openai.com https://api.github.ai https://openrouter.ai https://api.clerk.com https://*.supabase.co https://api.screenshotapi.net; 
      frame-src 'self';`
      .replace(/\s+/g, ' ')
      .trim()
  };
  
  // Set security headers
  res.set({
    ...cspHeader,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  
  next();
});

// Middleware to handle HTML files with CSP nonce replacement
app.get('*.html', (req, res, next) => {
  const filePath = path.join(__dirname, '../dist', req.path);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      // Pass to next middleware if file not found or other error
      return next();
    }
    
    // Replace nonce placeholder with actual nonce
    const modifiedHtml = data.replace(/%%CSP_NONCE%%/g, res.locals.cspNonce);
    res.type('html').send(modifiedHtml);
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));

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

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // File was uploaded successfully
    res.json({
      success: true,
      imageUrl: `/uploads/${req.file.filename}`,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      message: error.message
    });
  }
});

// Analyze image or website endpoint with real analysis using Playwright
app.post('/api/analyze', async (req, res) => {
  const { imageUrl, url } = req.body;
  
  // Check if either imageUrl or direct url is provided
  if (!imageUrl && !url) {
    return res.status(400).json({ error: 'Either image URL or website URL is required' });
  }

  let browser = null;
  let targetUrl = url;
  
  try {
    console.log(`Analyzing ${url ? 'website' : 'image'}: ${url || imageUrl}`);
    
    // If only image URL is provided (no direct URL), we'll create a simple HTML page to display it
    if (!url && imageUrl) {
      // Use the actual image URL for analysis
      // We don't need to create a temp HTML page as we'll analyze the image directly
      targetUrl = imageUrl;
    }
    
    // Launch browser
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to the URL
    await page.goto(targetUrl, { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });
    
    // Perform actual analysis using Playwright
    const analysis = await analyzePageWithPlaywright(page);
    
    await browser.close();
    
    res.json({
      success: true,
      analysis,
      message: 'Analysis completed successfully'
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    
    if (browser) {
      await browser.close();
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze', 
      message: error.message 
    });
  }
});

// Function to analyze a page using Playwright
async function analyzePageWithPlaywright(page) {
  // Get page title
  const title = await page.title();
  
  // Get page metadata
  const description = await page.evaluate(() => {
    const metaDescription = document.querySelector('meta[name="description"]');
    return metaDescription ? metaDescription.getAttribute('content') : '';
  });
  
  // Extract color palette
  const colorPalette = await page.evaluate(() => {
    const colors = new Set();
    const elements = document.querySelectorAll('*');
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const backgroundColor = style.backgroundColor;
      const color = style.color;
      
      // Only add valid, non-transparent colors
      if (backgroundColor && !backgroundColor.includes('rgba(0, 0, 0, 0)') && backgroundColor !== 'transparent') {
        colors.add(backgroundColor);
      }
      
      if (color && color !== 'rgb(0, 0, 0)' && color !== 'rgb(255, 255, 255)') {
        colors.add(color);
      }
    });
    
    // Convert to array and take only first 5 colors
    return [...colors].slice(0, 5);
  });
  
  // Analyze layout
  const layoutInfo = await page.evaluate(() => {
    const bodyStyle = window.getComputedStyle(document.body);
    const hasHeader = !!document.querySelector('header') || 
                      !!document.querySelector('[role="banner"]') ||
                      !!document.querySelector('nav');
                      
    const hasFooter = !!document.querySelector('footer') || 
                      !!document.querySelector('[role="contentinfo"]');
                      
    const hasMultipleColumns = !!document.querySelector('.container') || 
                              !!document.querySelector('.row') ||
                              !!document.querySelector('.grid');
                              
    const layoutType = hasMultipleColumns ? 'grid' : 'single-column';
    
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      hasHeader,
      hasFooter,
      layoutType,
      backgroundColor: bodyStyle.backgroundColor,
      fontFamily: bodyStyle.fontFamily
    };
  });
  
  // Analyze navigation
  const navigationItems = await page.evaluate(() => {
    const navElements = document.querySelectorAll('nav a, header a, [role="navigation"] a');
    return Array.from(navElements).map(el => ({
      text: el.textContent.trim(),
      href: el.getAttribute('href')
    })).slice(0, 10); // Limit to 10 items
  });
  
  // Extract dominant font information
  const fontInfo = await page.evaluate(() => {
    const elements = document.querySelectorAll('body, h1, h2, h3, p, span, a, button');
    const fontFamilies = {};
    const fontSizes = {};
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const fontFamily = style.fontFamily;
      const fontSize = style.fontSize;
      
      fontFamilies[fontFamily] = (fontFamilies[fontFamily] || 0) + 1;
      fontSizes[fontSize] = (fontSizes[fontSize] || 0) + 1;
    });
    
    // Find most common font family and size
    let dominantFont = Object.keys(fontFamilies).reduce((a, b) => 
      fontFamilies[a] > fontFamilies[b] ? a : b, Object.keys(fontFamilies)[0]);
      
    let dominantSize = Object.keys(fontSizes).reduce((a, b) => 
      fontSizes[a] > fontSizes[b] ? a : b, Object.keys(fontSizes)[0]);
    
    return {
      dominantFont,
      dominantSize,
      fontVariety: Object.keys(fontFamilies).length
    };
  });
  
  // Generate style recommendations
  let stylePreference = 'modern'; // Default
  
  if (layoutInfo.layoutType === 'grid' && fontInfo.fontVariety < 3) {
    stylePreference = 'minimalist';
  } else if (colorPalette.length > 3) {
    stylePreference = 'vibrant';
  } else if (fontInfo.dominantFont.includes('serif')) {
    stylePreference = 'classic';
  }
  
  // Compile the analysis
  return {
    meta: {
      title,
      description
    },
    colorPalette,
    layoutInfo,
    navigationItems,
    fontInfo,
    stylePreference,
    recommendations: {
      colorAdjustments: `Based on the ${colorPalette.length} main colors detected, consider a more ${colorPalette.length > 3 ? 'focused' : 'diverse'} palette`,
      layoutImprovements: layoutInfo.hasHeader && layoutInfo.hasFooter ? 'Layout structure looks good' : 'Consider adding proper header and footer sections',
      typographyChanges: `Current dominant font (${fontInfo.dominantFont.split(',')[0]}) is ${fontInfo.fontVariety > 2 ? 'one of many - consider reducing variety' : 'consistently used'}`
    }
  };
}

// Start server with port fallback
const startServer = (attemptPort) => {
  const server = app.listen(attemptPort)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${attemptPort} is busy, trying ${attemptPort + 1}...`);
        startServer(attemptPort + 1);
      } else {
        console.error('Server error:', err);
      }
    })
    .on('listening', () => {
      const actualPort = server.address().port;
      console.log(`Screenshot server running on port ${actualPort}`);
    });
};

startServer(port); 