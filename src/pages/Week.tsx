import { useEffect, useState } from 'react'

import { DayDetail } from '@/components/DayDetail'
import { WeeklyOverview } from '@/components/WeeklyOverview'
import { useWeekData } from '@/hooks/useWeekData'
import { localDateISO } from '@/lib/date'

export function Week() {
  const { days, weekLabel, avgFocus, avgEnergy, loading, error, goToPrevWeek, goToNextWeek, isCurrentWeek } = useWeekData()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (days.length === 0) return
    if (selectedDate && days.some((d) => d.date === selectedDate)) return
    const today = localDateISO()
    setSelectedDate(days.some((d) => d.date === today) ? today : days[0].date)
  }, [days, selectedDate])

  const selectedDay = days.find((d) => d.date === selectedDate) ?? null

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-green border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-5 pb-32">
      <h1 className="text-title">Week</h1>
      {error && (
        <p className="rounded-[14px] border border-accent-red/40 bg-accent-red/10 p-3 text-meta text-accent-red">
          {error}
        </p>
      )}
      <WeeklyOverview
        days={days}
        weekLabel={weekLabel}
        avgFocus={avgFocus}
        avgEnergy={avgEnergy}
        onPrevWeek={goToPrevWeek}
        onNextWeek={goToNextWeek}
        isCurrentWeek={isCurrentWeek}
        selectedDate={selectedDate}
        onSelectDay={setSelectedDate}
      >
        {selectedDay && <DayDetail day={selectedDay} />}
      </WeeklyOverview>
    </div>
  )
}
