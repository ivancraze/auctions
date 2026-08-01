import type { AuctionListRequest } from '../model/types'

export const auctionKeys = {
  all: ['auctions'] as const,
  lists: () => [...auctionKeys.all, 'list'] as const,
  list: (request: AuctionListRequest) =>
    [...auctionKeys.lists(), request] as const,
  details: () => [...auctionKeys.all, 'detail'] as const,
  detail: (auctionUuid: string) =>
    [...auctionKeys.details(), auctionUuid] as const,
  betsRoot: (auctionUuid: string) =>
    [...auctionKeys.detail(auctionUuid), 'bets'] as const,
  bets: (auctionUuid: string, all = false) =>
    [...auctionKeys.betsRoot(auctionUuid), { all }] as const,
}
