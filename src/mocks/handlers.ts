import { delay, http, HttpResponse } from 'msw'

import { mockStore } from './store'
import type {
  AuctionDetails,
  AuctionListItem,
  AuctionListRequest,
  BetItem,
  ProblemDetail,
  SetBetRequest,
  ValidationProblem,
} from '@/entities/auction'

const API_URL = '/api/v1'
const AUCTION_LIST_DELAY_MS = 700

const auctionStatusById = [
  'Planning',
  'Auction',
  'DeterminateWinner',
  'WaitDeal',
  'InProgress',
  'Finished',
  'Stopped',
  'Canceled',
] as const

const userStatusById = [
  'NotParticipating',
  'Leading',
  'Losing',
  'Winner',
  'Confirmed',
] as const

function validationProblem(
  field: string,
  message: string,
  code: string,
): ValidationProblem {
  return {
    code: 'validation_failed',
    title: 'Ошибка валидации',
    message: 'Запрос содержит некорректные поля.',
    errors: [{ field, message, code }],
  }
}

function notFound(message = 'Аукцион не найден'): ProblemDetail {
  return {
    code: 'resource_not_found',
    title: 'Не найдено',
    message,
  }
}

function includesText(value: string | undefined, search: string | undefined) {
  return (
    !search || value?.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  )
}

function inDateRange(
  value: string | undefined,
  from: string | undefined,
  to: string | undefined,
) {
  if (!value) return !from && !to
  const timestamp = Date.parse(value)

  return (
    (!from || timestamp >= Date.parse(from)) &&
    (!to || timestamp <= Date.parse(to))
  )
}

function filterAuctions(
  auctions: AuctionListItem[],
  request: AuctionListRequest,
) {
  const statuses = request.status ?? []
  const numericStatuses = (request.statuses ?? [])
    .map((status) => auctionStatusById[status - 1])
    .filter((status) => status !== undefined)
  const mobileStatuses = (request.mobile_statuses ?? [])
    .map((status) => userStatusById[status - 1])
    .filter((status) => status !== undefined)

  return auctions.filter((auction) => {
    const currentPrice = auction.trading?.price?.current
    const pricePerKm = auction.main?.price_per_km

    return (
      includesText(auction.main?.cargo_num, request.cargo_num) &&
      (statuses.length === 0 ||
        (auction.trading?.status_mobile !== undefined &&
          statuses.includes(auction.trading.status_mobile))) &&
      (numericStatuses.length === 0 ||
        (auction.trading?.status !== undefined &&
          numericStatuses.some(
            (status) => status === auction.trading?.status,
          ))) &&
      (mobileStatuses.length === 0 ||
        (auction.trading?.status_mobile !== undefined &&
          mobileStatuses.some(
            (status) => status === auction.trading?.status_mobile,
          ))) &&
      (!request.auc_type?.length ||
        (auction.main?.auc_type !== undefined &&
          request.auc_type.some((type) => type === auction.main?.auc_type))) &&
      includesText(auction.route?.load?.city, request.load_city) &&
      includesText(auction.route?.unload?.city, request.unload_city) &&
      (!request.load_gc_id ||
        auction.route?.load?.city_gc_id === request.load_gc_id) &&
      (!request.unload_gc_id ||
        auction.route?.unload?.city_gc_id === request.unload_gc_id) &&
      inDateRange(
        auction.route?.load?.date,
        request.load_date_from,
        request.load_date_to,
      ) &&
      inDateRange(
        auction.route?.unload?.date,
        request.unload_date_from,
        request.unload_date_to,
      ) &&
      inDateRange(
        auction.main?.created_at,
        request.create_date_from,
        request.create_date_to,
      ) &&
      inDateRange(
        auction.trading?.start_time,
        request.start_time_from,
        request.start_time_to,
      ) &&
      inDateRange(
        auction.trading?.stop_time,
        request.stop_time_from,
        request.stop_time_to,
      ) &&
      (request.is_available === undefined ||
        auction.trading?.is_available === request.is_available) &&
      (request.is_favorite === undefined ||
        auction.trading?.is_favorite === request.is_favorite) &&
      (request.is_bidder === undefined ||
        auction.trading?.is_bidder === request.is_bidder) &&
      (request.is_international_shipment === undefined ||
        auction.cargo?.is_international ===
          request.is_international_shipment) &&
      (!request.body_types?.length ||
        (auction.cargo?.body_type !== undefined &&
          request.body_types.includes(auction.cargo.body_type))) &&
      (request.weight_from === undefined ||
        (auction.cargo?.weight ?? -Infinity) >= request.weight_from) &&
      (request.weight_to === undefined ||
        (auction.cargo?.weight ?? Infinity) <= request.weight_to) &&
      (request.volume_from === undefined ||
        (auction.cargo?.volume ?? -Infinity) >= request.volume_from) &&
      (request.volume_to === undefined ||
        (auction.cargo?.volume ?? Infinity) <= request.volume_to) &&
      (request.current_price_from === undefined ||
        request.current_price_from === null ||
        (currentPrice ?? -Infinity) >= request.current_price_from) &&
      (request.current_price_to === undefined ||
        request.current_price_to === null ||
        (currentPrice ?? Infinity) <= request.current_price_to) &&
      (request.price_per_km_from === undefined ||
        request.price_per_km_from === null ||
        (pricePerKm ?? -Infinity) >= request.price_per_km_from) &&
      (request.price_per_km_to === undefined ||
        request.price_per_km_to === null ||
        (pricePerKm ?? Infinity) <= request.price_per_km_to) &&
      (!request.auction_ids?.length ||
        (auction.main?.id !== undefined &&
          request.auction_ids.includes(auction.main.id))) &&
      includesText(auction.organizer?.organization_name, request.customer) &&
      (!request.customer_ids?.length ||
        (auction.organizer?.organization_id !== undefined &&
          request.customer_ids.includes(auction.organizer.organization_id)))
    )
  })
}

