export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          age: number | null
          gender: string | null
          city: string | null
          district: string | null
          avatar_url: string | null
          bio: string | null
          sports: string[]
          skill_level: 'Beginner' | 'Intermediate' | 'Advanced'
          availability: string[]
          rating: number
          games_played: number
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          age?: number | null
          gender?: string | null
          city?: string | null
          district?: string | null
          avatar_url?: string | null
          bio?: string | null
          sports?: string[]
          skill_level?: 'Beginner' | 'Intermediate' | 'Advanced'
          availability?: string[]
          rating?: number
          games_played?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number | null
          gender?: string | null
          city?: string | null
          district?: string | null
          avatar_url?: string | null
          bio?: string | null
          sports?: string[]
          skill_level?: 'Beginner' | 'Intermediate' | 'Advanced'
          availability?: string[]
          rating?: number
          games_played?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      games: {
        Row: {
          id: string
          sport: string
          host_id: string
          venue: string
          district: string
          date: string
          time: string
          duration: number
          skill_level: 'Beginner' | 'Intermediate' | 'Advanced'
          max_players: number
          current_players: number
          description: string | null
          entry_fee: number
          is_public: boolean
          beginner_friendly: boolean
          equipment_required: string | null
          lat: number | null
          lng: number | null
          created_at: string
        }
        Insert: {
          id?: string
          sport: string
          host_id: string
          venue: string
          district: string
          date: string
          time: string
          duration: number
          skill_level: 'Beginner' | 'Intermediate' | 'Advanced'
          max_players: number
          current_players?: number
          description?: string | null
          entry_fee?: number
          is_public?: boolean
          beginner_friendly?: boolean
          equipment_required?: string | null
          lat?: number | null
          lng?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['games']['Insert']>
      }
      game_participants: {
        Row: {
          game_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          game_id: string
          user_id: string
          joined_at?: string
        }
        Update: Partial<Database['public']['Tables']['game_participants']['Insert']>
      }
      messages: {
        Row: {
          id: string
          game_id: string
          user_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          user_id: string
          text: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      communities: {
        Row: {
          id: string
          name: string
          sport: string
          district: string
          member_count: number
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          sport: string
          district: string
          member_count?: number
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['communities']['Insert']>
      }
      ratings: {
        Row: {
          id: string
          game_id: string | null
          rater_id: string
          rated_id: string
          friendly: number | null
          skill: number | null
          punctuality: number | null
          sportsmanship: number | null
          would_play_again: boolean | null
          overall: number | null
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          game_id?: string | null
          rater_id: string
          rated_id: string
          friendly?: number | null
          skill?: number | null
          punctuality?: number | null
          sportsmanship?: number | null
          would_play_again?: boolean | null
          overall?: number | null
          comment?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['ratings']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
