import type { AuctionListRequest } from '@/entities/auction/model/types'
import type { AuctionSearch } from './searchSchema'

function toDateTime(value: string | undefined, endOfDay = false) {
  if (!value) return undefined
  const time = endOfDay ? '23:59:59.999' : '00:00:00.000'
  return `${value}T${time}Z`
}

export function buildAuctionListRequest(
  search: AuctionSearch,
  perPage: number,
): AuctionListRequest {
  return {
    page: search.page,
    per_page: perPage,
    cargo_num: search.cargo_num,
    status: search.status ? [search.status] : undefined,
    statuses: search.statuses ? [search.statuses] : undefined,
    auc_type: search.auc_type ? [search.auc_type] : undefined,
    load_city: search.load_city,
    unload_city: search.unload_city,
    load_date_from: toDateTime(search.load_date_from),
    load_date_to: toDateTime(search.load_date_to, true),
    is_available: search.is_available,
    is_bidder: search.is_bidder,
    current_price_from: search.current_price_from,
    current_price_to: search.current_price_to,
  }
}
