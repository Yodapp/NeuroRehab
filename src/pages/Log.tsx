import { EveningLog } from '@/components/EveningLog'
import { useEveningLog } from '@/hooks/useEveningLog'

const formattedDate = new Intl.DateTimeFormat('sv-SE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date())

export function Log() {
  const { activities, log, loading, toggleActivity, updateRating } = useEveningLog()

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
        <h1 className="text-2xl font-semibold">Kväll</h1>
        <p className="text-sm capitalize text-muted-foreground">{formattedDate}</p>
      </div>
      <EveningLog
        activities={activities}
        log={log}
        onToggleActivity={toggleActivity}
        onUpdateRating={updateRating}
      />
    </div>
  )
}
