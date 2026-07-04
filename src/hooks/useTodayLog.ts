import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchDailyLog, localToday, upsertDailyLog } from '@/lib/dailyLog'
import { getPhaseForDate, getPhaseLabel } from '@/lib/protocol'
import type { PhaseResult } from '@/lib/protocol'
import type { DailyLog, UserProfile } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export interface UseTodayLogResult {
  profile: UserProfile | null
  log: DailyLog | null
  phase: PhaseResult
  phaseLabel: string
  loading: boolean
  toggleSupplement: (field: keyof DailyLog, value: boolean) => Promise<void>
}

// TODO: extract daily log state into a shared DailyLogContext to avoid race condition with useEveningLog on first write
export function useTodayLog(targetDate?: string): UseTodayLogResult {
  const { user } = useAuth()
  const date = targetDate ?? localToday()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [log, setLog] = useState<DailyLog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function fetchData() {
      setLoading(true)

      const [profileRes, dailyLog] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
        fetchDailyLog(user!.id, date),
      ])

      if (cancelled) return
      if (profileRes.data) setProfile(profileRes.data)
      setLog(dailyLog)
      setLoading(false)
    }

    fetchData()
    return () => { cancelled = true }
  }, [user, date])

  const phase = profile
    ? getPhaseForDate(profile.protocol_type, profile.protocol_start_date, date)
    : 'none'

  const phaseLabel = profile
    ? getPhaseLabel(profile.protocol_type, profile.protocol_start_date, date)
    : ''

  const toggleSupplement = useCallback(
    async (field: keyof DailyLog, value: boolean) => {
      if (!user) return

      const data = await upsertDailyLog(user.id, { [field]: value }, date)
      if (data) setLog(data)
    },
    [user, date]
  )

  return { profile, log, phase, phaseLabel, loading, toggleSupplement }
}
