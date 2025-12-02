export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          age_range: Database["public"]["Enums"]["animal_age_range"] | null
          author_id: string
          color: string | null
          created_at: string | null
          description: string | null
          event_date: string
          id: string
          image_url: string
          is_aggressive: boolean
          is_fearful: boolean
          location_details: string | null
          poviat: string
          size: Database["public"]["Enums"]["animal_size"] | null
          special_marks: string | null
          species: Database["public"]["Enums"]["animal_species"]
          status: Database["public"]["Enums"]["announcement_status"]
          title: string
          type: Database["public"]["Enums"]["announcement_type"]
          updated_at: string | null
          voivodeship: string
        }
        Insert: {
          age_range?: Database["public"]["Enums"]["animal_age_range"] | null
          author_id: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          event_date: string
          id?: string
          image_url: string
          is_aggressive?: boolean
          is_fearful?: boolean
          location_details?: string | null
          poviat: string
          size?: Database["public"]["Enums"]["animal_size"] | null
          special_marks?: string | null
          species: Database["public"]["Enums"]["animal_species"]
          status?: Database["public"]["Enums"]["announcement_status"]
          title: string
          type: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string | null
          voivodeship: string
        }
        Update: {
          age_range?: Database["public"]["Enums"]["animal_age_range"] | null
          author_id?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string
          id?: string
          image_url?: string
          is_aggressive?: boolean
          is_fearful?: boolean
          location_details?: string | null
          poviat?: string
          size?: Database["public"]["Enums"]["animal_size"] | null
          special_marks?: string | null
          species?: Database["public"]["Enums"]["animal_species"]
          status?: Database["public"]["Enums"]["announcement_status"]
          title?: string
          type?: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string | null
          voivodeship?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          announcement_id: string
          author_id: string
          content: string
          created_at: string | null
          id: number
          is_sighting: boolean
        }
        Insert: {
          announcement_id: string
          author_id: string
          content: string
          created_at?: string | null
          id?: number
          is_sighting?: boolean
        }
        Update: {
          announcement_id?: string
          author_id?: string
          content?: string
          created_at?: string | null
          id?: number
          is_sighting?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "comments_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          phone_number: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          phone_number?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          announcement_id: string
          created_at: string | null
          id: number
          reason: string | null
          reporting_user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          id?: number
          reason?: string | null
          reporting_user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          id?: number
          reason?: string | null
          reporting_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporting_user_id_fkey"
            columns: ["reporting_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporting_user_id_fkey"
            columns: ["reporting_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_public: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_contact_details: {
        Args: { p_announcement_id: string }
        Returns: {
          email: string | null
          phone_number: string | null
        }[]
      }
    }
    Enums: {
      animal_age_range: "young" | "adult" | "senior"
      animal_size: "small" | "medium" | "large"
      animal_species: "dog" | "cat"
      announcement_status: "active" | "resolved"
      announcement_type: "lost" | "found"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      animal_age_range: ["young", "adult", "senior"],
      animal_size: ["small", "medium", "large"],
      animal_species: ["dog", "cat"],
      announcement_status: ["active", "resolved"],
      announcement_type: ["lost", "found"],
    },
  },
} as const

