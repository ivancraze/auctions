import type {
  AuctionDetails,
  AuctionListItem,
  BetItem,
} from '@/entities/auction'

type AuctionType = NonNullable<AuctionListItem['main']>['auc_type']
type AuctionStatus = NonNullable<AuctionListItem['trading']>['status']
type UserStatus = NonNullable<AuctionListItem['trading']>['status_mobile']

interface AuctionSeed {
  uuid: string
  id: number
  cargoNum: string
  type: AuctionType
  status: AuctionStatus
  userStatus: UserStatus
  origin: string
  originGcId: number
  destination: string
  destinationGcId: number
  loadDate: string
  unloadDate: string
  currentPrice: number
  pricePerKm: number
  bodyType: string
  canSetBet: boolean
  hasBet?: boolean
  isFavorite?: boolean
  isInternational?: boolean
  hideHistory?: boolean
  hideContacts?: boolean
  noViewCargoPrice?: boolean
  allowCounterBets?: boolean
  isAccredited?: boolean
  betCount?: number
  priceMin?: number | null
  priceMax?: number | null
  priceStep?: number | null
  startTime?: string
  stopTime?: string
  bidMeasurementType?: 'PerRoute' | 'PerKm' | 'Unknown'
  hidePlaces?: boolean
  sendDealBeforeLoad?: boolean
  weight?: number
  volume?: number
  truckCount?: number
}

const baseSeeds: AuctionSeed[] = [
  {
    uuid: '550e8400-e29b-41d4-a716-446655440001',
    id: 1001,
    cargoNum: '00000001001',
    type: 'Down',
    status: 'Auction',
    userStatus: 'NotParticipating',
    origin: 'Самара',
    originGcId: 63,
    destination: 'Москва',
    destinationGcId: 77,
    loadDate: '2026-08-03T09:00:00+04:00',
    unloadDate: '2026-08-05T18:00:00+03:00',
    currentPrice: 120000,
    pricePerKm: 112.15,
    bodyType: 'тентованный',
    canSetBet: true,
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440002',
    id: 1002,
    cargoNum: '00000001002',
    type: 'Up',
    status: 'Auction',
    userStatus: 'Leading',
    origin: 'Казань',
    originGcId: 16,
    destination: 'Пермь',
    destinationGcId: 59,
    loadDate: '2026-08-04T08:00:00+03:00',
    unloadDate: '2026-08-05T16:00:00+05:00',
    currentPrice: 85000,
    pricePerKm: 143.1,
    bodyType: 'рефрижератор',
    canSetBet: true,
    hasBet: true,
    isFavorite: true,
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440003',
    id: 1003,
    cargoNum: '00000001003',
    type: 'Request',
    status: 'Planning',
    userStatus: 'NotParticipating',
    origin: 'Уфа',
    originGcId: 2,
    destination: 'Екатеринбург',
    destinationGcId: 66,
    loadDate: '2026-08-10T10:00:00+05:00',
    unloadDate: '2026-08-11T18:00:00+05:00',
    currentPrice: 74000,
    pricePerKm: 137.8,
    bodyType: 'фургон',
    canSetBet: false,
    hideContacts: true,
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440004',
    id: 1004,
    cargoNum: '00000001004',
    type: 'FixPrice',
    status: 'Finished',
    userStatus: 'Winner',
    origin: 'Санкт-Петербург',
    originGcId: 78,
    destination: 'Псков',
    destinationGcId: 60,
    loadDate: '2026-07-20T07:00:00+03:00',
    unloadDate: '2026-07-21T15:00:00+03:00',
    currentPrice: 56000,
    pricePerKm: 198.6,
    bodyType: 'тентованный',
    canSetBet: false,
    hasBet: true,
    hideHistory: true,
    noViewCargoPrice: true,
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440005',
    id: 1005,
    cargoNum: '00000001005',
    type: 'Down',
    status: 'Canceled',
    userStatus: 'Losing',
    origin: 'Минск',
    originGcId: 1001,
    destination: 'Самара',
    destinationGcId: 63,
    loadDate: '2026-08-06T09:00:00+03:00',
    unloadDate: '2026-08-08T19:00:00+04:00',
    currentPrice: 165000,
    pricePerKm: 121.4,
    bodyType: 'рефрижератор',
    canSetBet: false,
    hasBet: true,
    isInternational: true,
  },
]

