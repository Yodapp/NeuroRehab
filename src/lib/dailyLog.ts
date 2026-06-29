import { supabase } from '@/lib/supabase'
import type { DailyLog } from '@/types'

function localToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function fetchTodayLog(userId: string): Promise<DailyLog | null> {
  const { data } = await supabase
    .from('daily_logs').select('*')
    .eq('user_id', userId).eq('date', localToday()).single()
  return data
}

export async function upsertTodayLog(userId: string, fields: Partial<DailyLog>): Promise<DailyLog | null> {
  const { data } = await supabase
    .from('daily_logs')
    .upsert({ user_id: userId, date: localToday(), ...fields }, { onConflict: 'user_id,date' })
    .select().single()
  return data
}
