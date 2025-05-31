const busboy = require('busboy');
const { Buffer } = require('buffer');
const { saveFile } = require('./utils/secureStorage');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  return new Promise((resolve, reject) => {
    // Parse the multipart form data
    const bb = busboy({ headers: event.headers });
    let fileBuffer;
    let fileName;
    let mimeType;
    
    bb.on('file', (name, file, info) => {
      const { filename, mimeType: fileMimeType } = info;
      fileName = filename;
      mimeType = fileMimeType;
      
      // Verify file type
      if (!fileMimeType || !fileMimeType.startsWith('image/')) {
        return resolve({
          statusCode: 400,
          body: JSON.stringify({ error: 'Only image files are allowed' })
        });
      }
      
      const chunks = [];
      file.on('data', (data) => {
        chunks.push(data);
      });
      
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
        
        // Check file size (max 10MB)
        const maxFileSize = (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024;
        if (fileBuffer.length > maxFileSize) {
          return resolve({
            statusCode: 400,
            body: JSON.stringify({ error: `File size exceeds the maximum limit of ${maxFileSize / (1024 * 1024)}MB` })
          });
        }
      });
    });
    
    bb.on('finish', async () => {
      if (!fileBuffer) {
        return resolve({
          statusCode: 400,
          body: JSON.stringify({ error: 'No file uploaded' })
        });
      }
      
      try {
        // Save file using UploadThing through our wrapper
        const { fileId, accessToken, expiresAt, url } = await saveFile(fileBuffer, fileName);
        
        // Return the direct URL from UploadThing
        resolve({
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            imageUrl: url, // Direct UploadThing URL
            fileId: fileId,
            expiresAt: expiresAt.toISOString(),
            message: 'Image uploaded successfully'
          })
        });
      } catch (error) {
        console.error('Upload error:', error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({
            error: 'Failed to upload image',
            message: error.message
          })
        });
      }
    });
    
    bb.on('error', (error) => {
      console.error('Busboy error:', error);
      resolve({
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to parse form data',
          message: error.message
        })
      });
    });
    
    // Pass the request body to busboy
    bb.write(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'binary'));
    bb.end();
  });
}; 