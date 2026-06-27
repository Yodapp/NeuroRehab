import type { PhaseResult } from '@/lib/protocol'

interface ProtocolBadgeProps {
  phase: PhaseResult
  label: string
}

export function ProtocolBadge({ phase, label }: ProtocolBadgeProps) {
  if (phase === 'none') return null

  return (
    <div
      className={`w-fit rounded-full px-4 py-1 text-meta font-medium ${
        phase === 'active'
          ? 'bg-[rgba(48,209,88,0.15)] text-accent-green'
          : 'bg-bg-inactive text-text-secondary'
      }`}
    >
      {label}
    </div>
  )
}
