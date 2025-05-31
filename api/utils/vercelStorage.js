// Vercel-compatible storage utility for UploadThing
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Constants
const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024; // Default 10MB
const FILE_RETENTION_MINUTES = parseInt(process.env.FILE_RETENTION_MINUTES) || 30; // Default 30 minutes
const FETCH_TIMEOUT_MS = parseInt(process.env.FETCH_TIMEOUT_MS) || 30000; // Default 30 seconds

// Fail fast if FILE_ENCRYPTION_KEY is missing in production
if (process.env.NODE_ENV === 'production' && !process.env.FILE_ENCRYPTION_KEY) {
  throw new Error('FILE_ENCRYPTION_KEY environment variable must be set in production');
}

// Generate a strong encryption key if not provided - only for development
const ENCRYPTION_KEY = process.env.FILE_ENCRYPTION_KEY || (
  process.env.NODE_ENV !== 'production' 
    ? crypto.randomBytes(32).toString('hex') 
    : null
);

// Secure random token generator
export function generateToken() {
  return crypto.randomBytes(48).toString('hex');
}

// Helper function to add timeout to fetch
async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Save file using UploadThing
export async function saveFile(buffer, originalFilename) {
  if (!buffer) {
    throw new Error('No file buffer provided');
  }
  
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  try {
    // Generate a unique ID for this file
    const fileId = uuidv4();
    const accessToken = generateToken();
    const expiresAt = new Date(Date.now() + (FILE_RETENTION_MINUTES * 60 * 1000));
    
    // Create a FormData object to send to the UploadThing API
    const formData = new FormData();
    
    // Add the file to the form data with appropriate content type detection
    const fileExtension = originalFilename ? originalFilename.split('.').pop().toLowerCase() : 'jpg';
    let contentType;
    
    // Determine content type based on file extension
    switch (fileExtension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      default:
        contentType = 'application/octet-stream';
    }
    
    // Create a Blob from buffer for FormData
    const blob = new Blob([buffer], { type: contentType });
    formData.append('file', blob, originalFilename || `${fileId}.${fileExtension}`);
    
    // Add metadata
    formData.append('fileId', fileId);
    formData.append('accessToken', accessToken);
    formData.append('expiresAt', expiresAt.toISOString());
    
    // Call the internal UploadThing API endpoint
    const apiUrl = '/api/uploadthing/upload';
    
    // Call our UploadThing API with timeout
    const response = await fetchWithTimeout(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'x-uploadthing-route': 'imageUploader',
      },
    });
    
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(`Upload failed: ${errorMessage}`);
    }
    
    const result = await response.json();
    
    if (!result.url) {
      throw new Error('Upload response missing URL');
    }
    
    return {
      fileId,
      accessToken,
      expiresAt,
      url: result.url
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Upload request timed out');
    }
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// Get file from UploadThing (return the URL)
export async function getFile(fileId, accessToken) {
  if (!fileId || !accessToken) {
    throw new Error('Missing required parameters: fileId and accessToken');
  }
  
  try {
    // UploadThing files URL pattern - use official format
    // See: https://docs.uploadthing.com/api-reference/file-urls
    // Format: https://utfs.io/f/{fileKey}
    const uploadThingUrl = `https://utfs.io/f/${fileId}`;
    
    return { 
      fileId,
      url: uploadThingUrl
    };
  } catch (error) {
    console.error('Error getting file:', error);
    throw new Error(`Failed to retrieve file: ${error.message}`);
  }
}

// Delete file from UploadThing
export async function deleteFile(fileId) {
  if (!fileId) {
    throw new Error('Missing required parameter: fileId');
  }
  
  try {
    // UploadThing offers deletion via their dashboard and API
    console.warn(`File deletion for UploadThing API not implemented for fileId: ${fileId}`);
    
    // Return false to indicate deletion was not performed
    return false;
  } catch (error) {
    console.error(`Error deleting file: ${fileId}`, error);
    return false;
  }
} 