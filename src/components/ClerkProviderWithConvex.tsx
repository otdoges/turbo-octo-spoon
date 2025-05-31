import { ReactNode, useEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Initialize the Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Component to sync Clerk user with Convex
const SyncUserWithConvex = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const syncUser = useMutation(api.auth.syncUser);

  useEffect(() => {
    // When auth state is loaded and user is signed in, sync with Convex
    if (isLoaded && isSignedIn) {
      // Call the syncUser action to create/update the user in Convex
      syncUser().catch(console.error);
    }
  }, [isSignedIn, isLoaded, syncUser]);

  return null;
};

// Combined provider component for both Clerk and Convex
interface ClerkProviderWithConvexProps {
  children: ReactNode;
}

export function ClerkProviderWithConvex({ children }: ClerkProviderWithConvexProps) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    throw new Error('Missing Clerk publishable key');
  }
  
  return (
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <SyncUserWithConvex />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
} 