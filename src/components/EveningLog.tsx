import {
  Activity, Blocks, BookOpen, Brain, Code2, Footprints,
  Gamepad2, Grid3x3, Layers, Puzzle, Sparkles,
} from 'lucide-react'
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

const activityIcons: Record<string, typeof Activity> = {
  'Programmering': Code2,
  'BrainHQ': Brain,
  'Casual Video Games': Gamepad2,
  'Promenad': Footprints,
  'Sudoku': Grid3x3,
  'Crossword Puzzles': BookOpen,
  'Lego Building': Blocks,
  'Jigsaw Puzzles': Puzzle,
  'Lumosity': Sparkles,
  'Dual N-Back': Layers,
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
        <div className="flex flex-col gap-3">
          {activities.map((a) => {
            const Icon = activityIcons[a.name] || Activity
            return (
              <div
                key={a.id}
                className={`flex items-center gap-4 rounded-[14px] border bg-bg-card p-4 transition-base ${
                  a.completed ? 'border-accent-green' : 'border-border-subtle'
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-bg-inactive">
                  <Icon size={22} className="text-text-secondary" />
                </div>
                <div className="flex-1">
                  <span className="text-body font-medium text-text-primary">{a.name}</span>
                  {a.description && (
                    <p className="text-meta text-text-secondary">{a.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={a.completed}
                    onCheckedChange={(v) => onToggleActivity(a.id, v)}
                  />
                  <span className={`text-meta font-medium ${a.completed ? 'text-accent-green' : 'text-text-secondary'}`}>
                    {a.completed ? 'Klar' : 'Inte idag'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="rounded-[14px] border border-border-subtle bg-bg-card p-4">
        <div className="flex flex-col gap-5">
          {ratingFields.map(({ field, label }) => {
            const value = log?.[field] ?? 3
            return (
              <div key={field} className="flex flex-col gap-2">
                <span className="text-body font-medium text-text-primary">{label}</span>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[value]}
                    onValueChange={([v]) => onUpdateRating(field, v)}
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-title w-10 text-right text-text-primary">{value}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
