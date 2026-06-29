import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchTodayLog, upsertTodayLog } from '@/lib/dailyLog'
import { getTodayPhase, getPhaseLabel } from '@/lib/protocol'
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
export function useTodayLog(): UseTodayLogResult {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [log, setLog] = useState<DailyLog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function fetchData() {
      const [profileRes, dailyLog] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
        fetchTodayLog(user!.id),
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (dailyLog) setLog(dailyLog)
      setLoading(false)
    }

    fetchData()
  }, [user])

  const phase = profile
    ? getTodayPhase(profile.protocol_type, profile.protocol_start_date)
    : 'none'

  const phaseLabel = profile
    ? getPhaseLabel(profile.protocol_type, profile.protocol_start_date)
    : ''

  const toggleSupplement = useCallback(
    async (field: keyof DailyLog, value: boolean) => {
      if (!user) return

      const data = await upsertTodayLog(user.id, { [field]: value })
      if (data) setLog(data)
    },
    [user]
  )

  return { profile, log, phase, phaseLabel, loading, toggleSupplement }
}
