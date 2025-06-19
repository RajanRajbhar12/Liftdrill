import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface User {
  id: string
  email: string
  name: string
  username?: string
  bio?: string
  avatar_url?: string
  is_admin: boolean
  total_earnings: number
  challenges_won: number
  submissions_count: number
  created_at: string
  updated_at: string
}

export interface Challenge {
  id: string
  created_at: string
  title: string
  description: string
  long_description?: string
  category: string
  entry_fee: number
  prize_pool: number
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  creator_id: string
  start_date: string
  end_date: string
  max_participants: number
  scoring_method: string
  video_duration_limit: number
  prize_distribution: string
  is_public: boolean
  participants_count: number
  isNew?: boolean
  isEndingSoon?: boolean
  daysLeft?: number
  is_joined?: boolean
  has_submitted?: boolean
}

export interface Submission {
  id: string
  challenge_id: string
  user_id: string
  score: string
  video_url?: string
  notes?: string
  status: "pending" | "approved" | "rejected"
  rejection_reason?: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
}
