import formidable from 'formidable';
import { saveFile, deleteFile } from './utils/secureStorage.js';

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form with formidable
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.maxFileSize = (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024; // Default 10MB

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.image;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify file type
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    // Read the file into buffer
    const fileBuffer = await new Promise((resolve, reject) => {
      const fs = require('fs');
      fs.readFile(file.filepath, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    // Save the file securely
    const { fileId, accessToken, expiresAt } = await saveFile(fileBuffer, file.originalFilename);

    // Create secure file access URL
    const fileUrl = `/api/file/${fileId}?token=${accessToken}`;

    // Return the secure URL
    res.status(200).json({
      success: true,
      imageUrl: fileUrl,
      fileId: fileId,
      expiresAt: expiresAt.toISOString(),
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      message: error.message
    });
  }
} 