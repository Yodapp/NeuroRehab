import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchTodayLog, upsertTodayLog } from '@/lib/dailyLog'
import { useAuth } from '@/contexts/AuthContext'
import type { Activity, DailyLog } from '@/types'

export interface ActivityWithStatus extends Activity {
  completed: boolean
}

export interface UseEveningLogResult {
  activities: ActivityWithStatus[]
  log: DailyLog | null
  loading: boolean
  toggleActivity: (activityId: string, completed: boolean) => Promise<void>
  updateRating: (field: 'energy_rating' | 'focus_rating' | 'symptom_rating', value: number) => Promise<void>
}

// TODO: extract daily log state into a shared DailyLogContext to avoid race condition with useTodayLog on first write
export function useEveningLog(): UseEveningLogResult {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityWithStatus[]>([])
  const [log, setLog] = useState<DailyLog | null>(null)
  const [loading, setLoading] = useState(true)
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    if (!user) return

    async function fetchData() {
      const dailyLog = await fetchTodayLog(user!.id)
      setLog(dailyLog)

      // Fetch user's enabled activities
      const { data: userActivities } = await supabase
        .from('user_activities')
        .select('activity_id, activities(*)')
        .eq('user_id', user!.id)
        .eq('is_enabled', true)

      let activityList: Activity[]

      if (userActivities && userActivities.length > 0) {
        activityList = userActivities.map((ua: any) => ua.activities as Activity)
      } else {
        // Seed defaults
        const { data: defaults } = await supabase
          .from('activities')
          .select('*')
          .eq('is_default', true)

        activityList = defaults ?? []

        if (activityList.length > 0) {
          const rows = activityList.map((a) => ({
            user_id: user!.id,
            activity_id: a.id,
            is_enabled: true,
          }))
          await supabase.from('user_activities').insert(rows)
        }
      }

      // Fetch activity logs for today
      let completedIds: Set<string> = new Set()
      if (dailyLog) {
        const { data: activityLogs } = await supabase
          .from('activity_logs')
          .select('activity_id, completed')
          .eq('daily_log_id', dailyLog.id)

        if (activityLogs) {
          for (const al of activityLogs) {
            if (al.completed) completedIds.add(al.activity_id)
          }
        }
      }

      setActivities(
        activityList.map((a) => ({ ...a, completed: completedIds.has(a.id) }))
      )
      setLoading(false)
    }

    fetchData()
  }, [user])

  useEffect(() => {
    return () => {
      for (const t of Object.values(debounceTimers.current)) clearTimeout(t)
    }
  }, [])

  const toggleActivity = useCallback(
    async (activityId: string, completed: boolean) => {
      if (!user) return

      // Ensure daily log exists
      let currentLog = log
      if (!currentLog) {
        currentLog = await upsertTodayLog(user.id, {})
        if (currentLog) setLog(currentLog)
      }
      if (!currentLog) return

      await supabase
        .from('activity_logs')
        .upsert(
          { daily_log_id: currentLog.id, activity_id: activityId, completed },
          { onConflict: 'daily_log_id,activity_id' }
        )

      setActivities((prev) =>
        prev.map((a) => (a.id === activityId ? { ...a, completed } : a))
      )
    },
    [user, log]
  )

  const updateRating = useCallback(
    async (field: 'energy_rating' | 'focus_rating' | 'symptom_rating', value: number) => {
      if (!user) return

      // Optimistic update
      setLog((prev) => prev ? { ...prev, [field]: value } : prev)

      clearTimeout(debounceTimers.current[field])
      debounceTimers.current[field] = setTimeout(async () => {
        const updated = await upsertTodayLog(user.id, { [field]: value })
        if (updated) setLog(updated)
      }, 500)
    },
    [user]
  )

  return { activities, log, loading, toggleActivity, updateRating }
}
