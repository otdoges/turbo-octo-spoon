import React from 'react';
import { UploadThingProvider as UTProvider } from '@uploadthing/react';

// Wrap your application or component with this provider
export const UploadThingProvider = ({ children }) => {
  return (
    <UTProvider
      uploadthingId={import.meta.env.VITE_UPLOADTHING_APP_ID}
    >
      {children}
    </UTProvider>
  );
};

export default UploadThingProvider; 