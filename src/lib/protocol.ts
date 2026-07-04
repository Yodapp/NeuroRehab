import type { ProtocolType } from '@/types'

export type PhaseResult = 'active' | 'rest' | 'none'

function calcDayOffset(startDate: string, targetDate?: string): number {
  const now = new Date()
  const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const start = new Date(startDate + 'T00:00:00')
  const target = new Date((targetDate ?? local) + 'T00:00:00')
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
  protocolStartDate: string | null,
  date?: string
): string {
  if (protocolType === 'none' || !protocolStartDate) return ''

  const offset = ((calcDayOffset(protocolStartDate, date) % 7) + 7) % 7

  if (protocolType === 'stamets_4_3') {
    if (offset < 4) return `Dosing Day ${offset + 1} of 4`
    return `Rest Day ${offset - 3} of 3`
  }
  if (protocolType === 'onward_5_2') {
    if (offset < 5) return `Dosing Day ${offset + 1} of 5`
    return `Rest Day ${offset - 4} of 2`
  }
  return ''
}