const auctionTypes: AuctionType[] = [
  'Request',
  'Up',
  'Down',
  'FixPrice',
  'Unknown',
]

const auctionStatuses: AuctionStatus[] = [
  'Planning',
  'Auction',
  'Auction',
  'Auction',
  'DeterminateWinner',
  'WaitDeal',
  'InProgress',
  'Finished',
  'Stopped',
  'Canceled',
  'Unknown',
]

const userStatuses: UserStatus[] = [
  'NotParticipating',
  'Leading',
  'Losing',
  'Winner',
  'Confirmed',
  'Unknown',
]

const cities = [
  { name: 'Самара', gcId: 63 },
  { name: 'Москва', gcId: 77 },
  { name: 'Казань', gcId: 16 },
  { name: 'Пермь', gcId: 59 },
  { name: 'Уфа', gcId: 2 },
  { name: 'Екатеринбург', gcId: 66 },
  { name: 'Санкт-Петербург', gcId: 78 },
  { name: 'Псков', gcId: 60 },
  { name: 'Минск', gcId: 1001 },
] as const

const bodyTypes = [
  'тентованный',
  'рефрижератор',
  'фургон',
  'контейнеровоз',
  'бортовой',
  'цистерна',
] as const

function dateAfterDays(dayOffset: number, hour: number) {
  return new Date(Date.UTC(2026, 7, 1 + dayOffset, hour)).toISOString()
}

const generatedSeeds: AuctionSeed[] = Array.from({ length: 30 }, (_, index) => {
  const status = auctionStatuses[index % auctionStatuses.length]!
  const type = auctionTypes[index % auctionTypes.length]!
  const userStatus = userStatuses[index % userStatuses.length]!
  const origin = cities[index % cities.length]!
  const destination = cities[(index + 2 + (index % 3)) % cities.length]!
  const hasBet = !['NotParticipating', 'Unknown'].includes(userStatus)
  const canSetBet =
    status === 'Auction' && type !== 'Request' && type !== 'Unknown'
  const priceStep = [500, 1000, 2500, 5000][index % 4]!

  return {
    uuid: `550e8400-e29b-41d4-a716-${String(446655441001 + index)}`,
    id: 2001 + index,
    cargoNum: String(2001 + index).padStart(11, '0'),
    type,
    status,
    userStatus,
    origin: origin.name,
    originGcId: origin.gcId,
    destination: destination.name,
    destinationGcId: destination.gcId,
    loadDate: dateAfterDays(index, 6 + (index % 6)),
    unloadDate: dateAfterDays(index + 1 + (index % 3), 14 + (index % 8)),
    currentPrice: 50000 + index * 5000,
    pricePerKm: 75 + index * 4.35,
    bodyType: bodyTypes[index % bodyTypes.length]!,
    canSetBet,
    hasBet,
    isFavorite: index % 4 === 0,
    isInternational: index % 8 === 0,
    hideHistory: index % 7 === 0,
    hideContacts: index % 5 === 0,
    noViewCargoPrice: index % 6 === 0,
    allowCounterBets: index % 3 !== 0,
    isAccredited: index % 9 !== 0,
    betCount: index % 5,
    priceMin: index % 10 === 0 ? null : index % 2 === 0 ? 10000 : 25000,
    priceMax: index % 9 === 0 ? null : 300000,
    priceStep: index % 11 === 0 ? null : priceStep,
    startTime: dateAfterDays(index - 2, 9),
    stopTime: dateAfterDays(index - 1, 18),
    bidMeasurementType:
      index % 7 === 0 ? 'Unknown' : index % 2 === 0 ? 'PerRoute' : 'PerKm',
    hidePlaces: index % 8 === 0,
    sendDealBeforeLoad: index % 4 === 0,
    weight: 5 + (index % 6) * 5,
    volume: 20 + (index % 7) * 12,
    truckCount: 1 + (index % 3),
  }
})

const seeds = [...baseSeeds, ...generatedSeeds]

