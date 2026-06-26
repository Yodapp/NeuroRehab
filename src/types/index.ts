export type ProtocolType = 'stamets_4_3' | 'onward_5_2' | 'custom' | 'none'

export type ActivityCategory =
  | 'attention_memory'
  | 'logic_problem_solving'
  | 'fine_motor_focus'
  | 'physical'

export interface UserProfile {
  id: string
  created_at: string
  protocol_type: ProtocolType
  protocol_start_date: string
  enabled_supplements: string[]
}

export interface Activity {
  id: string
  name: string
  categories: ActivityCategory[]
  description: string
  external_url?: string
  is_default: boolean
}

export interface UserActivity {
  id: string
  user_id: string
  activity_id: string
  is_enabled: boolean
}

export interface DailyLog {
  id: string
  user_id: string
  date: string
  took_psilocybin: boolean
  took_niacin: boolean
  took_lions_mane: boolean
  took_morning_meds: boolean
  energy_rating: number
  focus_rating: number
  symptom_rating: number
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  daily_log_id: string
  activity_id: string
  completed: boolean
}
