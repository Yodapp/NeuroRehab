import { Checkbox } from '@/components/ui/checkbox'
import type { PhaseResult } from '@/lib/protocol'
import type { DailyLog, UserProfile } from '@/types'

interface MorningChecklistProps {
  profile: UserProfile
  log: DailyLog | null
  phase: PhaseResult
  onToggle: (field: keyof DailyLog, value: boolean) => void
}

const supplements: {
  field: keyof DailyLog
  label: string
  subtitle: string
  requires: string
  activeOnly: boolean
}[] = [
  { field: 'took_psilocybin', label: 'Mikrodos Psilocybin', subtitle: 'Ta din dosering (0.1g)', requires: 'psilocybin', activeOnly: true },
  { field: 'took_niacin', label: 'Niacin B3', subtitle: 'Förbättrar blodflöde', requires: 'niacin', activeOnly: true },
  { field: 'took_lions_mane', label: "Lion's Mane", subtitle: 'Stödjer kognition', requires: 'lions_mane', activeOnly: false },
  { field: 'took_morning_meds', label: 'Morgonmedicin', subtitle: 'Ordinerad medicin', requires: 'morning_meds', activeOnly: false },
]

export function MorningChecklist({ profile, log, phase, onToggle }: MorningChecklistProps) {
  const visible = supplements.filter((s) => {
    if (!profile.enabled_supplements.includes(s.requires)) return false
    if (s.activeOnly && phase !== 'active') return false
    return true
  })

  if (visible.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {visible.map((s) => {
        const checked = log ? !!(log[s.field]) : false
        return (
          <label
            key={s.field}
            className="flex items-center gap-4 rounded-xl border bg-card p-4"
          >
            <div className="flex-1">
              <div className="font-medium">{s.label}</div>
              <div className="text-sm text-muted-foreground">{s.subtitle}</div>
            </div>
            <Checkbox
              checked={checked}
              onCheckedChange={(v) => onToggle(s.field, !!v)}
              className="h-7 w-7"
            />
          </label>
        )
      })}
    </div>
  )
}
