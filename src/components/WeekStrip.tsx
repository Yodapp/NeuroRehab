import type { DaySummary } from '../hooks/useWeekData'

interface WeekStripProps {
  days: DaySummary[]
}

const DAY_LABELS = ['M', 'T', 'O', 'T', 'F', 'L', 'S']

export function WeekStrip({ days }: WeekStripProps) {
  const today = new Date()
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="flex justify-between px-1">
      {days.map((day, i) => {
        const isToday = day.date === localToday
        const hasDose = day.hasLog && day.stacksCount > 0
        const isRest = day.phase === 'rest'

        return (
          <div key={day.date} className="flex flex-col items-center gap-1.5">
            <span className={`text-xs font-medium ${isToday ? 'text-accent-green' : 'text-text-secondary'}`}>
              {DAY_LABELS[i]}
            </span>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
              ${isToday
                ? 'bg-accent-green text-bg-primary'
                : hasDose
                  ? 'bg-accent-green/20 text-accent-green'
                  : isRest
                    ? 'bg-bg-inactive text-text-disabled'
                    : 'bg-bg-card text-text-secondary'
              }`}>
              {new Date(day.date + 'T12:00:00').getDate()}
            </div>

            <div className={`w-1.5 h-1.5 rounded-full ${hasDose ? 'bg-accent-green' : 'bg-transparent'}`} />
          </div>
        )
      })}
    </div>
  )
}
