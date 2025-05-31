import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Type definitions for our tables
export type User = Database['public']['Tables']['users']['Row'];
export type Site = Database['public']['Tables']['sites']['Row'];
export type Transformation = Database['public']['Tables']['transformations']['Row'];
export type Analytics = Database['public']['Tables']['analytics']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];
export type Settings = Database['public']['Tables']['settings']['Row'];
export type StylePreference = Database['public']['Enums']['style_preference'];
export type TransformationStatus = Database['public']['Enums']['transformation_status'];

// Helper function to create or get a user profile when someone logs in with Clerk
export async function createOrGetUser(clerkId: string, email: string, displayName?: string, avatarUrl?: string) {
  // First check if user exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching user:', fetchError);
    throw fetchError;
  }
  
  // If user exists, return it
  if (existingUser) {
    return existingUser;
  }
  
  // If user doesn't exist, create a new one
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      clerk_id: clerkId,
      email,
      display_name: displayName || email.split('@')[0],
      avatar_url: avatarUrl
    })
    .select()
    .single();
  
  if (insertError) {
    console.error('Error creating user:', insertError);
    throw insertError;
  }
  
  // Create default settings for the new user
  await supabase
    .from('settings')
    .insert({
      user_id: newUser.id
    });
  
  return newUser;
}

// Site management functions
export async function createSite(userId: string, name: string, originalUrl: string) {
  const { data, error } = await supabase
    .from('sites')
    .insert({
      user_id: userId,
      name,
      original_url: originalUrl
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating site:', error);
    throw error;
  }
  
  return data;
}

export async function getUserSites(userId: string) {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching sites:', error);
    throw error;
  }
  
  return data || [];
}

// Transformation functions
export async function createTransformation(
  userId: string, 
  siteId: string, 
  originalScreenshotUrl: string, 
  stylePreference: StylePreference
) {
  const { data, error } = await supabase
    .from('transformations')
    .insert({
      user_id: userId,
      site_id: siteId,
      original_screenshot_url: originalScreenshotUrl,
      style_preference: stylePreference,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating transformation:', error);
    throw error;
  }
  
  return data;
}

export async function updateTransformationStatus(
  transformationId: string, 
  status: TransformationStatus, 
  transformedScreenshotUrl?: string,
  processingData?: any
) {
  const updateData: Partial<Transformation> = {
    status,
    ...(transformedScreenshotUrl && { transformed_screenshot_url: transformedScreenshotUrl }),
    ...(processingData && { processing_data: processingData })
  };
  
  const { data, error } = await supabase
    .from('transformations')
    .update(updateData)
    .eq('id', transformationId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating transformation:', error);
    throw error;
  }
  
  return data;
}

export async function getUserTransformations(userId: string) {
  const { data, error } = await supabase
    .from('transformations')
    .select(`
      *,
      sites (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching transformations:', error);
    throw error;
  }
  
  return data || [];
}

// Analytics functions
export async function recordPageView(siteId: string, transformationId?: string) {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if we already have an analytics record for today
  const { data: existingRecord } = await supabase
    .from('analytics')
    .select('*')
    .eq('site_id', siteId)
    .eq('date', today)
    .maybeSingle();
  
  if (existingRecord) {
    // Update existing record
    const { error } = await supabase
      .from('analytics')
      .update({
        page_views: existingRecord.page_views + 1
      })
      .eq('id', existingRecord.id);
    
    if (error) {
      console.error('Error updating analytics:', error);
    }
  } else {
    // Create new record
    const { error } = await supabase
      .from('analytics')
      .insert({
        site_id: siteId,
        transformation_id: transformationId,
        page_views: 1
      });
    
    if (error) {
      console.error('Error creating analytics record:', error);
    }
  }
}

export async function getSiteAnalytics(siteId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('site_id', siteId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });
  
  if (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
  
  return data || [];
}

// Feedback functions
export async function submitFeedback(userId: string, transformationId: string, rating: number, comments?: string) {
  const { data, error } = await supabase
    .from('feedback')
    .insert({
      user_id: userId,
      transformation_id: transformationId,
      rating,
      comments
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
  
  return data;
}

// Settings functions
export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
  
  return data;
}

export async function updateUserSettings(
  userId: string, 
  updates: Partial<Omit<Settings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
) {
  const { data, error } = await supabase
    .from('settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
  
  return data;
}

// Storage functions for screenshot uploads
export async function uploadScreenshot(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('screenshots')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Error uploading screenshot:', error);
    throw error;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('screenshots')
    .getPublicUrl(data.path);
  
  return publicUrl;
}

// Initialize Supabase auth with Clerk
export async function initSupabaseAuth() {
  // This function would be called when a user authenticates with Clerk
  // to set the custom JWT in Supabase
  // Implementation depends on how you've set up Clerk integration
} 