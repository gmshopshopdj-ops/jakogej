import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// Create client with fallback for demo mode
let supabaseClient;
try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.warn('Supabase connection failed, using demo mode');
  // Create a mock client for demo purposes
  supabaseClient = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null }),
      order: () => ({ data: [], error: null })
    })
  };
}

export const supabase = supabaseClient;

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          category: string;
          image_url: string;
          created_at: string;
          original_price: number;
          show_fake_discount: boolean;
          stock_quantity: number;
          track_stock: boolean;
          low_stock_threshold: number;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          category: string;
          image_url: string;
          created_at?: string;
          original_price?: number;
          show_fake_discount?: boolean;
          stock_quantity?: number;
          track_stock?: boolean;
          low_stock_threshold?: number;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          category?: string;
          image_url?: string;
          created_at?: string;
          original_price?: number;
          show_fake_discount?: boolean;
          stock_quantity?: number;
          track_stock?: boolean;
          low_stock_threshold?: number;
        };
      };
      orders: {
        Row: {
          id: string;
          order_code: string;
          items: any;
          total_amount: number;
          customer_email: string;
          discount_code: string | null;
          discount_amount: number;
          referral_code: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_code: string;
          items: any;
          total_amount: number;
          customer_email: string;
          discount_code?: string | null;
          discount_amount?: number;
          referral_code?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_code?: string;
          items?: any;
          total_amount?: number;
          customer_email?: string;
          discount_code?: string | null;
          discount_amount?: number;
          referral_code?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      discount_codes: {
        Row: {
          id: string;
          code: string;
          discount_percentage: number;
          discount_type: string;
          fixed_amount: number;
          usage_count: number;
          max_usage: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_percentage: number;
          discount_type?: string;
          fixed_amount?: number;
          usage_count?: number;
          max_usage?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_percentage?: number;
          discount_type?: string;
          fixed_amount?: number;
          usage_count?: number;
          max_usage?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      referral_users: {
        Row: {
          id: string;
          username: string;
          email: string;
          password_hash: string;
          referral_code: string;
          credit_balance: number;
          credit_per_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          password_hash: string;
          referral_code: string;
          credit_balance?: number;
          credit_per_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          password_hash?: string;
          referral_code?: string;
          credit_balance?: number;
          credit_per_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      referral_orders: {
        Row: {
          id: string;
          referral_user_id: string;
          order_id: string;
          credit_earned: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          referral_user_id: string;
          order_id: string;
          credit_earned?: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          referral_user_id?: string;
          order_id?: string;
          credit_earned?: number;
          status?: string;
          created_at?: string;
        };
      };
    };
  };
};