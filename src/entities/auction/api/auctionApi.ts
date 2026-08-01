import type {
  AuctionDetails,
  AuctionListRequest,
  AuctionListResponse,
  BetListResponse,
  SetBetRequest,
} from '../model/types'
import { apiRequest, apiRequestVoid } from '@/shared/api/client'
import {
  auctionDetailsResponseSchema,
  auctionListResponseSchema,
  betListResponseSchema,
} from '@/shared/api/responseSchemas'

export const auctionApi = {
  list(request: AuctionListRequest = {}, signal?: AbortSignal) {
    return apiRequest<AuctionListResponse>(
      '/auctions/list',
      {
        method: 'POST',
        body: JSON.stringify(request),
        signal,
      },
      auctionListResponseSchema,
    )
  },

  getByUuid(auctionUuid: string, signal?: AbortSignal) {
    return apiRequest<AuctionDetails>(
      `/auctions/${encodeURIComponent(auctionUuid)}`,
      {
        method: 'GET',
        signal,
      },
      auctionDetailsResponseSchema,
    )
  },

  getBets(
    auctionUuid: string,
    options: { all?: boolean | null; signal?: AbortSignal } = {},
  ) {
    const searchParams = new URLSearchParams()

    if (typeof options.all === 'boolean') {
      searchParams.set('all', String(options.all))
    }

    const search = searchParams.size > 0 ? `?${searchParams.toString()}` : ''

    return apiRequest<BetListResponse>(
      `/auctions/${encodeURIComponent(auctionUuid)}/bets${search}`,
      {
        method: 'GET',
        signal: options.signal,
      },
      betListResponseSchema,
    )
  },

  setBet(auctionUuid: string, request: SetBetRequest, signal?: AbortSignal) {
    return apiRequestVoid(`/auctions/${encodeURIComponent(auctionUuid)}/bets`, {
      method: 'POST',
      body: JSON.stringify(request),
      signal,
    })
  },
}
