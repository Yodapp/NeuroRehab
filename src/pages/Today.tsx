import { MorningChecklist } from '@/components/MorningChecklist'
import { ProtocolBadge } from '@/components/ProtocolBadge'
import { useTodayLog } from '@/hooks/useTodayLog'

const formattedDate = new Intl.DateTimeFormat('sv-SE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date())

export function Today() {
  const { profile, log, phase, phaseLabel, loading, toggleSupplement } = useTodayLog()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">Morgon</h1>
        <p className="text-sm capitalize text-muted-foreground">{formattedDate}</p>
      </div>
      <ProtocolBadge phase={phase} label={phaseLabel} />
      {profile && (
        <MorningChecklist
          profile={profile}
          log={log}
          phase={phase}
          onToggle={toggleSupplement}
        />
      )}
    </div>
  )
}
