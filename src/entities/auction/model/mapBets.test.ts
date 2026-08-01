import { describe, expect, it } from 'vitest'

import { mapBets } from './mapBets'

describe('mapBets', () => {
  /** Проверяет подсчёт уникальных перевозчиков вместо количества ставок. */
  it('counts unique carriers instead of individual bets', () => {
    const result = mapBets([
      { id: 1, organization_id: 10 },
      { id: 2, organization_id: 10 },
      { id: 3, organization_id: 20 },
    ])

    expect(result.participants).toBe(2)
    expect(result.rows).toHaveLength(3)
  })
})
