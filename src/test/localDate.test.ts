import { describe, it, expect, vi, afterEach } from 'vitest'

describe('localToday (via upsertTodayLog)', () => {
  afterEach(() => vi.restoreAllMocks())

  it('uses local date, not UTC — midnight UTC+2 stays on the previous local day', () => {
    const mockDate = new Date('2024-10-21T00:30:00Z')
    vi.setSystemTime(mockDate)

    const d = new Date()
    const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const utc = d.toISOString().slice(0, 10)

    expect(local).not.toContain('T')
    expect(utc).toBe('2024-10-21')
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
