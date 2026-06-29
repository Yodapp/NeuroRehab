import { describe, it, expect, vi, afterEach } from 'vitest'
import { getTodayPhase } from '../lib/protocol'

afterEach(() => {
  vi.useRealTimers()
})

describe('getTodayPhase', () => {
  it('returns active on day 0 of stamets_4_3', () => {
    const today = '2024-10-21'
    vi.setSystemTime(new Date(today + 'T10:00:00'))
    expect(getTodayPhase('stamets_4_3', today)).toBe('active')
  })

  it('returns active on day 3 of stamets_4_3', () => {
    vi.setSystemTime(new Date('2024-10-24T10:00:00'))
    expect(getTodayPhase('stamets_4_3', '2024-10-21')).toBe('active')
  })

  it('returns rest on day 4 of stamets_4_3', () => {
    vi.setSystemTime(new Date('2024-10-25T10:00:00'))
    expect(getTodayPhase('stamets_4_3', '2024-10-21')).toBe('rest')
  })

  it('returns rest on day 6 of stamets_4_3', () => {
    vi.setSystemTime(new Date('2024-10-27T10:00:00'))
    expect(getTodayPhase('stamets_4_3', '2024-10-21')).toBe('rest')
  })

  it('wraps correctly — day 7 is active again', () => {
    vi.setSystemTime(new Date('2024-10-28T10:00:00'))
    expect(getTodayPhase('stamets_4_3', '2024-10-21')).toBe('active')
  })

  it('returns active on day 4 of onward_5_2', () => {
    vi.setSystemTime(new Date('2024-10-25T10:00:00'))
    expect(getTodayPhase('onward_5_2', '2024-10-21')).toBe('active')
  })

  it('returns rest on day 5 of onward_5_2', () => {
    vi.setSystemTime(new Date('2024-10-26T10:00:00'))
    expect(getTodayPhase('onward_5_2', '2024-10-21')).toBe('rest')
  })

  it('returns none when protocol_type is none', () => {
    expect(getTodayPhase('none', '2024-10-21')).toBe('none')
  })

  it('returns none when start_date is null', () => {
    expect(getTodayPhase('stamets_4_3', null)).toBe('none')
  })
})
