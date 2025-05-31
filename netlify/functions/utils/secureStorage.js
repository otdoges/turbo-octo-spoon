const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const FormData = require('form-data');

// Constants
const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024; // Default 10MB
const FILE_RETENTION_MINUTES = parseInt(process.env.FILE_RETENTION_MINUTES) || 30; // Default 30 minutes

// Generate a strong encryption key if not provided
// In production, always set this environment variable
if (!process.env.FILE_ENCRYPTION_KEY) {
  console.warn('WARNING: No FILE_ENCRYPTION_KEY environment variable set. Using a generated key. This is insecure for production use.');
}
const ENCRYPTION_KEY = process.env.FILE_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// Secure random token generator
function generateToken() {
  return crypto.randomBytes(48).toString('hex');
}

// Encrypt file data for secure storage information
function encryptData(data) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt data
function decryptData(encryptedText) {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

// Save file using UploadThing
async function saveFile(buffer, originalFilename) {
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
    
    formData.append('file', buffer, {
      filename: originalFilename || `${fileId}.${fileExtension}`,
      contentType,
    });
    
    // Add metadata
    formData.append('fileId', fileId);
    formData.append('accessToken', accessToken);
    formData.append('expiresAt', expiresAt.toISOString());
    
    // Use environment variable for the API URL with proper fallback
    const apiUrl = process.env.UPLOAD_API_URL || 
                 (process.env.NODE_ENV === 'production' 
                  ? `${process.env.URL}/.netlify/functions/uploadthing/api`
                  : 'http://localhost:8888/.netlify/functions/uploadthing/api');
    
    // Call our UploadThing serverless function
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'x-uploadthing-route': 'imageUploader',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.url) {
      throw new Error('Upload response missing URL');
    }
    
    // In a production environment, you would store this metadata in a database
    // For example, using Supabase, MongoDB, or another database service
    // TODO: Implement database storage for file metadata
    
    return {
      fileId,
      accessToken,
      expiresAt,
      url: result.url
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// Get file from UploadThing (return the URL)
async function getFile(fileId, accessToken) {
  if (!fileId || !accessToken) {
    throw new Error('Missing required parameters: fileId and accessToken');
  }
  
  try {
    // IMPORTANT: In a production environment, you must implement proper storage
    // and retrieval of file metadata, including validation of access tokens.
    // 
    // Example pseudo-code for database implementation:
    // const fileMetadata = await database.getFileMetadata(fileId);
    // if (!fileMetadata) throw new Error('File not found');
    // if (fileMetadata.accessToken !== accessToken) throw new Error('Invalid access token');
    // if (new Date(fileMetadata.expiresAt) < new Date()) throw new Error('File has expired');
    // return { fileId, url: fileMetadata.url };
    
    // For UploadThing files, construct the URL using their pattern
    // Note: This URL format might change - refer to UploadThing documentation
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
async function deleteFile(fileId) {
  if (!fileId) {
    throw new Error('Missing required parameter: fileId');
  }
  
  try {
    // UploadThing offers deletion via their dashboard and API
    // For programmatic deletion, you would need to implement their API
    // See: https://docs.uploadthing.com/api-reference/
    
    // TODO: Implement UploadThing deletion API when available
    console.warn(`File deletion for UploadThing API not implemented for fileId: ${fileId}`);
    
    // In production, you should also remove metadata from your database
    // Example: await database.deleteFileMetadata(fileId);
    
    // Return false to indicate deletion was not performed
    return false;
  } catch (error) {
    console.error(`Error deleting file: ${fileId}`, error);
    return false;
  }
}

module.exports = {
  generateToken,
  encryptData,
  decryptData,
  saveFile,
  getFile,
  deleteFile
}; 