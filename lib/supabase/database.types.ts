// GENERATED FILE — DO NOT EDIT.
//
// Regenerate with `pnpm db:types` after adding a migration. CI runs
// `pnpm db:types:check`, which rebuilds the schema from zero and fails if
// this file has drifted from the migrations.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_user: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          center_id: string
          detail: Json | null
          entity_id: string | null
          entity_type: string
          id: number
          occurred_at: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          center_id: string
          detail?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: number
          occurred_at?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          center_id?: string
          detail?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: number
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center"
            referencedColumns: ["id"]
          },
        ]
      }
      center: {
        Row: {
          created_at: string
          created_by: string | null
          decal_license_no: string | null
          deleted_at: string | null
          id: string
          name: string
          organization_id: string
          time_zone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          decal_license_no?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          organization_id: string
          time_zone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          decal_license_no?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          time_zone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      child: {
        Row: {
          center_id: string
          created_at: string
          created_by: string | null
          date_of_birth: string
          deleted_at: string | null
          first_name: string
          home_language: string | null
          id: string
          last_name: string
          name_pronunciation: string | null
          photo_consent: boolean
          photo_path: string | null
          preferred_name: string | null
          updated_at: string
        }
        Insert: {
          center_id: string
          created_at?: string
          created_by?: string | null
          date_of_birth: string
          deleted_at?: string | null
          first_name: string
          home_language?: string | null
          id?: string
          last_name: string
          name_pronunciation?: string | null
          photo_consent?: boolean
          photo_path?: string | null
          preferred_name?: string | null
          updated_at?: string
        }
        Update: {
          center_id?: string
          created_at?: string
          created_by?: string | null
          date_of_birth?: string
          deleted_at?: string | null
          first_name?: string
          home_language?: string | null
          id?: string
          last_name?: string
          name_pronunciation?: string | null
          photo_consent?: boolean
          photo_path?: string | null
          preferred_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom: {
        Row: {
          age_band: number
          capacity: number | null
          center_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_ga_prek: boolean
          name: string
          updated_at: string
        }
        Insert: {
          age_band: number
          capacity?: number | null
          center_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_ga_prek?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          age_band?: number
          capacity?: number | null
          center_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_ga_prek?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment: {
        Row: {
          center_id: string
          child_id: string
          classroom_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          ended_on: string | null
          ended_reason: string | null
          id: string
          program_start: string
          started_on: string
          updated_at: string
        }
        Insert: {
          center_id: string
          child_id: string
          classroom_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          ended_on?: string | null
          ended_reason?: string | null
          id?: string
          program_start: string
          started_on: string
          updated_at?: string
        }
        Update: {
          center_id?: string
          child_id?: string
          classroom_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          ended_on?: string | null
          ended_reason?: string | null
          id?: string
          program_start?: string
          started_on?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classroom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
        ]
      }
      gelds_domain: {
        Row: {
          domain_code: string
          domain_name: string
          gelds_version: string
          id: string
          sort_order: number
        }
        Insert: {
          domain_code: string
          domain_name: string
          gelds_version: string
          id?: string
          sort_order?: number
        }
        Update: {
          domain_code?: string
          domain_name?: string
          gelds_version?: string
          id?: string
          sort_order?: number
        }
        Relationships: []
      }
      gelds_indicator: {
        Row: {
          age_band: number
          domain_code: string
          full_code: string
          gelds_version: string
          id: string
          indicator_letter: string | null
          indicator_text: string
          plain_text: string | null
          search_vector: unknown
          standard_id: string | null
          standard_number: number
          strand_id: string | null
          subdomain_code: string | null
        }
        Insert: {
          age_band: number
          domain_code: string
          full_code: string
          gelds_version: string
          id?: string
          indicator_letter?: string | null
          indicator_text: string
          plain_text?: string | null
          search_vector?: unknown
          standard_id?: string | null
          standard_number: number
          strand_id?: string | null
          subdomain_code?: string | null
        }
        Update: {
          age_band?: number
          domain_code?: string
          full_code?: string
          gelds_version?: string
          id?: string
          indicator_letter?: string | null
          indicator_text?: string
          plain_text?: string | null
          search_vector?: unknown
          standard_id?: string | null
          standard_number?: number
          strand_id?: string | null
          subdomain_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gelds_indicator_standard_id_fkey"
            columns: ["standard_id"]
            isOneToOne: false
            referencedRelation: "gelds_standard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gelds_indicator_strand_id_fkey"
            columns: ["strand_id"]
            isOneToOne: false
            referencedRelation: "gelds_strand"
            referencedColumns: ["id"]
          },
        ]
      }
      gelds_standard: {
        Row: {
          domain_code: string
          gelds_version: string
          id: string
          standard_number: number
          standard_text: string
          strand_id: string | null
          subdomain_code: string | null
        }
        Insert: {
          domain_code: string
          gelds_version: string
          id?: string
          standard_number: number
          standard_text: string
          strand_id?: string | null
          subdomain_code?: string | null
        }
        Update: {
          domain_code?: string
          gelds_version?: string
          id?: string
          standard_number?: number
          standard_text?: string
          strand_id?: string | null
          subdomain_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gelds_standard_strand_id_fkey"
            columns: ["strand_id"]
            isOneToOne: false
            referencedRelation: "gelds_strand"
            referencedColumns: ["id"]
          },
        ]
      }
      gelds_strand: {
        Row: {
          domain_code: string
          gelds_version: string
          id: string
          sort_order: number
          strand_name: string
          subdomain_code: string | null
        }
        Insert: {
          domain_code: string
          gelds_version: string
          id?: string
          sort_order?: number
          strand_name: string
          subdomain_code?: string | null
        }
        Update: {
          domain_code?: string
          gelds_version?: string
          id?: string
          sort_order?: number
          strand_name?: string
          subdomain_code?: string | null
        }
        Relationships: []
      }
      organization: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          center_id: string
          classroom_ids: string[]
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          center_id: string
          classroom_ids?: string[]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          center_id?: string
          classroom_ids?: string[]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      child_current_classroom: {
        Row: {
          center_id: string | null
          child_id: string | null
          classroom_id: string | null
          started_on: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "center"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollment_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classroom"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auth_can_see_child: {
        Args: { c: string; child: string }
        Returns: boolean
      }
      auth_centers: { Args: never; Returns: string[] }
      auth_is_director: { Args: { c: string }; Returns: boolean }
      auth_role: { Args: { c: string }; Returns: string }
      auth_scoped_child_ids: { Args: never; Returns: string[] }
      dearmor: { Args: { "": string }; Returns: string }
      gen_random_uuid: { Args: never; Returns: string }
      gen_salt: { Args: { "": string }; Returns: string }
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
    }
    Enums: {
      staff_role: "teacher" | "lead_teacher" | "director" | "org_admin"
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
      staff_role: ["teacher", "lead_teacher", "director", "org_admin"],
    },
  },
} as const

