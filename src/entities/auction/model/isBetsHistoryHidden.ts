import type { AuctionDetails } from './types'

export function isBetsHistoryHidden(details: AuctionDetails) {
  return Boolean(details.hide_bets_history || details.trading.hide_bets_history)
}