function sortAuctions(
  auctions: AuctionListItem[],
  request: AuctionListRequest,
) {
  const result = [...auctions]
  const sort = request.sort ?? {}
  const [field, direction] = Object.entries(sort)[0] ?? []
  const multiplier = direction === 'asc' ? 1 : -1

  if (field) {
    const getValue = (auction: AuctionListItem) => {
      if (field === 'start_time') {
        return Date.parse(auction.trading?.start_time ?? '') || 0
      }
      if (field === 'price_per_km') return auction.main?.price_per_km ?? 0
      if (field === 'current_price') return auction.trading?.price?.current ?? 0
      return 0
    }

    return result.sort(
      (left, right) => (getValue(left) - getValue(right)) * multiplier,
    )
  }

  return result.sort((left, right) => {
    const leftDate = Date.parse(left.main?.created_at ?? '') || 0
    const rightDate = Date.parse(right.main?.created_at ?? '') || 0
    return (leftDate - rightDate) * (request.is_oldest ? 1 : -1)
  })
}

function isValidStep(
  price: number,
  min: number | null | undefined,
  step: number,
) {
  const steps = (price - (min ?? 0)) / step
  return Math.abs(steps - Math.round(steps)) < 1e-8
}

function updatePrice(detail: AuctionDetails, price: number) {
  const tradingPrice = detail.trading.price
  const step = tradingPrice?.step ?? 0
  const isUp = detail.main.auc_type === 'Up'
  const nextAvailable = price + (isUp ? step : -step)

  if (tradingPrice) {
    tradingPrice.current = price
    tradingPrice.current_no_vat = price / 1.2
    tradingPrice.available = Math.min(
      tradingPrice.max ?? Infinity,
      Math.max(tradingPrice.min ?? -Infinity, nextAvailable),
    )
    tradingPrice.available_no_vat = tradingPrice.available / 1.2
  }

  detail.trading.status_mobile = 'Leading'
  detail.trading.is_bidder = true
  detail.trading.your = {
    ...(detail.trading.your ?? {}),
    bet: true,
    last_bet: price,
    last_bet_with_vat: price,
    win: false,
  }
}

