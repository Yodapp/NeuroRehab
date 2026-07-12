import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { localDateISO } from '@/lib/date'
import { getPhaseForDate } from '@/lib/protocol'
import type { PhaseResult } from '@/lib/protocol'
import type { DailyLog, UserProfile } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export type SupplementField = 'took_psilocybin' | 'took_niacin' | 'took_lions_mane' | 'took_morning_meds'

export interface DaySummary {
  date: string
  phase: PhaseResult
  stacksCount: number
  tasksCount: number
  supplements: Record<SupplementField, boolean>
  completedActivities: string[]
  energyRating: number | null
  focusRating: number | null
  symptomRating: number | null
  hasLog: boolean
}

export interface UseWeekDataResult {
  days: DaySummary[]
  weekLabel: string
  avgFocus: number | null
  avgEnergy: number | null
  loading: boolean
  error: string | null
  goToPrevWeek: () => void
  goToNextWeek: () => void
  isCurrentWeek: boolean
}

const supplementFields = ['took_psilocybin', 'took_niacin', 'took_lions_mane', 'took_morning_meds'] as const

interface ActivityLogWithActivity {
  daily_log_id: string
  activities: { name: string } | { name: string }[] | null
}

function getRelatedActivityName(row: ActivityLogWithActivity): string | null {
  const activity = Array.isArray(row.activities) ? row.activities[0] : row.activities
  return activity?.name ?? null
}

function getMonday(weekOffset: number): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = (day === 0 ? -6 : 1 - day) + weekOffset * 7
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const startOfYear = new Date(monday.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((monday.getTime() - startOfYear.getTime()) / 86400000)
  const startDay = startOfYear.getDay() || 7
  const weekNum = Math.ceil((dayOfYear + startDay) / 7)

  const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'short' })
  const startMonth = monthFmt.format(monday)
  const endMonth = monthFmt.format(sunday)
  const monthPart = startMonth === endMonth
    ? `${startMonth} ${monday.getDate()}–${sunday.getDate()}`
    : `${startMonth} ${monday.getDate()} – ${endMonth} ${sunday.getDate()}`

  return `Week ${weekNum}, ${monthPart}`
}

export function useWeekData(): UseWeekDataResult {
  const { user } = useAuth()
  const [weekOffset, setWeekOffset] = useState(0)
  const [days, setDays] = useState<DaySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const monday = getMonday(weekOffset)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  useEffect(() => {
    if (!user) {
      setDays([])
      setLoading(false)
      setError(null)
      return
    }

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const startDate = localDateISO(monday)
        const endDate = localDateISO(sunday)

        const [profileRes, logsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user!.id).single(),
          supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', user!.id)
            .gte('date', startDate)
            .lte('date', endDate),
        ])
        if (profileRes.error) throw profileRes.error
        if (logsRes.error) throw logsRes.error

        const prof = profileRes.data as UserProfile | null

        const logs = (logsRes.data ?? []) as DailyLog[]
        const logMap = new Map(logs.map((l) => [l.date, l]))

        const logIds = logs.map((l) => l.id)
        const activityNamesMap = new Map<string, string[]>()
        if (logIds.length > 0) {
          const { data: activityLogs, error: activityLogsError } = await supabase
            .from('activity_logs')
            .select('daily_log_id, activities(name)')
            .in('daily_log_id', logIds)
            .eq('completed', true)
          if (activityLogsError) throw activityLogsError

          if (activityLogs) {
            for (const al of activityLogs as ActivityLogWithActivity[]) {
              const logEntry = logs.find((l) => l.id === al.daily_log_id)
              const name = getRelatedActivityName(al)
              if (logEntry && name) {
                const names = activityNamesMap.get(logEntry.date) ?? []
                names.push(name)
                activityNamesMap.set(logEntry.date, names)
              }
            }
          }
        }

        const daySummaries: DaySummary[] = []
        for (let i = 0; i < 7; i++) {
          const d = new Date(monday)
          d.setDate(monday.getDate() + i)
          const dateStr = localDateISO(d)
          const log = logMap.get(dateStr)

          const phase = prof
            ? getPhaseForDate(prof.protocol_type, prof.protocol_start_date, dateStr)
            : 'none'

          const supplements = {} as Record<SupplementField, boolean>
          let stacksCount = 0
          for (const field of supplementFields) {
            supplements[field] = !!log?.[field]
            if (supplements[field]) stacksCount++
          }

          const completedActivities = activityNamesMap.get(dateStr) ?? []

          daySummaries.push({
            date: dateStr,
            phase,
            stacksCount,
            tasksCount: completedActivities.length,
            supplements,
            completedActivities,
            energyRating: log?.energy_rating ?? null,
            focusRating: log?.focus_rating ?? null,
            symptomRating: log?.symptom_rating ?? null,
            hasLog: !!log,
          })
        }

        setDays(daySummaries)
      } catch {
        setError('Could not load week.')
        setDays([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, weekOffset])

  const daysWithLog = days.filter((d) => d.hasLog)

  const avgFocus = daysWithLog.length > 0
    ? daysWithLog.reduce((sum, d) => sum + (d.focusRating ?? 0), 0) / daysWithLog.filter(d => d.focusRating !== null).length || null
    : null

  const avgEnergy = daysWithLog.length > 0
    ? daysWithLog.reduce((sum, d) => sum + (d.energyRating ?? 0), 0) / daysWithLog.filter(d => d.energyRating !== null).length || null
    : null

  const goToPrevWeek = useCallback(() => setWeekOffset((o) => o - 1), [])
  const goToNextWeek = useCallback(() => setWeekOffset((o) => o + 1), [])

  return {
    days,
    weekLabel: formatWeekLabel(monday),
    avgFocus: avgFocus ? Math.round(avgFocus * 10) / 10 : null,
    avgEnergy: avgEnergy ? Math.round(avgEnergy * 10) / 10 : null,
    loading,
    error,
    goToPrevWeek,
    goToNextWeek,
    isCurrentWeek: weekOffset === 0,
  }
}
