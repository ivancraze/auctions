import { describe, expect, it } from 'vitest'

import { mapAuctionDetails } from './mapAuctionDetails'
import { mapBets } from './mapBets'
import { createInitialMockData } from '@/mocks/data/fixtures'

describe('auction detail mappers', () => {
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
