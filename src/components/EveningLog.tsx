import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import type { ActivityWithStatus } from '@/hooks/useEveningLog'
import type { DailyLog } from '@/types'

interface EveningLogProps {
  activities: ActivityWithStatus[]
  log: DailyLog | null
  onToggleActivity: (activityId: string, completed: boolean) => void
  onUpdateRating: (field: 'energy_rating' | 'focus_rating' | 'symptom_rating', value: number) => void
}

const ratingFields = [
  { field: 'energy_rating' as const, label: 'Energinivå' },
  { field: 'focus_rating' as const, label: 'Fokus/Skärpa' },
  { field: 'symptom_rating' as const, label: 'Symptom' },
]

export function EveningLog({ activities, log, onToggleActivity, onUpdateRating }: EveningLogProps) {
  return (
    <div className="flex flex-col gap-8">
      {activities.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-medium">Aktiviteter</h2>
          <div className="grid grid-cols-2 gap-3">
            {activities.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-2 rounded-xl border bg-card p-4"
              >
                <span className="text-sm font-medium">{a.name}</span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={a.completed}
                    onCheckedChange={(v) => onToggleActivity(a.id, v)}
                  />
                  {a.completed && (
                    <span className="text-sm text-muted-foreground">Klar</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-medium">Hur mår du?</h2>
        <div className="flex flex-col gap-5">
          {ratingFields.map(({ field, label }) => {
            const value = log?.[field] ?? 3
            return (
              <div key={field} className="flex flex-col gap-2">
                <span className="text-sm font-medium">{label}</span>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[value]}
                    onValueChange={([v]) => onUpdateRating(field, v)}
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-6 text-center text-sm font-semibold">{value}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
