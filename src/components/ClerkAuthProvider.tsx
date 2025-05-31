import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

interface ClerkAuthProviderProps {
  children: ReactNode;
}

export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing Clerk publishable key. Make sure VITE_CLERK_PUBLISHABLE_KEY is set in your .env file.');
  }

  return (
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  );
}
