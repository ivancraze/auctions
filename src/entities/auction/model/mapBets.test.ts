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

  /** Проверяет fallback цены, победителя и обе причины отменённого статуса. */
  it('maps nested prices and bet statuses', () => {
    const result = mapBets([
      {
        organization_id: 10,
        is_win: true,
        price_info: { price_with_vat: 120000, price_no_vat: 100000 },
      },
      { organization_id: 20, is_rejected: true },
      { organization_id: 30, cancel_reason: 'Отозвана перевозчиком' },
    ])

    expect(result.rows[0]).toMatchObject({
      id: '0',
      isWinner: true,
      isCanceled: false,
    })
    expect(result.rows[0]?.priceWithVat).toContain('120')
    expect(result.rows[0]?.priceNoVat).toContain('100')
    expect(result.rows[1]?.isCanceled).toBe(true)
    expect(result.rows[2]).toMatchObject({
      isCanceled: true,
      cancelReason: 'Отозвана перевозчиком',
    })
  })
})
