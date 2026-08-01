import { queryOptions } from '@tanstack/react-query'

import type { AuctionListRequest } from '../model/types'
import { auctionApi } from './auctionApi'
import { auctionKeys } from './auctionKeys'

export const auctionQueries = {
  list: (request: AuctionListRequest) =>
    queryOptions({
      queryKey: auctionKeys.list(request),
      queryFn: ({ signal }) => auctionApi.list(request, signal),
    }),
  detail: (auctionUuid: string) =>
    queryOptions({
      queryKey: auctionKeys.detail(auctionUuid),
      queryFn: ({ signal }) => auctionApi.getByUuid(auctionUuid, signal),
    }),
  bets: (auctionUuid: string, all: boolean) =>
    queryOptions({
      queryKey: auctionKeys.bets(auctionUuid, all),
      queryFn: ({ signal }) => auctionApi.getBets(auctionUuid, { all, signal }),
    }),
}
