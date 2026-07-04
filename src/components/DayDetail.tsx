import { supplementItems } from '@/components/MorningChecklist'
import type { DaySummary, SupplementField } from '@/hooks/useWeekData'

interface DayDetailProps {
  day: DaySummary
}

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const ratingFields = [
  { label: 'Energy', key: 'energyRating' as const },
  { label: 'Focus', key: 'focusRating' as const },
  { label: 'Symptoms', key: 'symptomRating' as const },
]

export function DayDetail({ day }: DayDetailProps) {
  const dateLabel = dateFmt.format(new Date(day.date + 'T12:00:00'))

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-border-subtle bg-bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-body font-medium text-text-primary">{dateLabel}</span>
        {day.phase !== 'none' && (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-meta font-medium ${
              day.phase === 'active'
                ? 'bg-accent-green/15 text-accent-green'
                : 'bg-bg-inactive text-text-secondary'
            }`}
          >
            {day.phase === 'active' ? 'Dosing Day' : 'Rest Day'}
          </span>
        )}
      </div>

      {!day.hasLog ? (
        <p className="text-meta text-text-secondary">No log for this day.</p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {supplementItems.map((s) => {
              const taken = day.supplements[s.field as SupplementField]
              const Icon = s.icon
              return (
                <div
                  key={s.field}
                  className={`flex items-center gap-3 ${taken ? '' : 'opacity-40'}`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${s.iconBg}`}>
                    <Icon size={18} className={s.iconColor} />
                  </div>
                  <span className="text-meta text-text-primary">{s.label}</span>
                  <span className="ml-auto text-meta text-text-secondary">
                    {taken ? 'Taken' : 'Not taken'}
                  </span>
                </div>
              )
            })}
          </div>

          <div>
            <p className="text-meta text-text-secondary">Completed activities</p>
            {day.completedActivities.length > 0 ? (
              <p className="text-body text-text-primary">{day.completedActivities.join(', ')}</p>
            ) : (
              <p className="text-body text-text-secondary">None</p>
            )}
          </div>

          <div className="flex gap-6">
            {ratingFields.map(({ label, key }) => (
              <div key={key}>
                <p className="text-2xl font-bold text-text-primary">{day[key] ?? '–'}</p>
                <p className="text-meta text-text-secondary">{label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