function createListItem(seed: AuctionSeed): AuctionListItem {
  return {
    main: {
      id: seed.id,
      cargo_num: seed.cargoNum,
      cargo_date: seed.loadDate,
      auc_type: seed.type,
      order_uid: seed.uuid,
      created_at: seed.startTime ?? '2026-07-30T12:00:00+04:00',
      priority_sort: 0,
      is_assembly: false,
      price_per_km: seed.pricePerKm,
    },
    organizer: {
      subscriber_id: 98,
      organization_id: 340,
      organization_name: 'ООО Логистика',
      organization_inn: '7703769184',
      organization_kpp: '770301001',
      is_hide_organization: false,
    },
    route: {
      load: {
        city: seed.origin,
        address: 'Промышленная улица, 10',
        date: seed.loadDate,
        city_gc_id: seed.originGcId,
        points_count: 1,
      },
      unload: {
        city: seed.destination,
        address: 'Складская улица, 5',
        date: seed.unloadDate,
        city_gc_id: seed.destinationGcId,
        points_count: 1,
      },
    },
    cargo: {
      name:
        seed.bodyType === 'рефрижератор'
          ? 'Замороженные продукты'
          : 'Строительные материалы',
      weight: seed.weight ?? 20,
      volume: seed.volume ?? 82,
      body_type: seed.bodyType,
      truck_count: seed.truckCount ?? 1,
      is_cargo: true,
      is_international: seed.isInternational ?? false,
      containered: false,
      incoterms: '',
      conics: 0,
      belts: 4,
      adr: 0,
      coupling: false,
      air_pass: false,
      low_loader: false,
      additional_load: false,
      temp_from: seed.bodyType === 'рефрижератор' ? -18 : 0,
      temp_to: seed.bodyType === 'рефрижератор' ? -15 : 0,
      loading_types: { side: true, top: false, rear: true, full: false },
      docs: { tir: false, cmr: false, t1: false, med: false },
      car: {
        type: 'Тягач',
        weight: seed.weight ?? 20,
        volume: seed.volume ?? 82,
        width: 2.45,
        length: 13.6,
        height: 2.7,
      },
    },
    trading: {
      status: seed.status,
      status_mobile: seed.userStatus,
      start_time: seed.startTime ?? '2026-08-01T09:00:00+04:00',
      stop_time: seed.stopTime ?? '2026-08-02T18:00:00+04:00',
      bid_measurement_type: seed.bidMeasurementType ?? 'PerRoute',
      can_set_bet: seed.canSetBet,
      allow_counter_bets: seed.allowCounterBets ?? true,
      hide_points_address_and_contacts: seed.hideContacts ?? false,
      direction: seed.type,
      comment: '',
      is_bidder: seed.hasBet ?? false,
      is_available: seed.canSetBet,
      is_accredited: seed.isAccredited ?? true,
      is_favorite: seed.isFavorite ?? false,
      price: {
        start: seed.currentPrice + 10000,
        current: seed.currentPrice,
        current_no_vat: seed.currentPrice / 1.2,
      },
      your: {
        bet: seed.hasBet ?? false,
        last_bet: seed.hasBet ? seed.currentPrice : null,
      },
      red_bet_with_vat: false,
      red_bet_no_vat: false,
      is_last_bet_with_vat: seed.hasBet ?? false,
    },
    payment: {
      form: 'Безналичная с НДС',
      currency_code: '643',
      consignor: 'ООО Логистика',
      consignee: 'Получатель',
    },
  }
}

