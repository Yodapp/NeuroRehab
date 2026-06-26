import { supabase } from '@/lib/supabase'
import type { DailyLog } from '@/types'

const today = new Date().toISOString().slice(0, 10)

export async function fetchTodayLog(userId: string): Promise<DailyLog | null> {
  const { data } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  return data
}

export async function upsertTodayLog(
  userId: string,
  fields: Partial<DailyLog>
): Promise<DailyLog | null> {
  const { data } = await supabase
    .from('daily_logs')
    .upsert(
      { user_id: userId, date: today, ...fields },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single()
  return data
}
