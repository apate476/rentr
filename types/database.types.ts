// ============================================================
// AUTO-GENERATED: Run `npx supabase gen types typescript`
// after connecting to your Supabase project to replace this file.
// This is a placeholder so TypeScript doesn't complain before setup.
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          is_premium: boolean
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          is_premium?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          is_premium?: boolean
          created_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          address: string
          city: string
          state: string
          zip: string | null
          country: string
          lat: number
          lng: number
          created_by: string
          created_at: string
          property_type: 'apartment' | 'condo' | 'house' | 'townhouse' | 'other' | null
          review_count: number
          avg_overall: number | null
          avg_value: number | null
          avg_landlord: number | null
          avg_noise: number | null
          avg_pests: number | null
          avg_safety: number | null
          avg_parking: number | null
          avg_pets: number | null
          avg_neighborhood: number | null
        }
        Insert: {
          id?: string
          address: string
          city: string
          state: string
          zip?: string | null
          country?: string
          lat: number
          lng: number
          created_by: string
          created_at?: string
          property_type?: 'apartment' | 'condo' | 'house' | 'townhouse' | 'other' | null
          review_count?: number
          avg_overall?: number | null
          avg_value?: number | null
          avg_landlord?: number | null
          avg_noise?: number | null
          avg_pests?: number | null
          avg_safety?: number | null
          avg_parking?: number | null
          avg_pets?: number | null
          avg_neighborhood?: number | null
        }
        Update: {
          id?: string
          address?: string
          city?: string
          state?: string
          zip?: string | null
          country?: string
          lat?: number
          lng?: number
          created_by?: string
          created_at?: string
          property_type?: 'apartment' | 'condo' | 'house' | 'townhouse' | 'other' | null
          review_count?: number
          avg_overall?: number | null
          avg_value?: number | null
          avg_landlord?: number | null
          avg_noise?: number | null
          avg_pests?: number | null
          avg_safety?: number | null
          avg_parking?: number | null
          avg_pets?: number | null
          avg_neighborhood?: number | null
        }
      }
      reviews: {
        Row: {
          id: string
          property_id: string
          user_id: string
          score_overall: number
          score_value: number
          score_landlord: number
          score_noise: number
          score_pests: number
          score_safety: number
          score_parking: number
          score_pets: number
          score_neighborhood: number
          body: string
          rent_amount: number | null
          move_in_year: number | null
          move_out_year: number | null
          lease_type: 'month-to-month' | '1-year' | '2-year' | 'other' | null
          would_rent_again: boolean | null
          helpful_count: number
          comment_count: number
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          score_overall: number
          score_value: number
          score_landlord: number
          score_noise: number
          score_pests: number
          score_safety: number
          score_parking: number
          score_pets: number
          score_neighborhood: number
          body: string
          rent_amount?: number | null
          move_in_year?: number | null
          move_out_year?: number | null
          lease_type?: 'month-to-month' | '1-year' | '2-year' | 'other' | null
          would_rent_again?: boolean | null
          helpful_count?: number
          comment_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          score_overall?: number
          score_value?: number
          score_landlord?: number
          score_noise?: number
          score_pests?: number
          score_safety?: number
          score_parking?: number
          score_pets?: number
          score_neighborhood?: number
          body?: string
          rent_amount?: number | null
          move_in_year?: number | null
          move_out_year?: number | null
          lease_type?: 'month-to-month' | '1-year' | '2-year' | 'other' | null
          would_rent_again?: boolean | null
          helpful_count?: number
          comment_count?: number
          created_at?: string
        }
      }
      review_photos: {
        Row: {
          id: string
          review_id: string
          storage_url: string
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          storage_url: string
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          storage_url?: string
          created_at?: string
        }
      }
      review_comments: {
        Row: {
          id: string
          review_id: string
          user_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          body?: string
          created_at?: string
        }
      }
      helpful_votes: {
        Row: {
          id: string
          review_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          created_at?: string
        }
      }
      saved_properties: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          created_at?: string
        }
      }
    }
  }
}
