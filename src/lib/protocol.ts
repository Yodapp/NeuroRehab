import type { ProtocolType } from '@/types'

export function isActiveDay(
  protocolType: ProtocolType,
  startDate: string,
  date: string = new Date().toISOString().slice(0, 10)
): boolean {
  // TODO: implement stamets_4_3, onward_5_2, custom, none
  void startDate
  void date
  return protocolType !== 'none'
}
