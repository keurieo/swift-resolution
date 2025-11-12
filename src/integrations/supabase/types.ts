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
      administrators: {
        Row: {
          authority_level: number | null
          created_at: string | null
          department_id: string | null
          designation: string | null
          id: string
          user_id: string
        }
        Insert: {
          authority_level?: number | null
          created_at?: string | null
          department_id?: string | null
          designation?: string | null
          id?: string
          user_id: string
        }
        Update: {
          authority_level?: number | null
          created_at?: string | null
          department_id?: string | null
          designation?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "administrators_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_user_id: string | null
          complaint_id: string
          details: Json | null
          id: string
          timestamp: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_user_id?: string | null
          complaint_id: string
          details?: Json | null
          id?: string
          timestamp?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_user_id?: string | null
          complaint_id?: string
          details?: Json | null
          id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          contact_person: string | null
          contract_valid_till: string | null
          created_at: string | null
          email: string | null
          id: string
          is_verified: boolean | null
          name: string
          phone: string | null
          service_category: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          contract_valid_till?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean | null
          name: string
          phone?: string | null
          service_category?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          contract_valid_till?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean | null
          name?: string
          phone?: string | null
          service_category?: string | null
        }
        Relationships: []
      }
      complaints: {
        Row: {
          assigned_at: string | null
          assigned_to_company: string | null
          attachments: Json | null
          auto_escalated: boolean | null
          category: Database["public"]["Enums"]["complaint_category"]
          closed_at: string | null
          department_assigned: string | null
          description: string
          escalation_level: number | null
          id: string
          immutable_hash: string | null
          priority: Database["public"]["Enums"]["complaint_priority"] | null
          resolution_summary: string | null
          resolved_at: string | null
          reviewed_at: string | null
          sentiment_score: number | null
          sla_deadline: string | null
          status: Database["public"]["Enums"]["complaint_status"] | null
          subcategory: string | null
          submitted_at: string | null
          submitter_pseudonym_hash: string | null
          submitter_user_id: string | null
          title: string
          tracking_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to_company?: string | null
          attachments?: Json | null
          auto_escalated?: boolean | null
          category: Database["public"]["Enums"]["complaint_category"]
          closed_at?: string | null
          department_assigned?: string | null
          description: string
          escalation_level?: number | null
          id?: string
          immutable_hash?: string | null
          priority?: Database["public"]["Enums"]["complaint_priority"] | null
          resolution_summary?: string | null
          resolved_at?: string | null
          reviewed_at?: string | null
          sentiment_score?: number | null
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          subcategory?: string | null
          submitted_at?: string | null
          submitter_pseudonym_hash?: string | null
          submitter_user_id?: string | null
          title: string
          tracking_id?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to_company?: string | null
          attachments?: Json | null
          auto_escalated?: boolean | null
          category?: Database["public"]["Enums"]["complaint_category"]
          closed_at?: string | null
          department_assigned?: string | null
          description?: string
          escalation_level?: number | null
          id?: string
          immutable_hash?: string | null
          priority?: Database["public"]["Enums"]["complaint_priority"] | null
          resolution_summary?: string | null
          resolved_at?: string | null
          reviewed_at?: string | null
          sentiment_score?: number | null
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          subcategory?: string | null
          submitted_at?: string | null
          submitter_pseudonym_hash?: string | null
          submitter_user_id?: string | null
          title?: string
          tracking_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_to_company_fkey"
            columns: ["assigned_to_company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_department_assigned_fkey"
            columns: ["department_assigned"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          email: string | null
          escalation_policy: Json | null
          id: string
          name: string
          priority_thresholds: Json | null
          sla_hours_by_category: Json | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          escalation_policy?: Json | null
          id?: string
          name: string
          priority_thresholds?: Json | null
          sla_hours_by_category?: Json | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          escalation_policy?: Json | null
          id?: string
          name?: string
          priority_thresholds?: Json | null
          sla_hours_by_category?: Json | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comments: string | null
          complaint_id: string
          feedback_status: Database["public"]["Enums"]["feedback_status"]
          id: string
          rating: number | null
          reopened: boolean | null
          submitted_at: string | null
        }
        Insert: {
          comments?: string | null
          complaint_id: string
          feedback_status: Database["public"]["Enums"]["feedback_status"]
          id?: string
          rating?: number | null
          reopened?: boolean | null
          submitted_at?: string | null
        }
        Update: {
          comments?: string | null
          complaint_id?: string
          feedback_status?: Database["public"]["Enums"]["feedback_status"]
          id?: string
          rating?: number | null
          reopened?: boolean | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          department_id: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          contact_number: string | null
          created_at: string | null
          id: string
          is_anonymous_default: boolean | null
          program: string | null
          roll_number: string
          section: string | null
          user_id: string
          year_of_study: number | null
        }
        Insert: {
          contact_number?: string | null
          created_at?: string | null
          id?: string
          is_anonymous_default?: boolean | null
          program?: string | null
          roll_number: string
          section?: string | null
          user_id: string
          year_of_study?: number | null
        }
        Update: {
          contact_number?: string | null
          created_at?: string | null
          id?: string
          is_anonymous_default?: boolean | null
          program?: string | null
          roll_number?: string
          section?: string | null
          user_id?: string
          year_of_study?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      generate_tracking_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "student"
        | "department_officer"
        | "admin"
        | "ombudsperson"
        | "company_rep"
      audit_action:
        | "Submit"
        | "Review"
        | "Assign"
        | "Resolve"
        | "Close"
        | "Reopen"
        | "Escalate"
        | "Feedback"
      complaint_category:
        | "Academic"
        | "Hostel"
        | "Infrastructure"
        | "Safety"
        | "Administration"
        | "Other"
      complaint_priority: "Low" | "Medium" | "High" | "Critical"
      complaint_status:
        | "Submitted"
        | "Reviewed"
        | "Assigned"
        | "In Progress"
        | "Resolved"
        | "Closed"
        | "Reopened"
        | "Escalated"
      feedback_status: "Resolved" | "Unresolved" | "Partial"
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
      app_role: [
        "student",
        "department_officer",
        "admin",
        "ombudsperson",
        "company_rep",
      ],
      audit_action: [
        "Submit",
        "Review",
        "Assign",
        "Resolve",
        "Close",
        "Reopen",
        "Escalate",
        "Feedback",
      ],
      complaint_category: [
        "Academic",
        "Hostel",
        "Infrastructure",
        "Safety",
        "Administration",
        "Other",
      ],
      complaint_priority: ["Low", "Medium", "High", "Critical"],
      complaint_status: [
        "Submitted",
        "Reviewed",
        "Assigned",
        "In Progress",
        "Resolved",
        "Closed",
        "Reopened",
        "Escalated",
      ],
      feedback_status: ["Resolved", "Unresolved", "Partial"],
    },
  },
} as const
