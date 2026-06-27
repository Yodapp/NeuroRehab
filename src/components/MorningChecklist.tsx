import { Brain, Leaf, Pill, Zap } from 'lucide-react'
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
  icon: typeof Leaf
  iconColor: string
  iconBg: string
}[] = [
  { field: 'took_psilocybin', label: 'Mikrodos Psilocybin', subtitle: 'Ta din dosering (0.1g)', requires: 'psilocybin', activeOnly: true, icon: Leaf, iconColor: 'text-[#30D158]', iconBg: 'bg-[rgba(48,209,88,0.12)]' },
  { field: 'took_niacin', label: 'Niacin B3', subtitle: 'Förbättrar blodflöde', requires: 'niacin', activeOnly: true, icon: Zap, iconColor: 'text-[#FFD60A]', iconBg: 'bg-[rgba(255,214,10,0.12)]' },
  { field: 'took_lions_mane', label: "Lion's Mane", subtitle: 'Stödjer kognition', requires: 'lions_mane', activeOnly: false, icon: Brain, iconColor: 'text-[#BF5AF2]', iconBg: 'bg-[rgba(191,90,242,0.12)]' },
  { field: 'took_morning_meds', label: 'Morgonmedicin', subtitle: 'Ordinerad medicin', requires: 'morning_meds', activeOnly: false, icon: Pill, iconColor: 'text-[#0A84FF]', iconBg: 'bg-[rgba(10,132,255,0.12)]' },
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
        const Icon = s.icon
        return (
          <label
            key={s.field}
            className={`flex items-center gap-4 rounded-[14px] border bg-bg-card p-4 transition-base ${
              checked ? 'border-accent-green' : 'border-border-subtle'
            }`}
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${s.iconBg}`}>
              <Icon size={24} className={s.iconColor} />
            </div>
            <div className="flex-1">
              <div className="text-body font-medium text-text-primary">{s.label}</div>
              <div className="text-meta text-text-secondary">{s.subtitle}</div>
            </div>
            <Checkbox
              checked={checked}
              onCheckedChange={(v) => onToggle(s.field, !!v)}
              className="h-6 w-6 rounded-md border-border-subtle data-[state=checked]:bg-accent-green data-[state=checked]:border-accent-green"
            />
          </label>
        )
      })}
    </div>
  )
}