function createDetails(seed: AuctionSeed): AuctionDetails {
  const step = seed.priceStep === undefined ? 1000 : (seed.priceStep ?? 0)
  const min = seed.priceMin === undefined ? 10000 : seed.priceMin
  const max = seed.priceMax === undefined ? 300000 : seed.priceMax
  const nextPrice = seed.currentPrice + (seed.type === 'Up' ? step : -step)
  const availablePrice = Math.min(
    max ?? Infinity,
    Math.max(min ?? -Infinity, nextPrice),
  )

  return {
    main: {
      id: seed.id,
      cargo_num: seed.cargoNum,
      cargo_date: seed.loadDate,
      order_uid: seed.uuid,
      auc_type: seed.type,
      created_at: seed.startTime ?? '2026-07-30T12:00:00+04:00',
    },
    organizer: {
      subscriber_id: 98,
      subscriber_code: 'ORG-98',
      infobase_code: 'RU_CARGO',
      organization_name: 'ООО Логистика',
      organization_inn: '7703769184',
      organization_kpp: '770301001',
      organization_id: 340,
    },
    contacts: [
      {
        name: 'Анна Петрова',
        phone: '+7 900 100-20-30',
        work_phone: null,
        uid: null,
        email: 'auction@example.test',
      },
    ],
    cargo: {
      price: String(seed.currentPrice),
      currency: 643,
      is_international: seed.isInternational ?? false,
      distance: 1070,
      truck_count: seed.truckCount ?? 1,
      body_type: seed.bodyType,
      temp_from: seed.bodyType === 'рефрижератор' ? -18 : null,
      temp_to: seed.bodyType === 'рефрижератор' ? -15 : null,
      conics: 0,
      belts: 4,
      adr: 0,
      coupling: false,
      air_pass: false,
      low_loader: false,
      additional_load: false,
      containered: false,
      container_type: null,
      container_size: null,
      loading_types: { side: true, top: false, rear: true, full: false },
      docs: { tir: false, cmr: false, t1: false, med: false },
      car: {
        type: 'Тягач',
        weight: seed.weight ?? 20,
        volume: seed.volume ?? 82,
        width: 2.45,
        length: 13.6,
        height: 2.7,
      },
    },
    trading: {
      status: seed.status,
      status_mobile: seed.userStatus,
      start_time: seed.startTime ?? '2026-08-01T09:00:00+04:00',
      stop_time: seed.stopTime ?? '2026-08-02T18:00:00+04:00',
      bid_measurement_type: seed.bidMeasurementType ?? 'PerRoute',
      can_set_bet: seed.canSetBet,
      allow_counter_bets: seed.allowCounterBets ?? true,
      hide_bets_history: seed.hideHistory ?? false,
      hide_places: seed.hidePlaces ?? false,
      no_view_cargo_price: seed.noViewCargoPrice ?? false,
      hide_points_address_and_contacts: seed.hideContacts ?? false,
      is_bidder: seed.hasBet ?? false,
      is_favorite: seed.isFavorite ?? false,
      is_last_bet_with_vat: seed.hasBet ?? false,
      red_bet_with_vat: false,
      red_bet_no_vat: false,
      send_deal_before_load: seed.sendDealBeforeLoad ?? false,
      chat_id: null,
      price: {
        start: seed.currentPrice + 10000,
        start_no_vat: (seed.currentPrice + 10000) / 1.2,
        current: seed.currentPrice,
        current_no_vat: seed.currentPrice / 1.2,
        available: availablePrice,
        available_no_vat: availablePrice / 1.2,
        min: seed.priceMin === undefined ? 10000 : seed.priceMin,
        min_no_vat:
          seed.priceMin === undefined
            ? 10000 / 1.2
            : seed.priceMin === null
              ? null
              : seed.priceMin / 1.2,
        max: seed.priceMax === undefined ? 300000 : seed.priceMax,
        max_no_vat:
          seed.priceMax === undefined
            ? 250000
            : seed.priceMax === null
              ? null
              : seed.priceMax / 1.2,
        step: seed.priceStep === undefined ? 1000 : seed.priceStep,
        step_no_vat:
          seed.priceStep === undefined
            ? 1000 / 1.2
            : seed.priceStep === null
              ? null
              : seed.priceStep / 1.2,
        price_per_km: seed.pricePerKm,
      },
      your: {
        bet: seed.hasBet ?? false,
        last_bet: seed.hasBet ? seed.currentPrice : null,
        last_bet_with_vat: seed.hasBet ? seed.currentPrice : null,
        win: seed.userStatus === 'Winner',
      },
      settings: {
        prolong_after_bet: 5,
        winner_confirm: 30,
        winner_counter_mode: 0,
        transmission_time_in: 15,
        coefficient: 1,
      },
    },
    payment: {
      condition: 'Оплата после предоставления документов',
      condition_predefined: null,
      form: 'Безналичная с НДС',
      delay: 10,
      delay_type: 'WorkDays',
      currency_code: '643',
      prepay: null,
    },
    assembly: { num: null, date: null },
    routes: [
      {
        row_num: 1,
        op_type: 'Loading',
        start_date: seed.loadDate,
        end_date: seed.loadDate,
        comment: null,
        contractor: 'ООО Логистика',
        contractor_inn: '7703769184',
        location: {
          city_name: seed.origin,
          city_full_name: seed.origin,
          city_gc_id: seed.originGcId,
          loading_address: 'Промышленная улица, 10',
          lon: 50.1,
          lat: 53.2,
        },
        cargo: {
          name: 'Основной груз',
          package_name: 'Паллеты',
          weight: String(seed.weight ?? 20),
          volume: String(seed.volume ?? 82),
          length: '13.6',
          width: '2.45',
          height: '2.7',
          oversized: false,
          package_amount: 20,
        },
        contact: { name: 'Сотрудник склада', phone: '+7 900 111-22-33' },
      },
      {
        row_num: 2,
        op_type: 'Unloading',
        start_date: seed.unloadDate,
        end_date: seed.unloadDate,
        comment: null,
        contractor: 'Получатель',
        contractor_inn: '6312345678',
        location: {
          city_name: seed.destination,
          city_full_name: seed.destination,
          city_gc_id: seed.destinationGcId,
          loading_address: 'Складская улица, 5',
          lon: 37.6,
          lat: 55.7,
        },
        cargo: {
          name: 'Основной груз',
          package_name: 'Паллеты',
          weight: String(seed.weight ?? 20),
          volume: String(seed.volume ?? 82),
          length: '13.6',
          width: '2.45',
          height: '2.7',
          oversized: false,
          package_amount: 20,
        },
        contact: { name: 'Получатель', phone: '+7 900 222-33-44' },
      },
    ],
    admitted_organizations: [
      {
        id: 14,
        inn: '6311223344',
        is_main: true,
        name: 'ООО ТрансЛайн',
        full_name: 'Общество с ограниченной ответственностью ТрансЛайн',
        site: null,
        subscriber_id: 13,
        subscriber_code: 'TR-13',
        subscriber_role: null,
        infobase_code: 'RU_CARGO',
        infobase_address: null,
        nalog_key: null,
        hide_me: false,
        current_vat_rate: '20',
      },
    ],
    hide_bets_history: seed.hideHistory ?? false,
  }
}

