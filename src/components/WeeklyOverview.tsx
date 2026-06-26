import { Button } from '@/components/ui/button'
import type { DaySummary } from '@/hooks/useWeekData'

const dayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

interface WeeklyOverviewProps {
  days: DaySummary[]
  weekLabel: string
  avgFocus: number | null
  avgEnergy: number | null
  onPrevWeek: () => void
  onNextWeek: () => void
  isCurrentWeek: boolean
}

function Sparkline({ data }: { data: (number | null)[] }) {
  const points = data
    .map((v, i) => (v !== null ? `${i * 20},${30 - (v - 1) * 6}` : null))
    .filter(Boolean)
    .join(' ')

  if (!points) return <div className="h-8 w-[120px]" />

  return (
    <svg width="120" height="32" viewBox="0 0 120 32" className="text-primary">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function DotRow({ filled, max }: { filled: number; max: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${i < filled ? 'bg-primary' : 'bg-muted'}`}
        />
      ))}
    </div>
  )
}

function SquareRow({ filled, max }: { filled: number; max: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-sm ${i < filled ? 'bg-primary' : 'bg-muted'}`}
        />
      ))}
    </div>
  )
}

export function WeeklyOverview({
  days,
  weekLabel,
  avgFocus,
  avgEnergy,
  onPrevWeek,
  onNextWeek,
  isCurrentWeek,
}: WeeklyOverviewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Week header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onPrevWeek}>
          ←
        </Button>
        <span className="text-sm font-medium">{weekLabel}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNextWeek}
          disabled={isCurrentWeek}
        >
          →
        </Button>
      </div>

      {/* Day columns */}
      <div className="flex gap-2 overflow-x-auto">
        {days.map((day, i) => (
          <div
            key={day.date}
            className={`flex min-w-[44px] flex-1 flex-col items-center gap-2 rounded-xl p-2 text-center ${
              day.phase === 'rest'
                ? 'bg-muted/50'
                : day.hasLog
                  ? 'bg-green-500/10'
                  : 'bg-card'
            }`}
          >
            <span className="text-xs font-medium">{dayNames[i]}</span>
            {day.phase === 'rest' ? (
              <span className="text-xs text-muted-foreground">Vila</span>
            ) : (
              <>
                <DotRow filled={day.stacksCount} max={4} />
                <SquareRow filled={day.tasksCount} max={4} />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Trend section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Kognitiv Klarhet</span>
          <div className="flex items-center gap-3">
            <Sparkline data={days.map((d) => d.focusRating)} />
            <span className="w-8 text-right text-sm font-semibold">
              {avgFocus ?? '–'}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Energi</span>
          <div className="flex items-center gap-3">
            <Sparkline data={days.map((d) => d.energyRating)} />
            <span className="w-8 text-right text-sm font-semibold">
              {avgEnergy ?? '–'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
