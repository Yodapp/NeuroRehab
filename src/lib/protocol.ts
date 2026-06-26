import type { ProtocolType } from '@/types'

export type PhaseResult = 'active' | 'rest' | 'none'

function calcDayOffset(startDate: string, targetDate?: string): number {
  const start = new Date(startDate + 'T00:00:00')
  const target = new Date((targetDate ?? new Date().toISOString().slice(0, 10)) + 'T00:00:00')
  return Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export function getPhaseForDate(
  protocolType: ProtocolType,
  protocolStartDate: string | null,
  date?: string
): PhaseResult {
  if (protocolType === 'none' || !protocolStartDate) return 'none'

  const offset = ((calcDayOffset(protocolStartDate, date) % 7) + 7) % 7

  if (protocolType === 'stamets_4_3') {
    return offset < 4 ? 'active' : 'rest'
  }
  if (protocolType === 'onward_5_2') {
    return offset < 5 ? 'active' : 'rest'
  }
  return 'none'
}

export function getTodayPhase(
  protocolType: ProtocolType,
  protocolStartDate: string | null
): PhaseResult {
  return getPhaseForDate(protocolType, protocolStartDate)
}

export function getPhaseLabel(
  protocolType: ProtocolType,
  protocolStartDate: string | null
): string {
  if (protocolType === 'none' || !protocolStartDate) return ''

  const offset = ((calcDayOffset(protocolStartDate) % 7) + 7) % 7

  if (protocolType === 'stamets_4_3') {
    if (offset < 4) return `Aktiv protokollfas – dag ${offset + 1} av 4`
    return `Återhämtningsfas – dag ${offset - 3} av 3`
  }
  if (protocolType === 'onward_5_2') {
    if (offset < 5) return `Aktiv protokollfas – dag ${offset + 1} av 5`
    return `Återhämtningsfas – dag ${offset - 4} av 2`
  }
  return ''
}