export const handlers = [
  http.post(`${API_URL}/auctions/list`, async ({ request }) => {
    await delay(AUCTION_LIST_DELAY_MS)

    let body: AuctionListRequest

    try {
      const text = await request.text()
      body = text ? (JSON.parse(text) as AuctionListRequest) : {}
    } catch {
      return HttpResponse.json(
        validationProblem('request', 'Некорректный JSON.', 'invalid_json'),
        { status: 422 },
      )
    }

    const page = body.page ?? 1
    const perPage = body.per_page ?? 20

    if (!Number.isInteger(page) || page < 1) {
      return HttpResponse.json(
        validationProblem(
          'page',
          'Страница должна быть целым числом больше нуля.',
          'min_value',
        ),
        { status: 422 },
      )
    }
    if (!Number.isInteger(perPage) || perPage < 1 || perPage > 100) {
      return HttpResponse.json(
        validationProblem(
          'per_page',
          'Количество должно быть от 1 до 100.',
          'range',
        ),
        { status: 422 },
      )
    }

    const filtered = sortAuctions(
      filterAuctions(mockStore.auctions, body),
      body,
    )
    const start = (page - 1) * perPage
    const data = filtered.slice(start, start + perPage)

    return HttpResponse.json({
      data,
      meta: {
        current_page: page,
        from: data.length ? start + 1 : 0,
        last_page: Math.max(1, Math.ceil(filtered.length / perPage)),
        per_page: perPage,
        to: data.length ? start + data.length : 0,
        total: filtered.length,
      },
    })
  }),

  http.get(`${API_URL}/auctions/:auctionUuid`, ({ params }) => {
    const detail = mockStore.details[String(params.auctionUuid)]
    return detail
      ? HttpResponse.json(detail)
      : HttpResponse.json(notFound(), { status: 404 })
  }),

  http.get(`${API_URL}/auctions/:auctionUuid/bets`, ({ params, request }) => {
    const auctionUuid = String(params.auctionUuid)
    const bets = mockStore.bets[auctionUuid]
    if (!bets) return HttpResponse.json(notFound(), { status: 404 })

    const includeCanceled =
      new URL(request.url).searchParams.get('all') === 'true'
    return HttpResponse.json({
      bets: includeCanceled
        ? bets
        : bets.filter((bet) => !bet.is_rejected && !bet.cancel_reason),
    })
  }),

  http.post(
    `${API_URL}/auctions/:auctionUuid/bets`,
    async ({ params, request }) => {
      const auctionUuid = String(params.auctionUuid)
      const detail = mockStore.details[auctionUuid]
      if (!detail) return HttpResponse.json(notFound(), { status: 404 })

      let body: SetBetRequest
      try {
        body = (await request.json()) as SetBetRequest
      } catch {
        return HttpResponse.json(
          validationProblem('price', 'Цена обязательна.', 'required'),
          { status: 422 },
        )
      }

      const price = body.price
      const constraints = detail.trading.price
      let problem: ValidationProblem | undefined

      if (!detail.trading.can_set_bet) {
        problem = validationProblem(
          'price',
          'Ставки для этого аукциона недоступны.',
          'bet_not_allowed',
        )
      } else if (
        typeof price !== 'number' ||
        !Number.isFinite(price) ||
        price <= 0
      ) {
        problem = validationProblem(
          'price',
          'Цена должна быть больше нуля.',
          'min_value',
        )
      } else if (constraints?.min != null && price < constraints.min) {
        problem = validationProblem(
          'price',
          `Минимальная цена — ${constraints.min}.`,
          'min_value',
        )
      } else if (constraints?.max != null && price > constraints.max) {
        problem = validationProblem(
          'price',
          `Максимальная цена — ${constraints.max}.`,
          'max_value',
        )
      } else if (
        constraints?.step &&
        !isValidStep(price, constraints.min, constraints.step)
      ) {
        problem = validationProblem(
          'price',
          `Цена должна учитывать шаг ${constraints.step}.`,
          'invalid_step',
        )
      }

      if (problem) return HttpResponse.json(problem, { status: 422 })

      updatePrice(detail, price)

      const listItem = mockStore.auctions.find(
        (item) => item.main?.order_uid === auctionUuid,
      )
      if (listItem?.trading) {
        listItem.trading.status_mobile = 'Leading'
        listItem.trading.is_bidder = true
        listItem.trading.your = { bet: true, last_bet: price }
        if (listItem.trading.price) {
          listItem.trading.price.current = price
          listItem.trading.price.current_no_vat = price / 1.2
        }
      }

      const bet: BetItem = {
        id: mockStore.nextBetId++,
        created_at: new Date().toISOString(),
        auction_id: detail.main.id,
        subscriber_id: 501,
        contact_name: 'Текущий пользователь',
        contact_phone: '',
        price_with_vat: price,
        price_no_vat: price / 1.2,
        organization_id: 501,
        organization_inn: '6312000000',
        organization_name: 'ООО Моя компания',
        transporter_comment: null,
        is_rejected: false,
        is_counter: false,
        place: 1,
        is_win: false,
        run_number: 0,
        cancel_reason: '',
        price_info: {
          price_with_vat: price,
          price_no_vat: price / 1.2,
          payment_type: 'Безналичная с НДС',
          vat_rate: '20',
        },
      }
      mockStore.bets[auctionUuid]?.unshift(bet)

      return new HttpResponse(null, { status: 200 })
    },
  ),
]
