import { describe, expect, it } from 'vitest'

import { auctionApi } from '@/entities/auction'
import { ApiError } from '@/shared/api'

const availableAuctionUuid = '550e8400-e29b-41d4-a716-446655440001'
const auctionWithCanceledBetUuid = '550e8400-e29b-41d4-a716-446655440002'

describe('auction MSW handlers', () => {
  it('filters and paginates the auction list', async () => {
    const response = await auctionApi.list({
      load_city: 'Самара',
      page: 1,
      per_page: 1,
    })

    expect(response.data).toHaveLength(1)
    expect(response.data?.[0]?.route?.load?.city).toBe('Самара')
    expect(response.meta?.current_page).toBe(1)
    expect(response.meta?.per_page).toBe(1)
    expect(response.meta?.total).toBeGreaterThan(1)
    expect(response.meta?.last_page).toBe(response.meta?.total)
  })

  it('returns canceled bets only when all=true', async () => {
    const active = await auctionApi.getBets(auctionWithCanceledBetUuid)
    const all = await auctionApi.getBets(auctionWithCanceledBetUuid, {
      all: true,
    })

    expect(active.bets).toHaveLength(1)
    expect(all.bets).toHaveLength(2)
    expect(all.bets.some((bet) => bet.is_rejected)).toBe(true)
  })

  it('updates list, detail and bets after setting a bet', async () => {
    const [detailBefore, betsBefore] = await Promise.all([
      auctionApi.getByUuid(availableAuctionUuid),
      auctionApi.getBets(availableAuctionUuid),
    ])

    expect(detailBefore.trading.price).toMatchObject({
      current: 120000,
      available: 119000,
    })
    expect(detailBefore.trading.status_mobile).toBe('NotParticipating')

    await auctionApi.setBet(availableAuctionUuid, { price: 119000 })

    const [detail, list, bets] = await Promise.all([
      auctionApi.getByUuid(availableAuctionUuid),
      auctionApi.list({ cargo_num: '00000001001' }),
      auctionApi.getBets(availableAuctionUuid),
    ])

    expect(detail.trading.price).toMatchObject({
      current: 119000,
      available: 118000,
    })
    expect(detail.trading.price?.available_no_vat).toBeCloseTo(118000 / 1.2)
    expect(detail.trading.status_mobile).toBe('Leading')
    expect(detail.trading.is_bidder).toBe(true)
    expect(detail.trading.your).toMatchObject({
      bet: true,
      last_bet: 119000,
      last_bet_with_vat: 119000,
      win: false,
    })
    expect(list.data?.[0]?.trading?.price?.current).toBe(119000)
    expect(list.data?.[0]?.trading?.status_mobile).toBe('Leading')
    expect(list.data?.[0]?.trading?.is_bidder).toBe(true)
    expect(list.data?.[0]?.trading?.your).toMatchObject({
      bet: true,
      last_bet: 119000,
    })
    expect(bets.bets).toHaveLength(betsBefore.bets.length + 1)
    expect(bets.bets[0]).toMatchObject({
      price_with_vat: 119000,
      price_no_vat: 119000 / 1.2,
      organization_name: 'ООО Моя компания',
      is_rejected: false,
    })
  })

  it.each([
    [-1000, 'min_value'],
    [0, 'min_value'],
    [9000, 'min_value'],
    [301000, 'max_value'],
    [119500, 'invalid_step'],
  ])(
    'returns a contract-shaped 422 for invalid price %s',
    async (price, code) => {
      const result = auctionApi.setBet(availableAuctionUuid, { price })

      await expect(result).rejects.toBeInstanceOf(ApiError)
      await expect(result).rejects.toMatchObject({
        status: 422,
        problem: {
          code: 'validation_failed',
          errors: [expect.objectContaining({ field: 'price', code })],
        },
      })
    },
  )

  it('rejects a bet when the auction does not allow bidding', async () => {
    const result = auctionApi.setBet('550e8400-e29b-41d4-a716-446655440003', {
      price: 74000,
    })

    await expect(result).rejects.toMatchObject({
      status: 422,
      problem: {
        errors: [
          expect.objectContaining({
            field: 'price',
            code: 'bet_not_allowed',
          }),
        ],
      },
    })
  })

  it('returns a required validation error for an empty request body', async () => {
    const response = await fetch(
      `/api/v1/auctions/${availableAuctionUuid}/bets`,
      { method: 'POST' },
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toMatchObject({
      code: 'validation_failed',
      errors: [expect.objectContaining({ field: 'price', code: 'required' })],
    })
  })

  it('returns a contract-shaped 404 for an unknown auction', async () => {
    const result = auctionApi.getByUuid('00000000-0000-0000-0000-000000000000')

    await expect(result).rejects.toMatchObject({
      status: 404,
      problem: { code: 'resource_not_found' },
    })
  })
})
