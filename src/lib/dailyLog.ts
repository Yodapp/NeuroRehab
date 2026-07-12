import { localDateISO } from '@/lib/date'
import { supabase } from '@/lib/supabase'
import type { DailyLog } from '@/types'

export type DailyLogUpdate = Partial<Pick<
  DailyLog,
  | 'took_psilocybin'
  | 'took_niacin'
  | 'took_lions_mane'
  | 'took_morning_meds'
  | 'energy_rating'
  | 'focus_rating'
  | 'symptom_rating'
>>

export type DailyLogBooleanField = Extract<
  keyof DailyLogUpdate,
  | 'took_psilocybin'
  | 'took_niacin'
  | 'took_lions_mane'
  | 'took_morning_meds'
>

export function localToday(): string {
  return localDateISO()
}

export async function fetchDailyLog(userId: string, date = localDateISO()): Promise<DailyLog | null> {
  const { data, error } = await supabase
    .from('daily_logs').select('*')
    .eq('user_id', userId).eq('date', date).maybeSingle()

  if (error) throw error
  return data
}

export async function upsertDailyLog(
  userId: string,
  fields: DailyLogUpdate,
  date = localDateISO()
): Promise<DailyLog | null> {
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert({ user_id: userId, date, ...fields }, { onConflict: 'user_id,date' })
    .select().single()

  if (error) throw error
  return data
}

export async function fetchTodayLog(userId: string): Promise<DailyLog | null> {
  return fetchDailyLog(userId)
}

export async function upsertTodayLog(userId: string, fields: DailyLogUpdate): Promise<DailyLog | null> {
  return upsertDailyLog(userId, fields)
}
