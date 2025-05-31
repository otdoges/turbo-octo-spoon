import React from 'react';
import { UploadThingProvider as UTProvider } from '@uploadthing/react';

// Wrap your application or component with this provider
export const UploadThingProvider = ({ children }) => {
  return (
    <UTProvider
      uploadthingId={import.meta.env.VITE_UPLOADTHING_APP_ID}
      // This will work with both Netlify and Vercel
      uploadthingUrl={
        // Use a relative path that works in both environments
        "/api/uploadthing"
      }
    >
      {children}
    </UTProvider>
  );
};

export default UploadThingProvider; 