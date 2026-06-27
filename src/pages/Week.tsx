import { WeeklyOverview } from '@/components/WeeklyOverview'
import { useWeekData } from '@/hooks/useWeekData'

export function Week() {
  const { days, weekLabel, avgFocus, avgEnergy, loading, goToPrevWeek, goToNextWeek, isCurrentWeek } = useWeekData()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-green border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-5 pb-32">
      <h1 className="text-title">Vecka</h1>
      <WeeklyOverview
        days={days}
        weekLabel={weekLabel}
        avgFocus={avgFocus}
        avgEnergy={avgEnergy}
        onPrevWeek={goToPrevWeek}
        onNextWeek={goToNextWeek}
        isCurrentWeek={isCurrentWeek}
      />
    </div>
  )
}
