import { supabase } from '@/lib/supabase'
import type { DailyLog } from '@/types'

export function localToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function fetchDailyLog(userId: string, date?: string): Promise<DailyLog | null> {
  const { data } = await supabase
    .from('daily_logs').select('*')
    .eq('user_id', userId).eq('date', date ?? localToday()).single()
  return data
}

export async function upsertDailyLog(
  userId: string,
  fields: Partial<DailyLog>,
  date?: string
): Promise<DailyLog | null> {
  const { data } = await supabase
    .from('daily_logs')
    .upsert({ user_id: userId, date: date ?? localToday(), ...fields }, { onConflict: 'user_id,date' })
    .select().single()
  return data
}
