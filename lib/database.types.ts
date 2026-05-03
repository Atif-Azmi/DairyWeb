export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          address: string | null;
          default_milk_qty: number | null;
          custom_milk_rate: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          address?: string | null;
          default_milk_qty?: number | null;
          custom_milk_rate?: number | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: number;
          name: string;
          default_rate: number;
          unit: "liter" | "kg";
        };
        Insert: {
          id?: number;
          name: string;
          default_rate: number;
          unit: "liter" | "kg";
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      entries: {
        Row: {
          id: string;
          customer_id: string;
          product_id: number;
          date: string;
          shift: "morning" | "evening";
          quantity: number;
          price_per_unit: number;
          total_amount: number;
        };
        Insert: {
          id?: string;
          customer_id: string;
          product_id: number;
          date: string;
          shift: "morning" | "evening";
          quantity: number;
          price_per_unit: number;
        };
        Update: Partial<Database["public"]["Tables"]["entries"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "entries_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entries_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          customer_id: string;
          type: "advance" | "payment" | "adjustment";
          amount: number;
          payment_mode: "cash" | "online" | "upi";
          date: string;
          note: string | null;
        };
        Insert: {
          id?: string;
          customer_id: string;
          type: "advance" | "payment" | "adjustment";
          amount: number;
          payment_mode: "cash" | "online" | "upi";
          date?: string;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      dairy_profile: {
        Row: {
          id: number;
          dairy_name: string;
          tagline: string | null;
          address: string | null;
          phone: string | null;
          gst: string | null;
          logo_url: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          dairy_name?: string;
          tagline?: string | null;
          address?: string | null;
          phone?: string | null;
          gst?: string | null;
          logo_url?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["dairy_profile"]["Insert"]>;
        Relationships: [];
      };
      bill_shares: {
        Row: {
          id: string;
          customer_id: string;
          period_start: string;
          period_end: string;
          storage_path: string;
          created_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          customer_id: string;
          period_start: string;
          period_end: string;
          storage_path: string;
          created_at?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["bill_shares"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "bill_shares_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_settings: {
        Row: {
          key: string;
          value: string;
          updated_at: string | null;
        };
        Insert: {
          key: string;
          value: string;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["admin_settings"]["Insert"]>;
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          subscription_plan: string | null;
          subscription_status: string | null;
          subscription_start_date: string | null;
          subscription_end_date: string | null;
          trial_end_date: string | null;
          is_locked: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          subscription_plan?: string | null;
          subscription_status?: string | null;
          subscription_start_date?: string | null;
          subscription_end_date?: string | null;
          trial_end_date?: string | null;
          is_locked?: boolean | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_order_id: string | null;
          amount: number | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string | null;
          amount?: number | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      daily_customers: Database["public"]["Tables"]["customers"];
      daily_products: Database["public"]["Tables"]["products"];
      daily_entries: Database["public"]["Tables"]["entries"];
      daily_transactions: Database["public"]["Tables"]["transactions"];
      daily_profile: Database["public"]["Tables"]["dairy_profile"];
    };
    Views: Record<string, never>;
    Functions: {
      get_top_customers: {
        Args: {
          p_start: string;
          p_end: string;
        };
        Returns: {
          customer_id: string;
          name: string;
          balance: number;
        }[];
      };
      handle_subscription_payment: {
        Args: {
          p_user_id: string;
          p_plan_name: string;
          p_amount: number;
          p_order_id: string;
          p_payment_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
