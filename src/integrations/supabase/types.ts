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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      sessions: {
        Row: {
          audio_file_status:
            | Database["public"]["Enums"]["processing_status"]
            | null
          audio_file_url: string | null
          created_at: string
          duration: number | null
          emotion_backend: string | null
          emotion_breakdown_status:
            | Database["public"]["Enums"]["processing_status"]
            | null
          emotion_breakdown_url: string | null
          emotion_params: Json | null
          id: string
          is_favorite: boolean | null
          language: string | null
          metadata_status:
            | Database["public"]["Enums"]["processing_status"]
            | null
          participants: string[] | null
          processing_error: string | null
          session_status:
            | Database["public"]["Enums"]["processing_status"]
            | null
          source: string | null
          speaker_map: Json | null
          summarizer_backend: string | null
          summarizer_params: Json | null
          summary_preset: string | null
          summary_status:
            | Database["public"]["Enums"]["processing_status"]
            | null
          summary_url: string | null
          tags: string[] | null
          title: string
          transcript_status:
            | Database["public"]["Enums"]["processing_status"]
            | null
          transcript_url: string | null
          transcription_backend: string | null
          transcription_params: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_file_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          audio_file_url?: string | null
          created_at?: string
          duration?: number | null
          emotion_backend?: string | null
          emotion_breakdown_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          emotion_breakdown_url?: string | null
          emotion_params?: Json | null
          id?: string
          is_favorite?: boolean | null
          language?: string | null
          metadata_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          participants?: string[] | null
          processing_error?: string | null
          session_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          source?: string | null
          speaker_map?: Json | null
          summarizer_backend?: string | null
          summarizer_params?: Json | null
          summary_preset?: string | null
          summary_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          summary_url?: string | null
          tags?: string[] | null
          title: string
          transcript_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          transcript_url?: string | null
          transcription_backend?: string | null
          transcription_params?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_file_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          audio_file_url?: string | null
          created_at?: string
          duration?: number | null
          emotion_backend?: string | null
          emotion_breakdown_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          emotion_breakdown_url?: string | null
          emotion_params?: Json | null
          id?: string
          is_favorite?: boolean | null
          language?: string | null
          metadata_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          participants?: string[] | null
          processing_error?: string | null
          session_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          source?: string | null
          speaker_map?: Json | null
          summarizer_backend?: string | null
          summarizer_params?: Json | null
          summary_preset?: string | null
          summary_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          summary_url?: string | null
          tags?: string[] | null
          title?: string
          transcript_status?:
            | Database["public"]["Enums"]["processing_status"]
            | null
          transcript_url?: string | null
          transcription_backend?: string | null
          transcription_params?: Json | null
          updated_at?: string
          user_id?: string
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
      processing_status:
        | "not_started"
        | "queued"
        | "processing"
        | "completed"
        | "failed"
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
      processing_status: [
        "not_started",
        "queued",
        "processing",
        "completed",
        "failed",
      ],
    },
  },
} as const
