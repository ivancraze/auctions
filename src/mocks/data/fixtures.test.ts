import { describe, expect, it } from 'vitest'

import { createInitialMockData } from './fixtures'
import {
  auctionDetailsResponseSchema,
  auctionListResponseSchema,
  betListResponseSchema,
} from '@/shared/api/responseSchemas'

describe('auction fixtures', () => {
  it('covers all auction, type and user status enum values', () => {
    const { auctions } = createInitialMockData()

    expect(auctions).toHaveLength(35)
    expect(new Set(auctions.map((item) => item.main?.auc_type))).toEqual(
      new Set(['Request', 'Up', 'Down', 'FixPrice', 'Unknown']),
    )
    expect(new Set(auctions.map((item) => item.trading?.status))).toEqual(
      new Set([
        'Planning',
        'Auction',
        'DeterminateWinner',
        'WaitDeal',
        'InProgress',
        'Finished',
        'Stopped',
        'Canceled',
        'Unknown',
      ]),
    )
    expect(
      new Set(auctions.map((item) => item.trading?.status_mobile)),
    ).toEqual(
      new Set([
        'NotParticipating',
        'Leading',
        'Losing',
        'Winner',
        'Confirmed',
        'Unknown',
      ]),
    )
  })

  it('contains diverse restrictions, histories and nullable price limits', () => {
    const data = createInitialMockData()
    const details = Object.values(data.details)
    const histories = Object.values(data.bets)

    expect(details.some((item) => item.trading.can_set_bet)).toBe(true)
    expect(details.some((item) => item.trading.hide_bets_history)).toBe(true)
    expect(
      details.some((item) => item.trading.hide_points_address_and_contacts),
    ).toBe(true)
    expect(details.some((item) => item.trading.no_view_cargo_price)).toBe(true)
    expect(
      details.some(
        (item) =>
          item.trading.price?.min === null ||
          item.trading.price?.max === null ||
          item.trading.price?.step === null,
      ),
    ).toBe(true)
    expect(histories.some((bets) => bets.length === 0)).toBe(true)
    expect(histories.some((bets) => bets.length >= 4)).toBe(true)
    expect(histories.some((bets) => bets.some((bet) => bet.is_rejected))).toBe(
      true,
    )
  })

  it('keeps every generated fixture inside the runtime API contract', () => {
    const data = createInitialMockData()

    expect(
      auctionListResponseSchema.safeParse({ data: data.auctions }).success,
    ).toBe(true)
    expect(
      Object.values(data.details).every(
        (detail) => auctionDetailsResponseSchema.safeParse(detail).success,
      ),
    ).toBe(true)
    expect(
      Object.values(data.bets).every(
        (bets) => betListResponseSchema.safeParse({ bets }).success,
      ),
    ).toBe(true)
  })
})
