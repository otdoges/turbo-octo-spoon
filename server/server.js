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

// Middleware to replace CSP nonce placeholder in HTML
app.use(express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.html') {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading HTML file:', err);
          return;
        }
        
        // Replace nonce placeholder with actual nonce
        const modifiedHtml = data.replace(/%%CSP_NONCE%%/g, res.locals.cspNonce);
        res.send(modifiedHtml);
      });
    }
  }
}));

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

// Analyze image endpoint (placeholder for future AI integration)
app.post('/api/analyze', (req, res) => {
  const { imageUrl } = req.body;
  
  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }
  
  // This is a placeholder for the AI analysis that will be implemented later
  // For now, we'll just return some mock data
  
  console.log(`Analyzing image: ${imageUrl}`);
  
  // Simulate processing time
  setTimeout(() => {
    res.json({
      success: true,
      analysis: {
        colorPalette: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
        style: 'modern',
        layout: 'asymmetric',
        elements: {
          header: { position: 'top', style: 'fixed' },
          navigation: { type: 'horizontal', items: 5 },
          footer: { size: 'medium' }
        },
        recommendations: {
          colorAdjustments: 'Enhance contrast for better readability',
          layoutImprovements: 'Consider more whitespace between sections',
          typographyChanges: 'Increase font size for better mobile experience'
        }
      },
      message: 'Image analyzed successfully'
    });
  }, 2000);
});

// Start server
app.listen(port, () => {
  console.log(`Screenshot server running on port ${port}`);
}); 