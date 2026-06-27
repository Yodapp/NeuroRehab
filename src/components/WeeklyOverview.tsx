import { ChevronLeft, ChevronRight } from 'lucide-react'
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
    <svg width="120" height="32" viewBox="0 0 120 32" className="text-accent-green">
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
          className={`h-2 w-2 rounded-full ${i < filled ? 'bg-accent-green' : 'bg-border-subtle'}`}
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
          className={`h-2 w-2 rounded-sm ${i < filled ? 'bg-accent-green' : 'bg-border-subtle'}`}
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
      <div className="flex items-center justify-between">
        <button onClick={onPrevWeek} className="flex h-11 w-11 items-center justify-center rounded-[14px]">
          <ChevronLeft size={22} className="text-text-secondary" />
        </button>
        <span className="text-body font-medium">{weekLabel}</span>
        <button
          onClick={onNextWeek}
          disabled={isCurrentWeek}
          className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${isCurrentWeek ? 'opacity-30' : ''}`}
        >
          <ChevronRight size={22} className="text-text-secondary" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {days.map((day, i) => (
          <div
            key={day.date}
            className={`flex min-w-[44px] flex-1 flex-col items-center gap-2 rounded-[14px] p-2 text-center ${
              day.phase === 'rest'
                ? 'bg-bg-inactive'
                : day.hasLog
                  ? 'bg-bg-card ring-1 ring-border-subtle'
                  : 'bg-bg-card/50'
            }`}
          >
            <span className="text-meta font-medium">{dayNames[i]}</span>
            {day.phase === 'rest' ? (
              <span className="text-meta text-text-secondary">Vila</span>
            ) : (
              <>
                <DotRow filled={day.stacksCount} max={4} />
                <SquareRow filled={day.tasksCount} max={4} />
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-[14px] border border-border-subtle bg-bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-body text-text-secondary">Kognitiv Klarhet</span>
          <div className="flex items-center gap-3">
            <Sparkline data={days.map((d) => d.focusRating)} />
            <span className="text-title w-10 text-right">
              {avgFocus ?? '–'}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body text-text-secondary">Energi</span>
          <div className="flex items-center gap-3">
            <Sparkline data={days.map((d) => d.energyRating)} />
            <span className="text-title w-10 text-right">
              {avgEnergy ?? '–'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
