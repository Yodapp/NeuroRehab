import { useEffect, useState } from 'react'

import { DayDetail } from '@/components/DayDetail'
import { WeeklyOverview } from '@/components/WeeklyOverview'
import { useWeekData } from '@/hooks/useWeekData'

function localTodayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function Week() {
  const { days, weekLabel, avgFocus, avgEnergy, loading, goToPrevWeek, goToNextWeek, isCurrentWeek } = useWeekData()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (days.length === 0) return
    if (selectedDate && days.some((d) => d.date === selectedDate)) return
    const today = localTodayISO()
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
