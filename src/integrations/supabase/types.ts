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
      battles: {
        Row: {
          created_at: string
          enemy_ships: Json
          id: string
          loot: Json
          ships_lost: Json
          ships_sent: Json
          target_name: string
          user_id: string
          victory: boolean
          xp_gained: number
        }
        Insert: {
          created_at?: string
          enemy_ships?: Json
          id?: string
          loot?: Json
          ships_lost?: Json
          ships_sent?: Json
          target_name: string
          user_id: string
          victory: boolean
          xp_gained?: number
        }
        Update: {
          created_at?: string
          enemy_ships?: Json
          id?: string
          loot?: Json
          ships_lost?: Json
          ships_sent?: Json
          target_name?: string
          user_id?: string
          victory?: boolean
          xp_gained?: number
        }
        Relationships: []
      }
      buildings: {
        Row: {
          id: string
          level: number
          planet_id: string
          type: string
          upgrade_finishes_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          level?: number
          planet_id: string
          type: string
          upgrade_finishes_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          level?: number
          planet_id?: string
          type?: string
          upgrade_finishes_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buildings_planet_id_fkey"
            columns: ["planet_id"]
            isOneToOne: false
            referencedRelation: "planets"
            referencedColumns: ["id"]
          },
        ]
      }
      commanders: {
        Row: {
          attack: number
          command: number
          defense: number
          engineering: number
          exploration: number
          id: string
          key: string
          level: number
          name: string
          skill_description: string
          skill_name: string
          user_id: string
          xp: number
        }
        Insert: {
          attack?: number
          command?: number
          defense?: number
          engineering?: number
          exploration?: number
          id?: string
          key: string
          level?: number
          name: string
          skill_description?: string
          skill_name?: string
          user_id: string
          xp?: number
        }
        Update: {
          attack?: number
          command?: number
          defense?: number
          engineering?: number
          exploration?: number
          id?: string
          key?: string
          level?: number
          name?: string
          skill_description?: string
          skill_name?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      fleet_ships: {
        Row: {
          fleet_id: string
          id: string
          quantity: number
          ship_type: string
          user_id: string
        }
        Insert: {
          fleet_id: string
          id?: string
          quantity?: number
          ship_type: string
          user_id: string
        }
        Update: {
          fleet_id?: string
          id?: string
          quantity?: number
          ship_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_ships_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
        ]
      }
      fleets: {
        Row: {
          arrives_at: string | null
          commander_id: string | null
          created_at: string
          id: string
          name: string
          status: string
          target_body_id: string | null
          user_id: string
        }
        Insert: {
          arrives_at?: string | null
          commander_id?: string | null
          created_at?: string
          id?: string
          name: string
          status?: string
          target_body_id?: string | null
          user_id: string
        }
        Update: {
          arrives_at?: string | null
          commander_id?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: string
          target_body_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleets_commander_id_fkey"
            columns: ["commander_id"]
            isOneToOne: false
            referencedRelation: "commanders"
            referencedColumns: ["id"]
          },
        ]
      }
      hangar: {
        Row: {
          id: string
          planet_id: string
          quantity: number
          ship_type: string
          user_id: string
        }
        Insert: {
          id?: string
          planet_id: string
          quantity?: number
          ship_type: string
          user_id: string
        }
        Update: {
          id?: string
          planet_id?: string
          quantity?: number
          ship_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hangar_planet_id_fkey"
            columns: ["planet_id"]
            isOneToOne: false
            referencedRelation: "planets"
            referencedColumns: ["id"]
          },
        ]
      }
      map_bodies: {
        Row: {
          cleared: boolean
          color: string
          defense: Json
          distance: number
          id: string
          key: string
          kind: string
          loot: Json
          name: string
          owner_type: string
          pos_x: number
          pos_y: number
          pos_z: number
          user_id: string
        }
        Insert: {
          cleared?: boolean
          color?: string
          defense?: Json
          distance?: number
          id?: string
          key: string
          kind?: string
          loot?: Json
          name: string
          owner_type?: string
          pos_x?: number
          pos_y?: number
          pos_z?: number
          user_id: string
        }
        Update: {
          cleared?: boolean
          color?: string
          defense?: Json
          distance?: number
          id?: string
          key?: string
          kind?: string
          loot?: Json
          name?: string
          owner_type?: string
          pos_x?: number
          pos_y?: number
          pos_z?: number
          user_id?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          body: string
          category: string
          id: string
          published_at: string
          title: string
          version: string
        }
        Insert: {
          body: string
          category?: string
          id?: string
          published_at?: string
          title: string
          version: string
        }
        Update: {
          body?: string
          category?: string
          id?: string
          published_at?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      planets: {
        Row: {
          biome: string
          created_at: string
          crystal: number
          energy: number
          gas: number
          id: string
          last_tick: string
          metal: number
          name: string
          user_id: string
        }
        Insert: {
          biome?: string
          created_at?: string
          crystal?: number
          energy?: number
          gas?: number
          id?: string
          last_tick?: string
          metal?: number
          name?: string
          user_id: string
        }
        Update: {
          biome?: string
          created_at?: string
          crystal?: number
          energy?: number
          gas?: number
          id?: string
          last_tick?: string
          metal?: number
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      player_missions: {
        Row: {
          claimed: boolean
          completed: boolean
          id: string
          mission_key: string
          progress: number
          user_id: string
        }
        Insert: {
          claimed?: boolean
          completed?: boolean
          id?: string
          mission_key: string
          progress?: number
          user_id: string
        }
        Update: {
          claimed?: boolean
          completed?: boolean
          id?: string
          mission_key?: string
          progress?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          commander_name: string
          created_at: string
          graphics_quality: string
          id: string
          level: number
          xp: number
        }
        Insert: {
          commander_name: string
          created_at?: string
          graphics_quality?: string
          id: string
          level?: number
          xp?: number
        }
        Update: {
          commander_name?: string
          created_at?: string
          graphics_quality?: string
          id?: string
          level?: number
          xp?: number
        }
        Relationships: []
      }
      ship_queue: {
        Row: {
          created_at: string
          finishes_at: string
          id: string
          planet_id: string
          quantity: number
          ship_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          finishes_at: string
          id?: string
          planet_id: string
          quantity?: number
          ship_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          finishes_at?: string
          id?: string
          planet_id?: string
          quantity?: number
          ship_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ship_queue_planet_id_fkey"
            columns: ["planet_id"]
            isOneToOne: false
            referencedRelation: "planets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      app_role: "player" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["player", "admin"],
    },
  },
} as const
