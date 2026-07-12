import { describe, it, expect, vi, afterEach } from 'vitest'
import { localDateISO } from '@/lib/date'

describe('localDateISO', () => {
  afterEach(() => vi.restoreAllMocks())

  it('formats the current local calendar date without UTC conversion', () => {
    const mockDate = new Date('2024-10-21T00:30:00Z')
    vi.setSystemTime(mockDate)

    const local = localDateISO()

    expect(local).not.toContain('T')
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('formats an explicit date', () => {
    expect(localDateISO(new Date(2024, 0, 5))).toBe('2024-01-05')
  })
})
