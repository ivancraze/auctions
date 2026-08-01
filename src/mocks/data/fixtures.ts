import type {
  AuctionDetails,
  AuctionListItem,
  BetItem,
} from '@/entities/auction/model/types'

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
}

const seeds: AuctionSeed[] = [
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

function createListItem(seed: AuctionSeed): AuctionListItem {
  return {
    main: {
      id: seed.id,
      cargo_num: seed.cargoNum,
      cargo_date: seed.loadDate,
      auc_type: seed.type,
      order_uid: seed.uuid,
      created_at: '2026-07-30T12:00:00+04:00',
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
      weight: 20,
      volume: 82,
      body_type: seed.bodyType,
      truck_count: 1,
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
        weight: 20,
        volume: 82,
        width: 2.45,
        length: 13.6,
        height: 2.7,
      },
    },
    trading: {
      status: seed.status,
      status_mobile: seed.userStatus,
      start_time: '2026-08-01T09:00:00+04:00',
      stop_time: '2026-08-02T18:00:00+04:00',
      bid_measurement_type: 'PerRoute',
      can_set_bet: seed.canSetBet,
      allow_counter_bets: true,
      hide_points_address_and_contacts: seed.hideContacts ?? false,
      direction: seed.type,
      comment: '',
      is_bidder: seed.hasBet ?? false,
      is_available: seed.canSetBet,
      is_accredited: true,
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
  return {
    main: {
      id: seed.id,
      cargo_num: seed.cargoNum,
      cargo_date: seed.loadDate,
      order_uid: seed.uuid,
      auc_type: seed.type,
      created_at: '2026-07-30T12:00:00+04:00',
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
      truck_count: 1,
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
        weight: 20,
        volume: 82,
        width: 2.45,
        length: 13.6,
        height: 2.7,
      },
    },
    trading: {
      status: seed.status,
      status_mobile: seed.userStatus,
      start_time: '2026-08-01T09:00:00+04:00',
      stop_time: '2026-08-02T18:00:00+04:00',
      bid_measurement_type: 'PerRoute',
      can_set_bet: seed.canSetBet,
      allow_counter_bets: true,
      hide_bets_history: seed.hideHistory ?? false,
      hide_places: false,
      no_view_cargo_price: seed.noViewCargoPrice ?? false,
      hide_points_address_and_contacts: seed.hideContacts ?? false,
      is_bidder: seed.hasBet ?? false,
      is_favorite: seed.isFavorite ?? false,
      is_last_bet_with_vat: seed.hasBet ?? false,
      red_bet_with_vat: false,
      red_bet_no_vat: false,
      send_deal_before_load: false,
      chat_id: null,
      price: {
        start: seed.currentPrice + 10000,
        start_no_vat: (seed.currentPrice + 10000) / 1.2,
        current: seed.currentPrice,
        current_no_vat: seed.currentPrice / 1.2,
        available:
          seed.type === 'Up'
            ? seed.currentPrice + 1000
            : seed.currentPrice - 1000,
        available_no_vat:
          (seed.type === 'Up'
            ? seed.currentPrice + 1000
            : seed.currentPrice - 1000) / 1.2,
        min: 10000,
        min_no_vat: 10000 / 1.2,
        max: 300000,
        max_no_vat: 250000,
        step: 1000,
        step_no_vat: 1000 / 1.2,
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
          weight: '20',
          volume: '82',
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
          weight: '20',
          volume: '82',
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

function createBet(seed: AuctionSeed, id: number, canceled = false): BetItem {
  return {
    id,
    created_at: '2026-08-01T12:00:00+04:00',
    auction_id: seed.id,
    subscriber_id: 13,
    contact_name: 'Иван Иванов',
    contact_phone: '+7 900 300-40-50',
    price_with_vat: seed.currentPrice,
    price_no_vat: seed.currentPrice / 1.2,
    organization_id: 14,
    organization_inn: '6311223344',
    organization_name: 'ООО ТрансЛайн',
    transporter_comment: null,
    is_rejected: canceled,
    is_counter: false,
    place: canceled ? null : 1,
    is_win: seed.userStatus === 'Winner',
    run_number: 0,
    cancel_reason: canceled ? 'Ставка отозвана перевозчиком' : '',
    price_info: {
      price_with_vat: seed.currentPrice,
      price_no_vat: seed.currentPrice / 1.2,
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
        seed.hasBet
          ? [
              createBet(seed, index * 10 + 1),
              createBet(seed, index * 10 + 2, true),
            ]
          : [],
      ]),
    ),
    nextBetId: 100,
  } satisfies {
    auctions: AuctionListItem[]
    details: Record<string, AuctionDetails>
    bets: Record<string, BetItem[]>
    nextBetId: number
  }
}

export const mockCities = [
  ...new Set(seeds.flatMap((seed) => [seed.origin, seed.destination])),
].sort()
