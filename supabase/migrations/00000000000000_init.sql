-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable the pgcrypto extension for enhanced security
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE public.transformation_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.style_preference AS ENUM ('modern', 'minimal', 'professional', 'creative', 'elegant', 'bold');

-- Users table (will work with Clerk)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Sites table to track websites users are transforming
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  original_url TEXT NOT NULL,
  transformed_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Transformations table to track individual transformations
CREATE TABLE public.transformations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  original_screenshot_url TEXT NOT NULL,
  transformed_screenshot_url TEXT,
  style_preference style_preference NOT NULL,
  status transformation_status DEFAULT 'pending' NOT NULL,
  processing_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Analytics table to track views and interactions with transformed sites
CREATE TABLE public.analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  transformation_id UUID REFERENCES public.transformations(id) ON DELETE CASCADE,
  page_views INTEGER DEFAULT 0 NOT NULL,
  bounce_rate FLOAT,
  avg_time_on_site FLOAT,
  date DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Feedback table for users to provide feedback on transformations
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transformation_id UUID REFERENCES public.transformations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Settings table for user preferences
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  default_style style_preference DEFAULT 'modern' NOT NULL,
  notifications_enabled BOOLEAN DEFAULT true NOT NULL,
  theme TEXT DEFAULT 'dark' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the function to tables with updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
BEFORE UPDATE ON public.sites
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transformations_updated_at
BEFORE UPDATE ON public.transformations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" 
  ON public.users 
  FOR SELECT 
  USING (clerk_id = auth.uid());

CREATE POLICY "Users can update their own data" 
  ON public.users 
  FOR UPDATE 
  USING (clerk_id = auth.uid());

-- RLS Policies for sites table
CREATE POLICY "Users can view their own sites" 
  ON public.sites 
  FOR SELECT 
  USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()));

CREATE POLICY "Users can insert their own sites" 
  ON public.sites 
  FOR INSERT 
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()));

CREATE POLICY "Users can update their own sites" 
  ON public.sites 
  FOR UPDATE 
  USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()));

CREATE POLICY "Users can delete their own sites" 
  ON public.sites 
  FOR DELETE 
  USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()));

-- RLS Policies for transformations table
CREATE POLICY "Users can view their own transformations" 
  ON public.transformations 
  FOR SELECT 
  USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()));

CREATE POLICY "Users can insert their own transformations" 
  ON public.transformations 
  FOR INSERT 
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()));

CREATE POLICY "Users can update their own transformations" 
  ON public.transformations 
  FOR UPDATE 
  USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()));

-- RLS Policies for analytics table
CREATE POLICY "Users can view analytics for their own sites" 
  ON public.analytics 
  FOR SELECT 
  USING (site_id IN (SELECT id FROM public.sites WHERE user_id IN (
    SELECT id FROM public.users WHERE clerk_id = auth.uid()
  )));

-- RLS Policies for feedback table
CREATE POLICY "Users can view feedback for their own transformations" 
  ON public.feedback 
  FOR SELECT 
  USING (transformation_id IN (
    SELECT id FROM public.transformations WHERE user_id IN (
      SELECT id FROM public.users WHERE clerk_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert feedback for transformations" 
  ON public.feedback 
  FOR INSERT 
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()));

-- RLS Policies for settings table
CREATE POLICY "Users can view their own settings" 
  ON public.settings 
  FOR SELECT 
  USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()));

CREATE POLICY "Users can update their own settings" 
  ON public.settings 
  FOR UPDATE 
  USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()));

CREATE POLICY "Users can insert their own settings" 
  ON public.settings 
  FOR INSERT 
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()));

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('screenshots', 'screenshots', true, 10485760, '{image/png,image/jpeg,image/webp}');

-- Create RLS policy for storage bucket
CREATE POLICY "Public read access for screenshots" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'screenshots');

CREATE POLICY "Users can upload their own screenshots" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'screenshots' AND 
    auth.uid() = owner
  ); 