import { CycleSummary } from '@/components/CycleSummary'
import { EveningLog } from '@/components/EveningLog'
import { MorningChecklist } from '@/components/MorningChecklist'
import { ProtocolBadge } from '@/components/ProtocolBadge'
import { WeekStrip } from '@/components/WeekStrip'
import { useEveningLog } from '@/hooks/useEveningLog'
import { useTodayLog } from '@/hooks/useTodayLog'
import { useWeekData } from '@/hooks/useWeekData'

const formattedDate = new Intl.DateTimeFormat('sv-SE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date())

export function Today() {
  const todayLog = useTodayLog()
  const eveningLog = useEveningLog()
  const { days } = useWeekData()

  if (todayLog.loading || eveningLog.loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-green border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 overflow-y-auto p-5 pb-32">
      <div>
        <h1 className="text-title">Idag</h1>
        <p className="text-meta capitalize text-text-secondary">{formattedDate}</p>
      </div>

      <ProtocolBadge phase={todayLog.phase} label={todayLog.phaseLabel} />

      {days.length > 0 && <WeekStrip days={days} />}

      <section>
        <h2 className="text-section mb-3">Dagens stack</h2>
        {todayLog.profile && (
          <MorningChecklist
            profile={todayLog.profile}
            log={todayLog.log}
            phase={todayLog.phase}
            onToggle={todayLog.toggleSupplement}
          />
        )}
      </section>

      <hr className="border-border-subtle" />

      <section>
        <h2 className="text-section mb-3">Kvällslogg</h2>
        <EveningLog
          activities={eveningLog.activities}
          log={eveningLog.log}
          onToggleActivity={eveningLog.toggleActivity}
          onUpdateRating={eveningLog.updateRating}
        />
      </section>

      {days.length > 0 && <CycleSummary days={days} />}
    </div>
  )
}
