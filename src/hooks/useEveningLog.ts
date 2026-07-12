import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchDailyLog, localToday, upsertDailyLog, type DailyLogUpdate } from '@/lib/dailyLog'
import { useAuth } from '@/contexts/AuthContext'
import type { Activity, DailyLog } from '@/types'

export interface ActivityWithStatus extends Activity {
  completed: boolean
}

export interface UseEveningLogResult {
  activities: ActivityWithStatus[]
  log: DailyLog | null
  loading: boolean
  error: string | null
  toggleActivity: (activityId: string, completed: boolean) => Promise<void>
  updateRating: (field: 'energy_rating' | 'focus_rating' | 'symptom_rating', value: number) => Promise<void>
}

interface UserActivityWithActivity {
  activities: Activity | Activity[] | null
}

function getRelatedActivity(row: UserActivityWithActivity): Activity | null {
  return Array.isArray(row.activities) ? row.activities[0] ?? null : row.activities
}

// TODO: extract daily log state into a shared DailyLogContext to avoid race condition with useTodayLog on first write
export function useEveningLog(targetDate?: string): UseEveningLogResult {
  const { user } = useAuth()
  const date = targetDate ?? localToday()
  const [activities, setActivities] = useState<ActivityWithStatus[]>([])
  const [log, setLog] = useState<DailyLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    if (!user) {
      setActivities([])
      setLog(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const dailyLog = await fetchDailyLog(user!.id, date)

        const { data: userActivities, error: userActivitiesError } = await supabase
          .from('user_activities')
          .select('activity_id, activities(*)')
          .eq('user_id', user!.id)
          .eq('is_enabled', true)
        if (userActivitiesError) throw userActivitiesError

        const activityList: Activity[] = userActivities
          ? (userActivities as UserActivityWithActivity[])
            .map(getRelatedActivity)
            .filter((activity): activity is Activity => Boolean(activity))
          : []

        let completedIds: Set<string> = new Set()
        if (dailyLog) {
          const { data: activityLogs, error: activityLogsError } = await supabase
            .from('activity_logs')
            .select('activity_id, completed')
            .eq('daily_log_id', dailyLog.id)
          if (activityLogsError) throw activityLogsError

          if (activityLogs) {
            for (const al of activityLogs) {
              if (al.completed) completedIds.add(al.activity_id)
            }
          }
        }

        if (cancelled) return
        setLog(dailyLog)
        setActivities(
          activityList.map((a) => ({ ...a, completed: completedIds.has(a.id) }))
        )
      } catch {
        if (!cancelled) setError('Could not load evening log.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [user, date])

  useEffect(() => {
    return () => {
      for (const t of Object.values(debounceTimers.current)) clearTimeout(t)
    }
  }, [])

  const toggleActivity = useCallback(
    async (activityId: string, completed: boolean) => {
      if (!user) return

      try {
        setError(null)
        let currentLog = log
        if (!currentLog) {
          currentLog = await upsertDailyLog(user.id, {}, date)
          if (currentLog) setLog(currentLog)
        }
        if (!currentLog) return

        const { error: saveError } = await supabase
          .from('activity_logs')
          .upsert(
            { daily_log_id: currentLog.id, activity_id: activityId, completed },
            { onConflict: 'daily_log_id,activity_id' }
          )
        if (saveError) throw saveError

        setActivities((prev) =>
          prev.map((a) => (a.id === activityId ? { ...a, completed } : a))
        )
      } catch {
        setError('Could not save activity.')
      }
    },
    [user, log, date]
  )

  const updateRating = useCallback(
    async (field: 'energy_rating' | 'focus_rating' | 'symptom_rating', value: number) => {
      if (!user) return

      setLog((prev) => prev ? { ...prev, [field]: value } : prev)

      clearTimeout(debounceTimers.current[field])
      debounceTimers.current[field] = setTimeout(async () => {
        try {
          setError(null)
          const fields: DailyLogUpdate = { [field]: value }
          const updated = await upsertDailyLog(user.id, fields, date)
          if (updated) setLog(updated)
        } catch {
          setError('Could not save rating.')
        }
      }, 500)
    },
    [user, date]
  )

  return { activities, log, loading, error, toggleActivity, updateRating }
}
