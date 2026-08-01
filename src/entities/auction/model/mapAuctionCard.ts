import type { AuctionListItem } from './types'

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})
const numberFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 1,
})
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const auctionTypeLabels = {
  Request: 'Запрос предложений',
  Up: 'На повышение',
  Down: 'На понижение',
  FixPrice: 'Фиксированная цена',
  Unknown: 'Неизвестный тип',
} as const

const auctionStatusLabels = {
  Planning: 'Планирование',
  Auction: 'Торги идут',
  DeterminateWinner: 'Определение победителя',
  WaitDeal: 'Ожидание сделки',
  InProgress: 'В работе',
  Finished: 'Завершён',
  Stopped: 'Остановлен',
  Canceled: 'Отменён',
  Unknown: 'Неизвестный статус',
} as const

const userStatusLabels = {
  NotParticipating: 'Не участвуете',
  Leading: 'Ваша ставка лидирует',
  Losing: 'Вашу ставку перебили',
  Winner: 'Вы победили',
  Confirmed: 'Победа подтверждена',
  Unknown: 'Статус неизвестен',
} as const

type ActionTarget = '/auctions/$auctionUuid/bet' | '/auctions/$auctionUuid/bets'

export interface AuctionCardViewModel {
  uuid: string | null
  cargoNumber: string
  type: string
  status: string
  statusTone: 'active' | 'neutral' | 'danger' | 'success'
  userStatus: string
  route: string
  loadDate: string
  unloadDate: string
  cargoName: string
  cargoDetails: string
  currentPrice: string
  pricePerKm: string
  step: string
  hasOwnBet: boolean
  action:
    | { label: string; disabled: true }
    | { label: string; disabled: false; to: ActionTarget }
}

function formatDate(value: string | undefined) {
  if (!value || Number.isNaN(Date.parse(value))) return 'Не указано'
  return dateFormatter.format(new Date(value))
}

function formatMoney(value: number | null | undefined) {
  return value == null ? 'Не указано' : moneyFormatter.format(value)
}

function getAction(
  uuid: string | null,
  canSetBet: boolean,
  hasOwnBet: boolean,
): AuctionCardViewModel['action'] {
  if (!uuid) return { label: 'Недоступно', disabled: true }
  if (canSetBet) {
    return {
      label: hasOwnBet ? 'Изменить ставку' : 'Сделать ставку',
      disabled: false,
      to: '/auctions/$auctionUuid/bet',
    }
  }
  if (hasOwnBet) {
    return {
      label: 'Смотреть ставки',
      disabled: false,
      to: '/auctions/$auctionUuid/bets',
    }
  }
  return { label: 'Ставки недоступны', disabled: true }
}

export function mapAuctionCard(auction: AuctionListItem): AuctionCardViewModel {
  const status = auction.trading?.status ?? 'Unknown'
  const userStatus = auction.trading?.status_mobile ?? 'Unknown'
  const hasOwnBet = auction.trading?.your?.bet ?? false
  const weight = auction.cargo?.weight
  const volume = auction.cargo?.volume
  const bodyType = auction.cargo?.body_type
  const cargoDetails = [
    weight == null ? null : `${numberFormatter.format(weight)} т`,
    volume == null ? null : `${numberFormatter.format(volume)} м³`,
    bodyType,
  ]
    .filter(Boolean)
    .join(' · ')

  return {
    uuid: auction.main?.order_uid ?? null,
    cargoNumber: auction.main?.cargo_num ?? 'Без номера',
    type: auctionTypeLabels[auction.main?.auc_type ?? 'Unknown'],
    status: auctionStatusLabels[status],
    statusTone:
      status === 'Auction'
        ? 'active'
        : status === 'Canceled' || status === 'Stopped'
          ? 'danger'
          : status === 'Finished'
            ? 'success'
            : 'neutral',
    userStatus: userStatusLabels[userStatus],
    route: `${auction.route?.load?.city ?? 'Не указано'} → ${auction.route?.unload?.city ?? 'Не указано'}`,
    loadDate: formatDate(auction.route?.load?.date),
    unloadDate: formatDate(auction.route?.unload?.date),
    cargoName: auction.cargo?.name ?? 'Груз не указан',
    cargoDetails: cargoDetails || 'Характеристики не указаны',
    currentPrice: formatMoney(auction.trading?.price?.current),
    pricePerKm:
      auction.main?.price_per_km == null
        ? 'Не указано'
        : `${moneyFormatter.format(auction.main.price_per_km)} / км`,
    step: 'На странице аукциона',
    hasOwnBet,
    action: getAction(
      auction.main?.order_uid ?? null,
      auction.trading?.can_set_bet ?? false,
      hasOwnBet,
    ),
  }
}