const carriers = [
  { id: 14, inn: '6311223344', name: 'ООО ТрансЛайн' },
  { id: 25, inn: '1650123456', name: 'ООО Волга Карго' },
  { id: 36, inn: '6671987654', name: 'ООО Урал Транс' },
  { id: 47, inn: '7812456789', name: 'ООО Север Логистик' },
] as const

function createBet(
  seed: AuctionSeed,
  id: number,
  canceled = false,
  variant = 0,
): BetItem {
  const carrier = carriers[variant % carriers.length]!
  const price =
    seed.currentPrice + (seed.type === 'Up' ? -variant : variant) * 1000

  return {
    id,
    created_at: seed.startTime ?? '2026-08-01T12:00:00+04:00',
    auction_id: seed.id,
    subscriber_id: 13 + variant,
    contact_name: `Представитель ${variant + 1}`,
    contact_phone: `+7 900 300-40-${String(50 + variant).padStart(2, '0')}`,
    price_with_vat: price,
    price_no_vat: price / 1.2,
    organization_id: carrier.id,
    organization_inn: carrier.inn,
    organization_name: carrier.name,
    transporter_comment: null,
    is_rejected: canceled,
    is_counter: variant % 3 === 2,
    place: canceled ? null : variant + 1,
    is_win: seed.userStatus === 'Winner' && variant === 0,
    run_number: variant,
    cancel_reason: canceled ? 'Ставка отозвана перевозчиком' : '',
    price_info: {
      price_with_vat: price,
      price_no_vat: price / 1.2,
      payment_type: 'Безналичная с НДС',
      vat_rate: '20',
    },
  }
}

export function createInitialMockData() {
  return {
    auctions: seeds.map(createListItem),
    details: Object.fromEntries(
      seeds.map((seed) => [seed.uuid, createDetails(seed)]),
    ),
    bets: Object.fromEntries(
      seeds.map((seed, index) => [
        seed.uuid,
        seed.betCount !== undefined
          ? Array.from({ length: seed.betCount }, (_, betIndex) =>
              createBet(
                seed,
                index * 100 + betIndex + 1,
                seed.betCount! > 2 && betIndex === seed.betCount! - 1,
                betIndex,
              ),
            )
          : seed.hasBet
            ? [
                createBet(seed, index * 10 + 1),
                createBet(seed, index * 10 + 2, true),
              ]
            : [],
      ]),
    ),
    nextBetId: 10000,
  } satisfies {
    auctions: AuctionListItem[]
    details: Record<string, AuctionDetails>
    bets: Record<string, BetItem[]>
    nextBetId: number
  }
}
