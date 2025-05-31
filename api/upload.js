// Vercel API route for file uploads
import { saveFile } from './utils/vercelStorage';
import formidable from 'formidable';
import { Readable } from 'stream';

// Helper to convert streams to buffers
async function streamToBuffer(stream) {
  const chunks = [];
  
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  
  return Buffer.concat(chunks);
}

// Configuration for formidable
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024, // Default 10MB
      filter: (part) => {
        // Only accept image files
        return part.mimetype?.startsWith('image/') || false;
      },
    });

    // Parse the form
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Get the file from the request
    const file = files.file?.[0];
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify file type
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    // Convert file to buffer
    let fileBuffer;
    if (file.filepath) {
      // formidable v4+ stores files on disk
      const fs = await import('fs/promises');
      fileBuffer = await fs.readFile(file.filepath);
    } else if (file.stream) {
      // Stream-based approach
      fileBuffer = await streamToBuffer(file.stream);
    } else {
      return res.status(500).json({ error: 'Failed to process file' });
    }

    // Save file using the vercelStorage utility
    const { fileId, accessToken, expiresAt, url } = await saveFile(fileBuffer, file.originalFilename);

    // Return the file info
    return res.status(200).json({
      success: true,
      imageUrl: url,
      fileId,
      expiresAt: expiresAt.toISOString(),
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Failed to upload image',
      message: error.message
    });
  }
} 