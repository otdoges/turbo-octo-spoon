import fs from 'fs';
import os from 'os';
import { getFile, deleteFile } from '../utils/secureStorage.js';

export default async function handler(req, res) {
  const { id } = req.query;
  const token = req.query.token;
  
  if (!id || !token) {
    return res.status(400).json({ error: 'Missing file ID or access token' });
  }
  
  try {
    // Get the file
    const fileBuffer = await getFile(id, token);
    
    // Determine content type based on file extension
    const files = await fs.promises.readdir(os.tmpdir() + '/luminaweb-temp');
    const targetFile = files.find(f => f.startsWith(id));
    
    if (!targetFile) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const extension = targetFile.split('.').pop().toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (extension === 'jpg' || extension === 'jpeg') contentType = 'image/jpeg';
    else if (extension === 'png') contentType = 'image/png';
    else if (extension === 'gif') contentType = 'image/gif';
    else if (extension === 'webp') contentType = 'image/webp';
    
    // Set content type
    res.setHeader('Content-Type', contentType);
    
    // Set cache control and security headers
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Send the file
    res.send(fileBuffer);
    
    // Optional: Delete file after serving (uncomment if you want files to be one-time use)
    // await deleteFile(id);
    
  } catch (error) {
    console.error('File serving error:', error);
    res.status(404).json({ error: 'File not found or expired' });
  }
} 