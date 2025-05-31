const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

// Constants
const TEMP_DIR = path.join(os.tmpdir(), 'luminaweb-temp');
const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024; // Default 10MB
const FILE_RETENTION_MS = (parseInt(process.env.FILE_RETENTION_MINUTES) || 30) * 60 * 1000; // Default 30 minutes
const ENCRYPTION_KEY = process.env.FILE_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// Create temp directory if it doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Secure random token generator
function generateToken() {
  return crypto.randomBytes(48).toString('hex');
}

// Encrypt file data
function encryptData(buffer) {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  const encrypted = Buffer.concat([
    iv,
    cipher.update(buffer),
    cipher.final()
  ]);
  
  return encrypted;
}

// Decrypt file data
function decryptData(encryptedBuffer) {
  const iv = encryptedBuffer.slice(0, 16);
  const encryptedData = encryptedBuffer.slice(16);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  return Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);
}

// Save file to temp storage with encryption
async function saveFile(buffer, originalFilename) {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  // Generate a random filename
  const fileId = uuidv4();
  const fileExtension = path.extname(originalFilename);
  const filename = `${fileId}${fileExtension}`;
  const filepath = path.join(TEMP_DIR, filename);
  
  // Encrypt and save the file
  const encryptedData = encryptData(buffer);
  await fs.promises.writeFile(filepath, encryptedData);
  
  // Schedule file deletion
  setTimeout(() => {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(`Deleted temporary file: ${filepath}`);
      }
    } catch (error) {
      console.error(`Error deleting temporary file: ${filepath}`, error);
    }
  }, FILE_RETENTION_MS);
  
  // Return the file ID and token for access
  const accessToken = generateToken();
  
  return {
    fileId,
    filename,
    accessToken,
    expiresAt: new Date(Date.now() + FILE_RETENTION_MS)
  };
}

// Get file from storage
async function getFile(fileId, accessToken) {
  const files = await fs.promises.readdir(TEMP_DIR);
  const targetFile = files.find(f => f.startsWith(fileId));
  
  if (!targetFile) {
    throw new Error('File not found or expired');
  }
  
  const filepath = path.join(TEMP_DIR, targetFile);
  const encryptedData = await fs.promises.readFile(filepath);
  
  // Decrypt the file
  return decryptData(encryptedData);
}

// Delete file immediately
async function deleteFile(fileId) {
  const files = await fs.promises.readdir(TEMP_DIR);
  const targetFile = files.find(f => f.startsWith(fileId));
  
  if (targetFile) {
    const filepath = path.join(TEMP_DIR, targetFile);
    await fs.promises.unlink(filepath);
    return true;
  }
  
  return false;
}

module.exports = {
  generateToken,
  encryptData,
  decryptData,
  saveFile,
  getFile,
  deleteFile
}; 