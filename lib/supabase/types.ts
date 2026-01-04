/**
 * Supabase Database Types
 * Generated types for type-safe database queries
 */

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
      user_profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          status: 'active' | 'inactive'
          owning_user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: 'active' | 'inactive'
          owning_user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: 'active' | 'inactive'
          owning_user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      people: {
        Row: {
          id: string
          full_name: string
          role: string | null
          level: string | null
          start_date: string | null
          notes: string | null
          status: 'active' | 'inactive'
          owning_user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          role?: string | null
          level?: string | null
          start_date?: string | null
          notes?: string | null
          status?: 'active' | 'inactive'
          owning_user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: string | null
          level?: string | null
          start_date?: string | null
          notes?: string | null
          status?: 'active' | 'inactive'
          owning_user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_memberships: {
        Row: {
          id: string
          team_id: string
          person_id: string
          join_date: string
          leave_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          person_id: string
          join_date?: string
          leave_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          person_id?: string
          join_date?: string
          leave_date?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'open' | 'completed'
          due_date: string | null
          completion_date: string | null
          source: 'manual' | 'meeting_action' | 'recurring_meeting' | 'growth' | 'performance'
          priority: 'low' | 'medium' | 'high' | 'very_high'
          owning_user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'open' | 'completed'
          due_date?: string | null
          completion_date?: string | null
          source?: 'manual' | 'meeting_action' | 'recurring_meeting' | 'growth' | 'performance'
          priority?: 'low' | 'medium' | 'high' | 'very_high'
          owning_user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'open' | 'completed'
          due_date?: string | null
          completion_date?: string | null
          source?: 'manual' | 'meeting_action' | 'recurring_meeting' | 'growth' | 'performance'
          priority?: 'low' | 'medium' | 'high' | 'very_high'
          owning_user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      task_relations: {
        Row: {
          id: string
          task_id: string
          entity_type: 'person' | 'team'
          entity_id: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          entity_type: 'person' | 'team'
          entity_id: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          entity_type?: 'person' | 'team'
          entity_id?: string
          created_at?: string
        }
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
