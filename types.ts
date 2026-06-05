export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          comment: string
          created_at: string
          food_rating: number
          id: string
          order_id: string | null
          service_rating: number
          user_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          food_rating?: number
          id?: string
          order_id?: string | null
          service_rating?: number
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          food_rating?: number
          id?: string
          order_id?: string | null
          service_rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string
          description: string
          diet_type: Database["public"]["Enums"]["diet_type"]
          id: string
          image_url: string
          is_available: boolean
          name: string
          prep_time_min: number
          price: number
          rating: number
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string
          diet_type?: Database["public"]["Enums"]["diet_type"]
          id?: string
          image_url?: string
          is_available?: boolean
          name: string
          prep_time_min?: number
          price: number
          rating?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          diet_type?: Database["public"]["Enums"]["diet_type"]
          id?: string
          image_url?: string
          is_available?: boolean
          name?: string
          prep_time_min?: number
          price?: number
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          menu_item_id: string | null
          name_snapshot: string
          order_id: string
          price_snapshot: number
          quantity: number
        }
        Insert: {
          id?: string
          menu_item_id?: string | null
          name_snapshot: string
          order_id: string
          price_snapshot: number
          quantity?: number
        }
        Update: {
          id?: string
          menu_item_id?: string | null
          name_snapshot?: string
          order_id?: string
          price_snapshot?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          gst: number
          id: string
          notes: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          room_number: string
          service_charge: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gst?: number
          id?: string
          notes?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          room_number?: string
          service_charge?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gst?: number
          id?: string
          notes?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          room_number?: string
          service_charge?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          loyalty_points: number
          phone: string
          room_number: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          loyalty_points?: number
          phone?: string
          room_number?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          loyalty_points?: number
          phone?: string
          room_number?: string
        }
        Relationships: []
      }
      service_items: {
        Row: {
          description: string
          duration_min: number
          id: string
          image_url: string
          is_active: boolean
          name: string
          price: number
          type: Database["public"]["Enums"]["service_type"]
        }
        Insert: {
          description?: string
          duration_min?: number
          id?: string
          image_url?: string
          is_active?: boolean
          name: string
          price?: number
          type: Database["public"]["Enums"]["service_type"]
        }
        Update: {
          description?: string
          duration_min?: number
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          price?: number
          type?: Database["public"]["Enums"]["service_type"]
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          created_at: string
          id: string
          item_name: string
          notes: string
          room_number: string
          scheduled_at: string | null
          service_item_id: string | null
          status: Database["public"]["Enums"]["service_request_status"]
          type: Database["public"]["Enums"]["service_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          notes?: string
          room_number?: string
          scheduled_at?: string | null
          service_item_id?: string | null
          status?: Database["public"]["Enums"]["service_request_status"]
          type: Database["public"]["Enums"]["service_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          notes?: string
          room_number?: string
          scheduled_at?: string | null
          service_item_id?: string | null
          status?: Database["public"]["Enums"]["service_request_status"]
          type?: Database["public"]["Enums"]["service_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_service_item_id_fkey"
            columns: ["service_item_id"]
            isOneToOne: false
            referencedRelation: "service_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "guest"
      diet_type: "veg" | "non_veg" | "vegan"
      order_status:
        | "confirmed"
        | "preparing"
        | "chef_assigned"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      payment_method:
        | "upi"
        | "credit_card"
        | "debit_card"
        | "net_banking"
        | "cod"
      payment_status: "pending" | "paid" | "failed"
      service_request_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
      service_type: "housekeeping" | "laundry" | "spa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "guest"],
      diet_type: ["veg", "non_veg", "vegan"],
      order_status: [
        "confirmed",
        "preparing",
        "chef_assigned",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_method: [
        "upi",
        "credit_card",
        "debit_card",
        "net_banking",
        "cod",
      ],
      payment_status: ["pending", "paid", "failed"],
      service_request_status: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
      ],
      service_type: ["housekeeping", "laundry", "spa"],
    },
  },
} as const
