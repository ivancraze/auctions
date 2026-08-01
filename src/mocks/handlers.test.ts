import { describe, expect, it } from 'vitest'

import { auctionApi } from '@/entities/auction/api/auctionApi'
import { ApiError } from '@/shared/api/client'

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
    await auctionApi.setBet(availableAuctionUuid, { price: 119000 })

    const [detail, list, bets] = await Promise.all([
      auctionApi.getByUuid(availableAuctionUuid),
      auctionApi.list({ cargo_num: '00000001001' }),
      auctionApi.getBets(availableAuctionUuid),
    ])

    expect(detail.trading.price?.current).toBe(119000)
    expect(detail.trading.status_mobile).toBe('Leading')
    expect(detail.trading.your?.bet).toBe(true)
    expect(list.data?.[0]?.trading?.price?.current).toBe(119000)
    expect(list.data?.[0]?.trading?.is_bidder).toBe(true)
    expect(bets.bets[0]).toMatchObject({
      price_with_vat: 119000,
      organization_name: 'ООО Моя компания',
    })
  })

  it('returns a contract-shaped 422 for an invalid step', async () => {
    const result = auctionApi.setBet(availableAuctionUuid, { price: 119500 })

    await expect(result).rejects.toBeInstanceOf(ApiError)
    await expect(result).rejects.toMatchObject({
      status: 422,
      problem: {
        code: 'validation_failed',
        errors: [
          expect.objectContaining({ field: 'price', code: 'invalid_step' }),
        ],
      },
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
