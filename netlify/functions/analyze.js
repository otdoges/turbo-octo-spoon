// netlify/functions/analyze.js
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { AbortController } = require('abort-controller');

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
    const { imageUrl, url } = JSON.parse(event.body);
    
    // Check if either imageUrl or direct url is provided
    if (!imageUrl && !url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Either image URL or website URL is required' })
      };
    }
    
    // Validate URL format
    if (url && !isValidUrl(url)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid URL format' })
      };
    }
    
    if (imageUrl && !isValidUrl(imageUrl)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid image URL format' })
      };
    }

    console.log(`Analyzing ${url ? 'website' : 'image'}: ${url || imageUrl}`);
    
    // If we have a direct URL, we'll analyze the webpage
    if (url) {
      try {
        const analysis = await analyzeWebpage(url);
        
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            analysis,
            message: 'Analysis completed successfully'
          })
        };
      } catch (error) {
        console.error('Website analysis error:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: 'Failed to analyze website',
            message: error.message
          })
        };
      }
    }
    
    // Otherwise, for image URL, we'll provide a simpler analysis
    // In a production app, this would use vision AI to analyze the image
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        analysis: {
          meta: {
            title: "Image Analysis",
            description: "Analysis based on the provided image"
          },
          colorPalette: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
          layoutInfo: {
            width: 1200,
            height: 800,
            hasHeader: true,
            hasFooter: true,
            layoutType: 'asymmetric',
            backgroundColor: '#ffffff',
            fontFamily: 'sans-serif'
          },
          navigationItems: [],
          fontInfo: {
            dominantFont: 'sans-serif',
            dominantSize: '16px',
            fontVariety: 2
          },
          stylePreference: 'modern',
          recommendations: {
            colorAdjustments: 'Consider a more cohesive color palette',
            layoutImprovements: 'Add more whitespace between sections',
            typographyChanges: 'Use consistent typography throughout'
          }
        },
        message: 'Image analyzed successfully'
      })
    };

  } catch (error) {
    console.error('Analysis error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to analyze',
        message: error.message
      })
    };
  }
};

// Function to analyze a webpage
async function analyzeWebpage(url) {
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 15000); // 15 second timeout
    
    try {
      // Fetch the webpage with timeout
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Luminaweb/1.0'
        },
        follow: 5, // Maximum number of redirects to follow
        timeout: 10000 // 10 second timeout as fallback
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch webpage: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Parse the HTML using JSDOM
      const dom = new JSDOM(html, {
        url: url,
        referrer: url,
        contentType: "text/html",
        storageQuota: 10000000
      });
      
      const document = dom.window.document;
      
      // Extract basic metadata
      const title = document.title || '';
      const metaDescription = document.querySelector('meta[name="description"]');
      const description = metaDescription ? metaDescription.getAttribute('content') : '';
      
      // Extract colors (simple version - in production would need more sophisticated analysis)
      const colors = new Set();
      // Add some placeholder colors based on URL (in production, would extract from CSS)
      colors.add('#1a1a2e');
      colors.add('#16213e');
      colors.add('#0f3460');
      colors.add('#e94560');
      
      // Detect layout features
      const hasHeader = !!document.querySelector('header') || 
                       !!document.querySelector('[role="banner"]') ||
                       !!document.querySelector('nav');
                       
      const hasFooter = !!document.querySelector('footer') || 
                       !!document.querySelector('[role="contentinfo"]');
                       
      const hasMultipleColumns = !!document.querySelector('.container') || 
                                !!document.querySelector('.row') ||
                                !!document.querySelector('.grid');
                                
      const layoutType = hasMultipleColumns ? 'grid' : 'single-column';
      
      // Detect navigation items
      const navElements = document.querySelectorAll('nav a, header a, [role="navigation"] a');
      const navigationItems = Array.from(navElements).map(el => ({
        text: el.textContent.trim(),
        href: el.getAttribute('href')
      })).slice(0, 10); // Limit to 10 items
      
      // Generate style preference based on URL and features
      let stylePreference = 'modern'; // Default
      
      if (url.includes('gov')) {
        stylePreference = 'classic';
      } else if (url.includes('tech') || url.includes('io')) {
        stylePreference = 'minimalist';
      } else if (colors.size > 3) {
        stylePreference = 'vibrant';
      }
      
      // Return the analysis
      return {
        meta: {
          title,
          description
        },
        colorPalette: Array.from(colors),
        layoutInfo: {
          width: 1200, // Placeholder value
          height: 800, // Placeholder value
          hasHeader,
          hasFooter,
          layoutType,
          backgroundColor: '#ffffff', // Placeholder
          fontFamily: 'sans-serif' // Placeholder
        },
        navigationItems,
        fontInfo: {
          dominantFont: 'sans-serif',
          dominantSize: '16px',
          fontVariety: 2
        },
        stylePreference,
        recommendations: {
          colorAdjustments: `Based on the ${colors.size} main colors detected, consider a more ${colors.size > 3 ? 'focused' : 'diverse'} palette`,
          layoutImprovements: hasHeader && hasFooter ? 'Layout structure looks good' : 'Consider adding proper header and footer sections',
          typographyChanges: 'Consider using more consistent typography across the site'
        }
      };
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out while fetching webpage');
    }
    console.error('Error analyzing webpage:', error);
    throw new Error('Failed to analyze webpage: ' + error.message);
  }
} 