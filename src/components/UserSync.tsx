import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase client initialization (ideally in a separate src/lib/supabaseClient.ts)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error('Supabase URL or anonymous key is missing. User sync will not work. Check your .env file.');
}

const UserSync = () => {
  const { user, isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (!supabase) {
      console.log('Supabase client not initialized. Skipping user sync.');
      return;
    }

    if (isLoaded && isSignedIn && user) {
      const userData = {
        clerk_id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
        avatar_url: user.imageUrl,
        updated_at: new Date().toISOString(), // Ensure updated_at is set
      };

      // console.log('Attempting to sync user:', userData);

      supabase
        .from('users')
        .upsert(userData, { onConflict: 'clerk_id' })
        .then(({ error }) => { // `data` was previously here, removed as it's unused
          if (error) {
            console.error('Error syncing user to Supabase:', error);
          } else {
            // console.log('User synced successfully to Supabase:', data);
          }
        });
    }
  }, [user, isSignedIn, isLoaded]);

  return null; // This component does not render anything
};

export default UserSync;
