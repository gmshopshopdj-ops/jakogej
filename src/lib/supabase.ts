import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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