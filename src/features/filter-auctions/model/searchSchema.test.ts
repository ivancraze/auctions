import { describe, expect, it } from 'vitest'

import { buildAuctionListRequest } from './buildAuctionListRequest'
import { auctionSearchSchema } from './searchSchema'

describe('auction search params', () => {
  /** Проверяет безопасные значения по умолчанию для некорректных параметров URL. */
  it('uses safe fallback values for invalid URL input', () => {
    const result = auctionSearchSchema.parse({
      page: 'invalid',
      status: 'HackedStatus',
      current_price_from: '-10',
      is_available: 'unexpected',
    })

    expect(result).toEqual({
      page: 1,
      status: undefined,
      current_price_from: undefined,
      is_available: undefined,
    })
  })

  /** Проверяет преобразование валидных параметров поиска в запрос по OpenAPI. */
  it('builds an OpenAPI list request from validated search params', () => {
    const search = auctionSearchSchema.parse({
      page: 2,
      status: 'Leading',
      statuses: 2,
      auc_type: 'Down',
      load_city: 'Самара',
      load_date_from: '2026-08-01',
      load_date_to: '2026-08-05',
      is_available: true,
      current_price_from: 50000,
    })

    const request = buildAuctionListRequest(search, 20)

    expect(request).toMatchObject({
      page: 2,
      per_page: 20,
      status: ['Leading'],
      statuses: [2],
      auc_type: ['Down'],
      load_city: 'Самара',
      is_available: true,
      current_price_from: 50000,
    })
    expect(request.load_date_from).toMatch(/^2026-08-01T/)
    expect(request.load_date_to).toMatch(/^2026-08-05T/)
  })

  /** Проверяет поддержку всех строковых статусов пользователя из OpenAPI. */
  it.each([
    'NotParticipating',
    'Leading',
    'Losing',
    'OnPending',
    'Confirmed',
    'ChoosingWinner',
    'Winner',
    'Accepted',
    'Unknown',
  ] as const)('accepts the %s user status from OpenAPI', (status) => {
    const search = auctionSearchSchema.parse({ status })

    expect(search.status).toBe(status)
    expect(buildAuctionListRequest(search, 20).status).toEqual([status])
  })

  /** Проверяет отбрасывание числового статуса вне диапазона request DTO. */
  it('rejects auction status 8 outside the OpenAPI request range', () => {
    const search = auctionSearchSchema.parse({ statuses: 8 })

    expect(search.statuses).toBeUndefined()
    expect(buildAuctionListRequest(search, 20).statuses).toBeUndefined()
  })
})
