import { describe, expect, it } from 'vitest'

import { mapAuctionDetails } from './mapAuctionDetails'
import { createInitialMockData } from '@/mocks/data/fixtures'

describe('auction detail mappers', () => {
  /** Проверяет, что защищённые адреса и контакты не попадают в ViewModel. */
  it('removes protected addresses and contacts from the view model', () => {
    const details =
      createInitialMockData().details['550e8400-e29b-41d4-a716-446655440003']
    expect(details).toBeDefined()

    const result = mapAuctionDetails(details!)

    expect(result.hideContacts).toBe(true)
    expect(result.contacts).toEqual([])
    expect(result.routes.every((route) => route.address === null)).toBe(true)
    expect(result.routes.every((route) => route.contact === null)).toBe(true)
  })

  /** Проверяет безопасное скрытие истории, если это требует хотя бы один флаг API. */
  it('hides bets history when either backend flag requires it', () => {
    const details =
      createInitialMockData().details['550e8400-e29b-41d4-a716-446655440002']
    expect(details).toBeDefined()
    details!.hide_bets_history = false
    details!.trading.hide_bets_history = true

    expect(mapAuctionDetails(details!).hideBetsHistory).toBe(true)
  })
})
