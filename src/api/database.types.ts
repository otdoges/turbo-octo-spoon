export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      analytics: {
        Row: {
          id: string
          site_id: string
          transformation_id: string | null
          page_views: number
          bounce_rate: number | null
          avg_time_on_site: number | null
          date: string
        }
        Insert: {
          id?: string
          site_id: string
          transformation_id?: string | null
          page_views?: number
          bounce_rate?: number | null
          avg_time_on_site?: number | null
          date?: string
        }
        Update: {
          id?: string
          site_id?: string
          transformation_id?: string | null
          page_views?: number
          bounce_rate?: number | null
          avg_time_on_site?: number | null
          date?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_transformation_id_fkey"
            columns: ["transformation_id"]
            isOneToOne: false
            referencedRelation: "transformations"
            referencedColumns: ["id"]
          }
        ]
      }
      feedback: {
        Row: {
          id: string
          transformation_id: string
          user_id: string
          rating: number
          comments: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transformation_id: string
          user_id: string
          rating: number
          comments?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transformation_id?: string
          user_id?: string
          rating?: number
          comments?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_transformation_id_fkey"
            columns: ["transformation_id"]
            isOneToOne: false
            referencedRelation: "transformations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: {
          id: string
          user_id: string
          default_style: Database["public"]["Enums"]["style_preference"]
          notifications_enabled: boolean
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          default_style?: Database["public"]["Enums"]["style_preference"]
          notifications_enabled?: boolean
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          default_style?: Database["public"]["Enums"]["style_preference"]
          notifications_enabled?: boolean
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sites: {
        Row: {
          id: string
          user_id: string
          name: string
          original_url: string
          transformed_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          original_url: string
          transformed_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          original_url?: string
          transformed_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transformations: {
        Row: {
          id: string
          user_id: string
          site_id: string
          original_screenshot_url: string
          transformed_screenshot_url: string | null
          style_preference: Database["public"]["Enums"]["style_preference"]
          status: Database["public"]["Enums"]["transformation_status"]
          processing_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          site_id: string
          original_screenshot_url: string
          transformed_screenshot_url?: string | null
          style_preference: Database["public"]["Enums"]["style_preference"]
          status?: Database["public"]["Enums"]["transformation_status"]
          processing_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          site_id?: string
          original_screenshot_url?: string
          transformed_screenshot_url?: string | null
          style_preference?: Database["public"]["Enums"]["style_preference"]
          status?: Database["public"]["Enums"]["transformation_status"]
          processing_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transformations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      style_preference: "modern" | "minimal" | "professional" | "creative" | "elegant" | "bold"
      transformation_status: "pending" | "processing" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string
          name: string
          owner: string | null
          created_at: string | null
          updated_at: string | null
          public: boolean | null
          avif_autodetection: boolean | null
          file_size_limit: number | null
          allowed_mime_types: string[] | null
        }
        Insert: {
          id: string
          name: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          public?: boolean | null
          avif_autodetection?: boolean | null
          file_size_limit?: number | null
          allowed_mime_types?: string[] | null
        }
        Update: {
          id?: string
          name?: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          public?: boolean | null
          avif_autodetection?: boolean | null
          file_size_limit?: number | null
          allowed_mime_types?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "buckets_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      objects: {
        Row: {
          id: string
          bucket_id: string
          name: string
          owner: string | null
          created_at: string | null
          updated_at: string | null
          last_accessed_at: string | null
          metadata: Json | null
          path_tokens: string[] | null
        }
        Insert: {
          id?: string
          bucket_id: string
          name: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_accessed_at?: string | null
          metadata?: Json | null
          path_tokens?: string[] | null
        }
        Update: {
          id?: string
          bucket_id?: string
          name?: string
          owner?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_accessed_at?: string | null
          metadata?: Json | null
          path_tokens?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objects_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 