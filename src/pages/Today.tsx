import { useState } from 'react'
import { Link } from 'react-router-dom'

import { CycleSummary } from '@/components/CycleSummary'
import { EveningLog } from '@/components/EveningLog'
import { MorningChecklist } from '@/components/MorningChecklist'
import { ProtocolBadge } from '@/components/ProtocolBadge'
import { WeekStrip } from '@/components/WeekStrip'
import { useEveningLog } from '@/hooks/useEveningLog'
import { useTodayLog } from '@/hooks/useTodayLog'
import { useWeekData } from '@/hooks/useWeekData'
import { localToday } from '@/lib/dailyLog'

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function Today() {
  const actualToday = localToday()
  const [selectedDate, setSelectedDate] = useState(actualToday)
  const todayLog = useTodayLog(selectedDate)
  const eveningLog = useEveningLog(selectedDate)
  const { days } = useWeekData()

  const isBackfilling = selectedDate !== actualToday

  function handleSelectDay(date: string) {
    if (date > actualToday) return
    setSelectedDate(date)
  }

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
        <h1 className="text-title">Today</h1>
        <p className="text-meta capitalize text-text-secondary">
          {dateFmt.format(new Date(actualToday + 'T12:00:00'))}
        </p>
      </div>

      {todayLog.profile?.intention ? (
        <blockquote className="border-l-2 border-accent-gold pl-4 text-body italic text-accent-gold">
          "{todayLog.profile.intention}"
        </blockquote>
      ) : (
        <Link
          to="/profile"
          className="text-meta text-text-secondary underline decoration-dotted underline-offset-4"
        >
          Set an intention for your practice
        </Link>
      )}

      <ProtocolBadge phase={todayLog.phase} label={todayLog.phaseLabel} />

      {days.length > 0 && (
        <WeekStrip days={days} selectedDate={selectedDate} onSelectDay={handleSelectDay} />
      )}

      {isBackfilling && (
        <div className="flex items-center justify-between gap-3 rounded-[14px] border border-accent-gold bg-accent-gold/10 px-4 py-2">
          <span className="text-meta font-medium text-text-primary">
            Logging for {dateFmt.format(new Date(selectedDate + 'T12:00:00'))}
          </span>
          <button
            onClick={() => setSelectedDate(actualToday)}
            className="min-h-11 shrink-0 text-meta font-medium text-accent-blue"
          >
            Back to Today
          </button>
        </div>
      )}

      <section>
        <h2 className="text-section mb-3">Today's Stack</h2>
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
        <h2 className="text-section mb-3">Evening Log</h2>
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
