import type { components } from '@/shared/api'

export type AuctionListRequest = components['schemas']['AuctionListRequest']
export type AuctionListItem = components['schemas']['AuctionListItem']
export type AuctionListResponse =
  components['schemas']['AuctionListResponseBase']
export type AuctionDetails = components['schemas']['AuctionShowResponse']
export type BetItem = components['schemas']['BetItem']
export type BetListResponse = components['schemas']['BetListResponse']
export type SetBetRequest = components['schemas']['SetBetRequest']
export type ProblemDetail = components['schemas']['ProblemDetail']
export type ValidationProblem = components['schemas']['ValidationProblem']
