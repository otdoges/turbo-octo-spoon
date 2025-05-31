# LuminaWeb Supabase Setup

This document provides instructions for setting up the Supabase database for the LuminaWeb application.

## Setup Steps

1. **Create a Supabase Project**:
   - Go to [Supabase Dashboard](https://app.supabase.io/)
   - Create a new project
   - Note your project URL and anon key for the next steps

2. **Set Environment Variables**:
   Create a `.env.local` file in the root of your project with the following variables:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run Database Migrations**:
   The migrations in the `supabase/migrations` directory will:
   - Create all necessary tables
   - Set up RLS (Row Level Security) policies
   - Create a storage bucket for screenshots

   You can apply these migrations using the Supabase CLI:
   ```bash
   supabase migration up
   ```

## Database Schema

The database consists of the following tables:

- **users**: Stores user information linked to Clerk authentication
- **sites**: Websites that users have submitted for transformation
- **transformations**: Individual transformations with style preferences and status
- **analytics**: Usage statistics for transformed sites
- **feedback**: User feedback on transformations
- **settings**: User preferences and settings

## Row Level Security (RLS)

All tables have RLS enabled with policies that:

1. Allow users to only access their own data
2. Prevent unauthorized access to other users' data
3. Handle special cases like public access to screenshots

## Clerk Integration

The database uses Clerk for authentication and links user accounts through the `clerk_id` field in the `users` table.

## Storage Buckets

A storage bucket named `screenshots` is set up to store:
- Original website screenshots
- Transformed website screenshots

## Getting Data Types

TypeScript types for the database schema are available in `src/api/database.types.ts`. These can be updated using the Supabase CLI:

```bash
supabase gen types typescript --schema public > src/api/database.types.ts
```

## Helper Functions

API functions for interacting with the database are available in `src/api/supabase.ts`. These include:

- User management
- Site management
- Transformation operations
- Analytics tracking
- Feedback collection
- Settings management
- File uploads 