import type { AuctionDetails } from './types'

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const typeLabels = {
  Request: 'Запрос предложений',
  Up: 'На повышение',
  Down: 'На понижение',
  FixPrice: 'Фиксированная цена',
  Unknown: 'Неизвестный тип',
} as const

const statusLabels = {
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

const userStatusLabels: Record<string, string> = {
  NotParticipating: 'Не участвуете',
  Leading: 'Ваша ставка лидирует',
  Losing: 'Вашу ставку перебили',
  OnPending: 'Ставка ожидает решения',
  Confirmed: 'Победа подтверждена',
  ChoosingWinner: 'Заказчик выбирает победителя',
  Winner: 'Вы победили',
  Accepted: 'Ставка принята',
  Unknown: 'Статус неизвестен',
}

function formatDate(value: string | null | undefined) {
  return value && !Number.isNaN(Date.parse(value))
    ? dateFormatter.format(new Date(value))
    : 'Не указано'
}

function formatMoney(value: number | null | undefined) {
  return value == null ? 'Не указано' : moneyFormatter.format(value)
}

function valueOrFallback(value: string | number | null | undefined) {
  return value == null || value === '' ? 'Не указано' : String(value)
}

export interface AuctionDetailsViewModel {
  uuid: string
  cargoNumber: string
  type: string
  status: string
  userStatus: string
  organizer: { name: string; inn: string; kpp: string }
  contacts: { name: string; phone: string; email: string }[]
  routes: {
    key: string
    operation: string
    city: string
    address: string | null
    interval: string
    contact: string | null
    cargo: string
  }[]
  cargo: {
    name: string
    characteristics: string
    bodyType: string
    temperature: string
    car: string
  }
  payment: { form: string; condition: string; delay: string; prepay: string }
  trading: {
    start: string
    stop: string
    current: string
    currentNoVat: string
    available: string
    min: string
    max: string
    step: string
    pricePerKm: string
    ownBet: string
  }
  canSetBet: boolean
  hideBetsHistory: boolean
  hideContacts: boolean
  noViewCargoPrice: boolean
}

export function mapAuctionDetails(
  details: AuctionDetails,
): AuctionDetailsViewModel {
  const hideContacts = details.trading.hide_points_address_and_contacts ?? false
  const firstCargo = details.routes[0]?.cargo
  const car = details.cargo.car
  const delay = details.payment.delay
  const delayType =
    details.payment.delay_type === 'WorkDays'
      ? 'рабочих дней'
      : 'календарных дней'

  return {
    uuid: details.main.order_uid ?? '',
    cargoNumber: details.main.cargo_num ?? 'Без номера',
    type: typeLabels[details.main.auc_type ?? 'Unknown'],
    status: statusLabels[details.trading.status ?? 'Unknown'],
    userStatus:
      userStatusLabels[details.trading.status_mobile ?? 'Unknown'] ??
      'Статус неизвестен',
    organizer: {
      name: details.organizer.organization_name ?? 'Не указано',
      inn: details.organizer.organization_inn ?? 'Не указано',
      kpp: details.organizer.organization_kpp ?? 'Не указано',
    },
    contacts: hideContacts
      ? []
      : details.contacts.map((contact) => ({
          name: valueOrFallback(contact.name),
          phone: valueOrFallback(contact.phone),
          email: valueOrFallback(contact.email),
        })),
    routes: details.routes.map((route, index) => ({
      key: `${route.row_num ?? index}-${route.op_type ?? 'Unknown'}`,
      operation:
        route.op_type === 'Loading'
          ? 'Погрузка'
          : route.op_type === 'Unloading'
            ? 'Выгрузка'
            : 'Точка маршрута',
      city:
        route.location?.city_full_name ??
        route.location?.city_name ??
        'Не указано',
      address: hideContacts ? null : (route.location?.loading_address ?? null),
      interval: `${formatDate(route.start_date)} — ${formatDate(route.end_date)}`,
      contact: hideContacts
        ? null
        : [route.contact?.name, route.contact?.phone]
            .filter(Boolean)
            .join(', ') || null,
      cargo:
        [
          route.cargo?.name,
          route.cargo?.weight ? `${route.cargo.weight} т` : null,
        ]
          .filter(Boolean)
          .join(' · ') || 'Груз не указан',
    })),
    cargo: {
      name: firstCargo?.name ?? 'Не указано',
      characteristics:
        [
          firstCargo?.weight ? `${firstCargo.weight} т` : null,
          firstCargo?.volume ? `${firstCargo.volume} м³` : null,
          firstCargo?.package_amount
            ? `${firstCargo.package_amount} мест`
            : null,
        ]
          .filter(Boolean)
          .join(' · ') || 'Не указано',
      bodyType: details.cargo.body_type ?? 'Не указано',
      temperature:
        details.cargo.temp_from == null && details.cargo.temp_to == null
          ? 'Не требуется'
          : `${valueOrFallback(details.cargo.temp_from)}…${valueOrFallback(details.cargo.temp_to)} °C`,
      car: car
        ? [
            car.type,
            car.weight ? `${car.weight} т` : null,
            car.volume ? `${car.volume} м³` : null,
          ]
            .filter(Boolean)
            .join(' · ')
        : 'Требования не указаны',
    },
    payment: {
      form: details.payment.form ?? 'Не указано',
      condition:
        details.payment.condition ??
        details.payment.condition_predefined ??
        'Не указано',
      delay: delay == null ? 'Без отсрочки' : `${delay} ${delayType}`,
      prepay: details.payment.prepay ?? 'Не предусмотрена',
    },
    trading: {
      start: formatDate(details.trading.start_time),
      stop: formatDate(details.trading.stop_time),
      current: formatMoney(details.trading.price?.current),
      currentNoVat: formatMoney(details.trading.price?.current_no_vat),
      available: formatMoney(details.trading.price?.available),
      min: formatMoney(details.trading.price?.min),
      max: formatMoney(details.trading.price?.max),
      step: formatMoney(details.trading.price?.step),
      pricePerKm: formatMoney(details.trading.price?.price_per_km),
      ownBet: details.trading.your?.bet
        ? formatMoney(
            details.trading.your.last_bet_with_vat ??
              details.trading.your.last_bet,
          )
        : 'Ставки нет',
    },
    canSetBet: details.trading.can_set_bet ?? false,
    hideBetsHistory:
      details.hide_bets_history ?? details.trading.hide_bets_history ?? false,
    hideContacts,
    noViewCargoPrice: details.trading.no_view_cargo_price ?? false,
  }
}
