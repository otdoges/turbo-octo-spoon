// Vercel-compatible UploadThing upload handler
import { createUploadthing } from "uploadthing/server";
import { UploadThingError } from "uploadthing";
import crypto from 'crypto';

// Constants
const FILE_RETENTION_MINUTES = parseInt(process.env.FILE_RETENTION_MINUTES) || 30;
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB) || 10;

// Create the uploadthing instance
const f = createUploadthing();

// Define file size constraints
const maxFileSize = `${MAX_FILE_SIZE_MB}MB`;

// Define uploadthing router for this specific endpoint
const uploadRouter = f({
  imageUploader: f({ 
    image: { 
      maxFileSize,
      maxFileCount: 1 
    } 
  })
  .middleware(async ({ req }) => {
    // Get fileId and accessToken from form data if provided
    // This is important for maintaining consistency with the secureStorage.js API
    const fileId = req.headers.get('x-file-id') || crypto.randomUUID();
    const accessToken = req.headers.get('x-access-token') || crypto.randomBytes(48).toString('hex');
    
    // Set expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + FILE_RETENTION_MINUTES);

    // Return metadata to be stored with the file
    return { fileId, accessToken, expiresAt };
  })
  .onUploadComplete(async ({ metadata, file }) => {
    const { fileId, accessToken, expiresAt } = metadata;
    
    // Return the file info with the secured URL and tokens
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

// Create the route handler
const { POST } = createRouteHandler({
  router: uploadRouter,
  config: {
    uploadthingId: process.env.UPLOADTHING_APP_ID,
    uploadthingSecret: process.env.UPLOADTHING_SECRET,
    isDev: process.env.NODE_ENV === 'development'
  }
});

// Export the request handler for Vercel
export default async function handler(req, res) {
  if (req.method === 'POST') {
    return await POST(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 