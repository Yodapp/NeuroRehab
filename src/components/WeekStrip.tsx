import { localDateISO, parseLocalDate } from '@/lib/date'
import type { DaySummary } from '../hooks/useWeekData'

interface WeekStripProps {
  days: DaySummary[]
  selectedDate?: string | null
  onSelectDay: (date: string) => void
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function WeekStrip({ days, selectedDate, onSelectDay }: WeekStripProps) {
  const today = localDateISO()

  return (
    <div className="flex justify-between px-1">
      {days.map((day, i) => {
        const isToday = day.date === today
        const isFuture = day.date > today
        const isSelected = day.date === selectedDate && !isToday
        const hasDose = day.hasLog && day.stacksCount > 0
        const isRest = day.phase === 'rest'

        return (
          <button
            key={day.date}
            disabled={isFuture}
            onClick={() => onSelectDay(day.date)}
            className={`flex min-w-11 flex-col items-center gap-1.5 ${isFuture ? 'opacity-40' : ''}`}
          >
            <span className={`text-xs font-medium ${isToday ? 'text-accent-green' : 'text-text-secondary'}`}>
              {DAY_LABELS[i]}
            </span>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
              ${isSelected ? 'ring-2 ring-accent-gold' : ''}
              ${isToday
                ? 'bg-accent-green text-bg-primary'
                : hasDose
                  ? 'bg-accent-green/20 text-accent-green'
                  : isRest
                    ? 'bg-bg-inactive text-text-disabled'
                    : 'bg-bg-card text-text-secondary'
              }`}>
              {parseLocalDate(day.date).getDate()}
            </div>

            <div className={`w-1.5 h-1.5 rounded-full ${hasDose ? 'bg-accent-green' : 'bg-transparent'}`} />
          </button>
        )
      })}
    </div>
  )
}
