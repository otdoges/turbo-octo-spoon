const { createUploadthing } = require("uploadthing/server");
const { UploadThingError } = require("uploadthing");
const crypto = require('crypto');

// Import database utility for metadata storage (you'll need to implement this)
// const { storeFileMetadata, getFileMetadata, deleteFileMetadata } = require('../utils/database');

const FILE_RETENTION_MINUTES = parseInt(process.env.FILE_RETENTION_MINUTES) || 30; // Default 30 minutes
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB) || 10; // Default 10MB

// Create the uploadthing file router
const f = createUploadthing();

// Define file size constraints based on environment variables
const maxFileSize = `${MAX_FILE_SIZE_MB}MB`;

// Set up file size and expiration conditions
const uploadthing = f({
  // Define file route for images
  imageUploader: f({ 
    image: { 
      maxFileSize,
      maxFileCount: 1 
    } 
  })
  .middleware(async ({ req }) => {
    // Authenticate the request if needed
    // const user = await authenticateUser(req);
    // if (!user) throw new UploadThingError("Unauthorized");
    
    // Generate a unique ID for this file
    const fileId = crypto.randomUUID();
    
    // Generate access token
    const accessToken = crypto.randomBytes(48).toString('hex');
    
    // Set expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + FILE_RETENTION_MINUTES);

    // Return metadata to be stored with the file
    return { fileId, accessToken, expiresAt };
  })
  .onUploadComplete(async ({ metadata, file }) => {
    const { fileId, accessToken, expiresAt } = metadata;
    
    // In a production app, store metadata in a database
    // await storeFileMetadata({
    //   fileId,
    //   accessToken,
    //   expiresAt: expiresAt.toISOString(),
    //   url: file.url,
    //   key: file.key,
    //   name: file.name,
    //   size: file.size,
    //   uploadedAt: new Date().toISOString()
    // });
    
    // Return the file info with the secured URL and tokens
    return {
      fileId,
      accessToken,
      expiresAt: expiresAt.toISOString(),
      url: file.url,
      name: file.name,
      size: file.size
    };
  }),
  
  // Define additional file routes for other types if needed
  documentUploader: f({
    text: { maxFileSize },
    pdf: { maxFileSize },
    image: { maxFileSize },
  })
  .middleware(async ({ req }) => {
    // Similar authentication and metadata generation as imageUploader
    const fileId = crypto.randomUUID();
    const accessToken = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + FILE_RETENTION_MINUTES);
    
    return { fileId, accessToken, expiresAt };
  })
  .onUploadComplete(async ({ metadata, file }) => {
    const { fileId, accessToken, expiresAt } = metadata;
    
    // Same metadata storage logic as imageUploader
    
    return {
      fileId,
      accessToken,
      expiresAt: expiresAt.toISOString(),
      url: file.url,
      name: file.name,
      size: file.size
    };
  })
});

// Export for use in other modules
module.exports = {
  uploadthing
}; 