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
          email: string
          full_name: string
          role: 'lawyer' | 'client' | 'admin'
          firm_name: string | null
          bar_number: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'lawyer' | 'client' | 'admin'
          firm_name?: string | null
          bar_number?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'lawyer' | 'client' | 'admin'
          firm_name?: string | null
          bar_number?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          profile_id: string | null
          full_name: string | null
          email: string | null
          phone: string | null
          company_name: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          notes: string | null
          status: 'active' | 'inactive' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          company_name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          notes?: string | null
          status?: 'active' | 'inactive' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          company_name?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          notes?: string | null
          status?: 'active' | 'inactive' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          case_number: string
          title: string
          client_id: string | null
          lawyer_id: string | null
          case_type: 'civil' | 'criminal' | 'corporate' | 'family' | 'real_estate' | 'other'
          status: 'open' | 'pending' | 'closed' | 'archived'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          court_name: string | null
          judge_name: string | null
          opposing_counsel: string | null
          description: string | null
          opened_date: string
          closed_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_number: string
          title: string
          client_id?: string | null
          lawyer_id?: string | null
          case_type?: 'civil' | 'criminal' | 'corporate' | 'family' | 'real_estate' | 'other'
          status?: 'open' | 'pending' | 'closed' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          court_name?: string | null
          judge_name?: string | null
          opposing_counsel?: string | null
          description?: string | null
          opened_date?: string
          closed_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_number?: string
          title?: string
          client_id?: string | null
          lawyer_id?: string | null
          case_type?: 'civil' | 'criminal' | 'corporate' | 'family' | 'real_estate' | 'other'
          status?: 'open' | 'pending' | 'closed' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          court_name?: string | null
          judge_name?: string | null
          opposing_counsel?: string | null
          description?: string | null
          opened_date?: string
          closed_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      case_deadlines: {
        Row: {
          id: string
          case_id: string | null
          title: string
          description: string | null
          deadline_date: string
          deadline_type: 'filing' | 'hearing' | 'discovery' | 'meeting' | 'other'
          completed: boolean
          reminder_sent: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          title: string
          description?: string | null
          deadline_date: string
          deadline_type?: 'filing' | 'hearing' | 'discovery' | 'meeting' | 'other'
          completed?: boolean
          reminder_sent?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          title?: string
          description?: string | null
          deadline_date?: string
          deadline_type?: 'filing' | 'hearing' | 'discovery' | 'meeting' | 'other'
          completed?: boolean
          reminder_sent?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          case_id: string | null
          title: string
          description: string | null
          document_type: 'pleading' | 'motion' | 'evidence' | 'contract' | 'correspondence' | 'other'
          file_url: string | null
          file_size: number | null
          file_type: string | null
          uploaded_by: string | null
          version: number
          is_confidential: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          title: string
          description?: string | null
          document_type?: 'pleading' | 'motion' | 'evidence' | 'contract' | 'correspondence' | 'other'
          file_url?: string | null
          file_size?: number | null
          file_type?: string | null
          uploaded_by?: string | null
          version?: number
          is_confidential?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          title?: string
          description?: string | null
          document_type?: 'pleading' | 'motion' | 'evidence' | 'contract' | 'correspondence' | 'other'
          file_url?: string | null
          file_size?: number | null
          file_type?: string | null
          uploaded_by?: string | null
          version?: number
          is_confidential?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          case_id: string | null
          lawyer_id: string | null
          date: string
          hours: number
          description: string
          hourly_rate: number
          billable: boolean
          billed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          lawyer_id?: string | null
          date?: string
          hours: number
          description: string
          hourly_rate: number
          billable?: boolean
          billed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          lawyer_id?: string | null
          date?: string
          hours?: number
          description?: string
          hourly_rate?: number
          billable?: boolean
          billed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      case_notes: {
        Row: {
          id: string
          case_id: string | null
          author_id: string | null
          content: string
          note_type: 'general' | 'call' | 'meeting' | 'research' | 'strategy'
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          author_id?: string | null
          content: string
          note_type?: 'general' | 'call' | 'meeting' | 'research' | 'strategy'
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          author_id?: string | null
          content?: string
          note_type?: 'general' | 'call' | 'meeting' | 'research' | 'strategy'
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      judges: {
        Row: {
          id: string
          full_name: string
          court_name: string
          court_type: 'federal' | 'state' | 'district' | 'appellate' | 'supreme'
          division: string | null
          email: string | null
          phone: string | null
          address: string | null
          appointment_date: string | null
          bio: string | null
          procedures: string | null
          availability_notes: string | null
          status: 'active' | 'retired' | 'senior'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          court_name: string
          court_type?: 'federal' | 'state' | 'district' | 'appellate' | 'supreme'
          division?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          appointment_date?: string | null
          bio?: string | null
          procedures?: string | null
          availability_notes?: string | null
          status?: 'active' | 'retired' | 'senior'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          court_name?: string
          court_type?: 'federal' | 'state' | 'district' | 'appellate' | 'supreme'
          division?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          appointment_date?: string | null
          bio?: string | null
          procedures?: string | null
          availability_notes?: string | null
          status?: 'active' | 'retired' | 'senior'
          created_at?: string
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string | null
          case_id: string | null
          alert_type: 'deadline' | 'rule_update' | 'hearing' | 'general'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          case_id?: string | null
          alert_type?: 'deadline' | 'rule_update' | 'hearing' | 'general'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          title: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          case_id?: string | null
          alert_type?: 'deadline' | 'rule_update' | 'hearing' | 'general'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      case_judges: {
        Row: {
          id: string
          case_id: string | null
          judge_id: string | null
          role: 'presiding' | 'assigned' | 'magistrate'
          assigned_date: string
          created_at: string
        }
        Insert: {
          id?: string
          case_id?: string | null
          judge_id?: string | null
          role?: 'presiding' | 'assigned' | 'magistrate'
          assigned_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string | null
          judge_id?: string | null
          role?: 'presiding' | 'assigned' | 'magistrate'
          assigned_date?: string
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
