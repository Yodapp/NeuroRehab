import type { DaySummary } from '../hooks/useWeekData'

interface CycleSummaryProps {
  days: DaySummary[]
}

export function CycleSummary({ days }: CycleSummaryProps) {
  const logged = days.filter(d => d.hasLog)

  if (logged.length < 3) return null

  const avgEnergy = (logged.reduce((s, d) => s + (d.energyRating ?? 0), 0) / logged.length).toFixed(1)
  const avgFocus = (logged.reduce((s, d) => s + (d.focusRating ?? 0), 0) / logged.length).toFixed(1)
  const activeDays = logged.filter(d => d.phase === 'active').length
  const totalDays = logged.length

  return (
    <div className="bg-bg-card rounded-[14px] border border-border-subtle p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary uppercase tracking-wider">Veckans sammanfattning</span>
        <span className="text-xs text-text-secondary">{totalDays}/7 dagar loggade</span>
      </div>

      <div className="flex gap-4">
        <div>
          <p className="text-2xl font-bold text-text-primary">{avgEnergy}</p>
          <p className="text-xs text-text-secondary">Snitt energi</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-text-primary">{avgFocus}</p>
          <p className="text-xs text-text-secondary">Snitt fokus</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-accent-green">{activeDays}</p>
          <p className="text-xs text-text-secondary">Aktiva dosdagar</p>
        </div>
      </div>

      <svg width="100%" height="32" viewBox={`0 0 ${days.length * 20} 32`} preserveAspectRatio="none">
        <polyline
          points={days
            .map((d, i) => d.energyRating ? `${i * 20 + 10},${32 - (d.energyRating - 1) * 7}` : null)
            .filter(Boolean)
            .join(' ')}
          fill="none"
          stroke="#3dd68c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
