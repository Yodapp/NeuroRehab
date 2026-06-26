import type { PhaseResult } from '@/lib/protocol'

interface ProtocolBadgeProps {
  phase: PhaseResult
  label: string
}

export function ProtocolBadge({ phase, label }: ProtocolBadgeProps) {
  if (phase === 'none') return null

  const className =
    phase === 'active'
      ? 'bg-green-500/15 text-green-700 dark:text-green-400'
      : 'bg-muted text-muted-foreground'

  return (
    <div className={`rounded-full px-4 py-2 text-sm font-medium ${className}`}>
      {label}
    </div>
  )
}
