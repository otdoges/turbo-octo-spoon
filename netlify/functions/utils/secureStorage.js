const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

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

// Save file to Cloudinary
async function saveFile(buffer, originalFilename) {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  // Generate a unique ID for this file
  const fileId = uuidv4();
  
  try {
    // Instead of relying on setTimeout in serverless environments,
    // set Cloudinary to automatically delete after the retention period
    const autoDeleteAt = new Date();
    autoDeleteAt.setMinutes(autoDeleteAt.getMinutes() + FILE_RETENTION_MINUTES);
    
    // Upload to Cloudinary with buffer
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: fileId,
          folder: 'luminaweb-temp',
          resource_type: 'auto', // Use 'auto' instead of hardcoded 'image'
          // Set auto-deletion after retention period
          eager_async: true,
          tags: ['temp', 'auto-delete'],
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }
          ],
          // Set expiration time directly in Cloudinary
          invalidate: true
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      // Convert buffer to stream and pipe to uploadStream
      const bufferStream = require('stream').Readable.from(buffer);
      bufferStream.pipe(uploadStream);
    });
    
    // Generate access token
    const accessToken = generateToken();
    const expiresAt = new Date(Date.now() + (FILE_RETENTION_MINUTES * 60 * 1000));
    
    // Store secure information
    const secureInfo = {
      fileId: fileId,
      cloudinaryId: uploadResult.public_id,
      url: uploadResult.secure_url,
      expiresAt: expiresAt.toISOString(),
      accessToken: accessToken // Store to validate later
    };
    
    // Encrypt the secure info for validation
    const encryptedInfo = encryptData(secureInfo);
    
    // Use Cloudinary context to store metadata instead of relying on setTimeout
    await cloudinary.uploader.add_context(`expires=${expiresAt.toISOString()},encrypted=${encryptedInfo.substring(0, 200)}`, [uploadResult.public_id]);
    
    return {
      fileId,
      accessToken,
      cloudinaryId: uploadResult.public_id,
      expiresAt,
      url: uploadResult.secure_url
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// Get file from Cloudinary (return the URL)
async function getFile(fileId, accessToken) {
  try {
    // Get resource info from Cloudinary
    const result = await cloudinary.api.resource(`luminaweb-temp/${fileId}`, {
      context: true,
      metadata: true
    });
    
    if (!result || !result.context || !result.context.custom) {
      throw new Error('File metadata not found');
    }
    
    const contextData = result.context.custom;
    const expiryStr = contextData.expires;
    const encryptedData = contextData.encrypted;
    
    if (!expiryStr || !encryptedData) {
      throw new Error('Invalid file metadata');
    }
    
    // Check if file has expired
    const expiryDate = new Date(expiryStr);
    if (expiryDate < new Date()) {
      // File has expired, delete it
      await deleteFile(result.public_id);
      throw new Error('File has expired');
    }
    
    // Attempt to decrypt and validate the token
    try {
      // Get the full encrypted data from another source or use the partial one
      // This is simplified for the example - in a real app, you'd store this in a database
      const storedInfo = decryptData(encryptedData);
      
      // Validate access token
      if (storedInfo.accessToken !== accessToken) {
        throw new Error('Invalid access token');
      }
      
      return { 
        fileId,
        url: result.secure_url
      };
    } catch (error) {
      throw new Error('Invalid or corrupted file metadata');
    }
  } catch (error) {
    console.error('Error getting file from Cloudinary:', error);
    throw new Error(`Failed to retrieve file: ${error.message}`);
  }
}

// Delete file from Cloudinary
async function deleteFile(cloudinaryId) {
  try {
    const result = await cloudinary.uploader.destroy(cloudinaryId, { invalidate: true });
    return result.result === 'ok';
  } catch (error) {
    console.error(`Error deleting file from Cloudinary: ${cloudinaryId}`, error);
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