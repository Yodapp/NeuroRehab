import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getPhaseForDate } from '@/lib/protocol'
import type { PhaseResult } from '@/lib/protocol'
import type { UserProfile } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export interface DaySummary {
  date: string
  phase: PhaseResult
  stacksCount: number
  tasksCount: number
  energyRating: number | null
  focusRating: number | null
  hasLog: boolean
}

export interface UseWeekDataResult {
  days: DaySummary[]
  weekLabel: string
  avgFocus: number | null
  avgEnergy: number | null
  loading: boolean
  goToPrevWeek: () => void
  goToNextWeek: () => void
  isCurrentWeek: boolean
}

const supplementFields = ['took_psilocybin', 'took_niacin', 'took_lions_mane', 'took_morning_meds'] as const

function getMonday(weekOffset: number): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = (day === 0 ? -6 : 1 - day) + weekOffset * 7
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const startOfYear = new Date(monday.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((monday.getTime() - startOfYear.getTime()) / 86400000)
  const startDay = startOfYear.getDay() || 7
  const weekNum = Math.ceil((dayOfYear + startDay) / 7)

  const monthFmt = new Intl.DateTimeFormat('sv-SE', { month: 'short' })
  const startMonth = monthFmt.format(monday)
  const endMonth = monthFmt.format(sunday)
  const monthPart = startMonth === endMonth
    ? `${startMonth} ${monday.getDate()}–${sunday.getDate()}`
    : `${startMonth} ${monday.getDate()} – ${endMonth} ${sunday.getDate()}`

  return `Vecka ${weekNum}, ${monthPart}`
}

export function useWeekData(): UseWeekDataResult {
  const { user } = useAuth()
  const [weekOffset, setWeekOffset] = useState(0)
  const [days, setDays] = useState<DaySummary[]>([])
  const [loading, setLoading] = useState(true)

  const monday = getMonday(weekOffset)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  useEffect(() => {
    if (!user) return

    async function fetchData() {
      setLoading(true)

      const startDate = toISO(monday)
      const endDate = toISO(sunday)

      const [profileRes, logsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
        supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user!.id)
          .gte('date', startDate)
          .lte('date', endDate),
      ])

      const prof = profileRes.data as UserProfile | null

      const logs = logsRes.data ?? []
      const logMap = new Map(logs.map((l: any) => [l.date, l]))

      // Fetch activity logs for all daily_log_ids in this week
      const logIds = logs.map((l: any) => l.id)
      let activityCountMap = new Map<string, number>()
      if (logIds.length > 0) {
        const { data: activityLogs } = await supabase
          .from('activity_logs')
          .select('daily_log_id')
          .in('daily_log_id', logIds)
          .eq('completed', true)

        if (activityLogs) {
          for (const al of activityLogs) {
            const logEntry = logs.find((l: any) => l.id === al.daily_log_id)
            if (logEntry) {
              activityCountMap.set(
                logEntry.date,
                (activityCountMap.get(logEntry.date) ?? 0) + 1
              )
            }
          }
        }
      }

      const daySummaries: DaySummary[] = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        const dateStr = toISO(d)
        const log = logMap.get(dateStr)

        const phase = prof
          ? getPhaseForDate(prof.protocol_type, prof.protocol_start_date, dateStr)
          : 'none'

        let stacksCount = 0
        if (log) {
          for (const field of supplementFields) {
            if (log[field]) stacksCount++
          }
        }

        daySummaries.push({
          date: dateStr,
          phase,
          stacksCount,
          tasksCount: activityCountMap.get(dateStr) ?? 0,
          energyRating: log?.energy_rating ?? null,
          focusRating: log?.focus_rating ?? null,
          hasLog: !!log,
        })
      }

      setDays(daySummaries)
      setLoading(false)
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
    goToPrevWeek,
    goToNextWeek,
    isCurrentWeek: weekOffset === 0,
  }
}
