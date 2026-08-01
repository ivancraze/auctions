import type { BetItem } from './types'

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
})
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export interface BetViewModel {
  id: string
  createdAt: string
  carrier: string
  inn: string
  priceWithVat: string
  priceNoVat: string
  place: string
  isWinner: boolean
  isCanceled: boolean
  cancelReason: string | null
}

function formatMoney(value: number | null | undefined) {
  return value == null ? 'Не указано' : moneyFormatter.format(value)
}

export function mapBets(bets: BetItem[]) {
  const participants = new Set(
    bets.map((bet) =>
      bet.organization_id != null
        ? `organization:${bet.organization_id}`
        : `subscriber:${bet.subscriber_id ?? 'unknown'}`,
    ),
  ).size

  return {
    participants,
    rows: bets.map<BetViewModel>((bet, index) => ({
      id: String(bet.id ?? index),
      createdAt:
        bet.created_at && !Number.isNaN(Date.parse(bet.created_at))
          ? dateFormatter.format(new Date(bet.created_at))
          : 'Не указано',
      carrier: bet.organization_name || 'Перевозчик не указан',
      inn: bet.organization_inn || 'Не указан',
      priceWithVat: formatMoney(
        bet.price_with_vat ?? bet.price_info?.price_with_vat,
      ),
      priceNoVat: formatMoney(bet.price_no_vat ?? bet.price_info?.price_no_vat),
      place: bet.place == null ? '—' : String(bet.place),
      isWinner: bet.is_win ?? false,
      isCanceled: (bet.is_rejected ?? false) || Boolean(bet.cancel_reason),
      cancelReason: bet.cancel_reason || null,
    })),
  }
}
