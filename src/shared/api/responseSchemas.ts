import {
  GetAuctionResponse,
  ListAuctionsResponse,
  ListBetsResponse,
  ProblemDetail,
  ValidationProblem,
} from './generated/zod'

export const auctionListResponseSchema = ListAuctionsResponse
export const auctionDetailsResponseSchema = GetAuctionResponse
export const betListResponseSchema = ListBetsResponse
export const problemDetailSchema = ProblemDetail
export const validationProblemSchema = ValidationProblem
export const apiProblemSchema = ValidationProblem.or(ProblemDetail)
