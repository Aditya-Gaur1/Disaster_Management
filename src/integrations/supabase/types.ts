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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      disaster_alerts: {
        Row: {
          alert_source: string | null
          created_at: string
          created_by: string | null
          description: string
          disaster_type: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          location_name: string
          longitude: number | null
          radius_km: number | null
          severity: string
          title: string
          updated_at: string
        }
        Insert: {
          alert_source?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          disaster_type: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location_name: string
          longitude?: number | null
          radius_km?: number | null
          severity: string
          title: string
          updated_at?: string
        }
        Update: {
          alert_source?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          disaster_type?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location_name?: string
          longitude?: number | null
          radius_km?: number | null
          severity?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      disaster_events: {
        Row: {
          affected_population: number | null
          created_at: string
          description: string | null
          disaster_type: string
          duration_days: number | null
          economic_damage: number | null
          event_date: string
          id: string
          latitude: number | null
          location_name: string
          longitude: number | null
          region: string
          severity: string
        }
        Insert: {
          affected_population?: number | null
          created_at?: string
          description?: string | null
          disaster_type: string
          duration_days?: number | null
          economic_damage?: number | null
          event_date: string
          id?: string
          latitude?: number | null
          location_name: string
          longitude?: number | null
          region: string
          severity: string
        }
        Update: {
          affected_population?: number | null
          created_at?: string
          description?: string | null
          disaster_type?: string
          duration_days?: number | null
          economic_damage?: number | null
          event_date?: string
          id?: string
          latitude?: number | null
          location_name?: string
          longitude?: number | null
          region?: string
          severity?: string
        }
        Relationships: []
      }
      emergency_checkins: {
        Row: {
          created_at: string
          id: string
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          message: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          message?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          message?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_insights: {
        Row: {
          confidence_score: number | null
          created_at: string
          disaster_type: string
          id: string
          priority_modules: string[]
          recommendations: string
          region: string
          risk_level: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          disaster_type: string
          id?: string
          priority_modules?: string[]
          recommendations: string
          region: string
          risk_level: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          disaster_type?: string
          id?: string
          priority_modules?: string[]
          recommendations?: string
          region?: string
          risk_level?: string
          updated_at?: string
        }
        Relationships: []
      }
      simulation_scenarios: {
        Row: {
          created_at: string
          description: string
          disaster_type: string
          id: string
          scenario_data: Json
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          disaster_type: string
          id?: string
          scenario_data: Json
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          disaster_type?: string
          id?: string
          scenario_data?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_alert_status: {
        Row: {
          alert_id: string
          created_at: string
          id: string
          location_lat: number | null
          location_lng: number | null
          status: string
          user_id: string
        }
        Insert: {
          alert_id: string
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          status: string
          user_id: string
        }
        Update: {
          alert_id?: string
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_alert_status_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "disaster_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_certifications: {
        Row: {
          certification_type: string
          earned_at: string
          id: string
          module_id: string
          percentage: number
          score: number
          user_id: string
        }
        Insert: {
          certification_type: string
          earned_at?: string
          id?: string
          module_id: string
          percentage: number
          score: number
          user_id: string
        }
        Update: {
          certification_type?: string
          earned_at?: string
          id?: string
          module_id?: string
          percentage?: number
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_scores: {
        Row: {
          attempts: number
          class_name: string | null
          completion_time: number | null
          created_at: string
          id: string
          max_score: number
          module_id: string
          school_name: string | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          class_name?: string | null
          completion_time?: number | null
          created_at?: string
          id?: string
          max_score?: number
          module_id: string
          school_name?: string | null
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          class_name?: string | null
          completion_time?: number | null
          created_at?: string
          id?: string
          max_score?: number
          module_id?: string
          school_name?: string | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_simulation_progress: {
        Row: {
          choices_made: Json
          completed: boolean
          completed_at: string | null
          current_step: string
          id: string
          scenario_id: string
          score: number | null
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          choices_made?: Json
          completed?: boolean
          completed_at?: string | null
          current_step: string
          id?: string
          scenario_id: string
          score?: number | null
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          choices_made?: Json
          completed?: boolean
          completed_at?: string | null
          current_step?: string
          id?: string
          scenario_id?: string
          score?: number | null
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_simulation_progress_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "simulation_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "teacher" | "admin"
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
      app_role: ["student", "teacher", "admin"],
    },
  },
} as const
