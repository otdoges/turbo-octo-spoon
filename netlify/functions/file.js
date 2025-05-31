const fs = require('fs');
const os = require('os');
const path = require('path');
const { getFile, deleteFile } = require('./utils/secureStorage');

exports.handler = async function(event, context) {
  // Extract file ID and token from query parameters
  const id = event.queryStringParameters?.id;
  const token = event.queryStringParameters?.token;
  
  if (!id || !token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing file ID or access token' })
    };
  }
  
  try {
    // Get the file
    const fileBuffer = await getFile(id, token);
    
    // Determine content type based on file extension
    const files = await fs.promises.readdir(path.join(os.tmpdir(), 'luminaweb-temp'));
    const targetFile = files.find(f => f.startsWith(id));
    
    if (!targetFile) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'File not found' })
      };
    }
    
    const extension = targetFile.split('.').pop().toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (extension === 'jpg' || extension === 'jpeg') contentType = 'image/jpeg';
    else if (extension === 'png') contentType = 'image/png';
    else if (extension === 'gif') contentType = 'image/gif';
    else if (extension === 'webp') contentType = 'image/webp';
    
    // Encode the file as base64
    const base64File = fileBuffer.toString('base64');
    
    // Optional: Delete file after serving (uncomment if you want files to be one-time use)
    // await deleteFile(id);
    
    // Return the file with appropriate headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, max-age=0',
        'Content-Security-Policy': "default-src 'self'",
        'X-Content-Type-Options': 'nosniff'
      },
      body: base64File,
      isBase64Encoded: true
    };
    
  } catch (error) {
    console.error('File serving error:', error);
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'File not found or expired' })
    };
  }
}; 