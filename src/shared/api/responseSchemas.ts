import { z } from 'zod'

const auctionTypeSchema = z.enum([
  'Request',
  'Up',
  'Down',
  'FixPrice',
  'Unknown',
])
const auctionStatusSchema = z.enum([
  'Planning',
  'Auction',
  'DeterminateWinner',
  'WaitDeal',
  'InProgress',
  'Finished',
  'Stopped',
  'Canceled',
  'Unknown',
])
const tradingStatusSchema = z.enum([
  'NotParticipating',
  'Leading',
  'Losing',
  'OnPending',
  'Confirmed',
  'ChoosingWinner',
  'Winner',
  'Accepted',
  'Unknown',
])
const listTradingStatusSchema = z.enum([
  'NotParticipating',
  'Leading',
  'Losing',
  'Winner',
  'Confirmed',
  'Unknown',
])
const nullableNumber = z.number().nullable().optional()
const nullableString = z.string().nullable().optional()

const routePointSchema = z
  .object({
    city: z.string().optional(),
    address: z.string().optional(),
    date: z.string().optional(),
    city_gc_id: z.number().optional(),
    points_count: z.number().optional(),
  })
  .passthrough()

const listItemSchema = z
  .object({
    main: z
      .object({
        id: z.number().optional(),
        cargo_num: z.string().optional(),
        cargo_date: z.string().optional(),
        auc_type: auctionTypeSchema.optional(),
        order_uid: z.string().optional(),
        created_at: z.string().optional(),
        priority_sort: z.number().optional(),
        is_assembly: z.boolean().optional(),
        price_per_km: nullableNumber,
      })
      .passthrough()
      .optional(),
    organizer: z
      .object({
        subscriber_id: z.number().optional(),
        organization_id: z.number().optional(),
        organization_name: z.string().optional(),
        organization_inn: z.string().optional(),
        organization_kpp: z.string().optional(),
        is_hide_organization: z.boolean().optional(),
      })
      .passthrough()
      .optional(),
    route: z
      .object({
        load: routePointSchema.optional(),
        unload: routePointSchema.optional(),
      })
      .passthrough()
      .optional(),
    cargo: z
      .object({
        name: z.string().optional(),
        weight: z.number().optional(),
        volume: z.number().optional(),
        body_type: z.string().optional(),
        truck_count: z.number().optional(),
        is_cargo: z.boolean().optional(),
        is_international: z.boolean().optional(),
        containered: z.boolean().optional(),
        temp_from: z.number().optional(),
        temp_to: z.number().optional(),
      })
      .passthrough()
      .optional(),
    trading: z
      .object({
        status: auctionStatusSchema.optional(),
        status_mobile: listTradingStatusSchema.optional(),
        start_time: z.string().optional(),
        stop_time: z.string().optional(),
        bid_measurement_type: z
          .enum(['PerRoute', 'PerKm', 'Unknown'])
          .nullable()
          .optional(),
        can_set_bet: z.boolean().optional(),
        hide_points_address_and_contacts: z.boolean().optional(),
        is_bidder: z.boolean().optional(),
        is_available: z.boolean().optional(),
        is_favorite: z.boolean().optional(),
        price: z
          .object({
            start: z.number().optional(),
            current: z.number().optional(),
            current_no_vat: z.number().optional(),
          })
          .passthrough()
          .nullable()
          .optional(),
        your: z
          .object({ bet: z.boolean().optional(), last_bet: nullableNumber })
          .passthrough()
          .nullable()
          .optional(),
      })
      .passthrough()
      .optional(),
    payment: z
      .object({
        form: z.string().optional(),
        currency_code: z.string().optional(),
        consignor: z.string().optional(),
        consignee: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()

export const auctionListResponseSchema = z
  .object({
    data: z.array(listItemSchema).optional(),
    meta: z
      .object({
        current_page: z.number().optional(),
        from: z.number().optional(),
        last_page: z.number().optional(),
        per_page: z.number().optional(),
        to: z.number().optional(),
        total: z.number().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()

const contactSchema = z
  .object({
    name: nullableString,
    phone: nullableString,
    work_phone: nullableString,
    uid: nullableString,
    email: nullableString,
  })
  .passthrough()

const detailRouteSchema = z
  .object({
    row_num: z.number().optional(),
    op_type: z.enum(['Loading', 'Unloading', 'Unknown']).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    comment: nullableString,
    contractor: z.string().optional(),
    contractor_inn: z.string().optional(),
    location: z
      .object({
        city_name: z.string().optional(),
        city_full_name: z.string().optional(),
        city_gc_id: z.number().optional(),
        loading_address: z.string().optional(),
        lon: z.number().optional(),
        lat: z.number().optional(),
      })
      .passthrough()
      .optional(),
    cargo: z
      .object({
        name: z.string().optional(),
        package_name: z.string().optional(),
        weight: z.string().optional(),
        volume: z.string().optional(),
        length: z.string().optional(),
        width: z.string().optional(),
        height: z.string().optional(),
        oversized: z.boolean().optional(),
        package_amount: nullableNumber,
      })
      .passthrough()
      .optional(),
    contact: z
      .object({ name: z.string().optional(), phone: z.string().optional() })
      .passthrough()
      .optional(),
  })
  .passthrough()

export const auctionDetailsResponseSchema = z
  .object({
    main: z
      .object({
        id: z.number().optional(),
        cargo_num: z.string().optional(),
        cargo_date: z.string().optional(),
        order_uid: z.string().optional(),
        auc_type: auctionTypeSchema.optional(),
        created_at: z.string().optional(),
      })
      .passthrough(),
    organizer: z.object({}).passthrough(),
    contacts: z.array(contactSchema),
    cargo: z
      .object({
        price: z.string().optional(),
        currency: nullableNumber,
        is_international: z.boolean().optional(),
        distance: nullableNumber,
        truck_count: z.number().optional(),
        body_type: z.string().optional(),
        temp_from: nullableNumber,
        temp_to: nullableNumber,
        containered: z.boolean().optional(),
        container_type: nullableString,
        container_size: nullableString,
      })
      .passthrough(),
    trading: z
      .object({
        status: auctionStatusSchema.optional(),
        status_mobile: tradingStatusSchema.optional(),
        can_set_bet: z.boolean().optional(),
        hide_bets_history: z.boolean().optional(),
        hide_places: z.boolean().optional(),
        no_view_cargo_price: z.boolean().optional(),
        hide_points_address_and_contacts: z.boolean().optional(),
        is_bidder: z.boolean().optional(),
        price: z
          .object({
            start: nullableNumber,
            start_no_vat: nullableNumber,
            current: nullableNumber,
            current_no_vat: nullableNumber,
            available: nullableNumber,
            available_no_vat: nullableNumber,
            min: nullableNumber,
            min_no_vat: nullableNumber,
            max: nullableNumber,
            max_no_vat: nullableNumber,
            step: nullableNumber,
            step_no_vat: nullableNumber,
            price_per_km: z.number().optional(),
          })
          .passthrough()
          .optional(),
        your: z
          .object({
            bet: z.boolean().optional(),
            last_bet: nullableNumber,
            last_bet_with_vat: nullableNumber,
            win: z.boolean().optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough(),
    payment: z.object({}).passthrough(),
    assembly: z.object({}).passthrough(),
    routes: z.array(detailRouteSchema),
    admitted_organizations: z.array(z.object({}).passthrough()),
    hide_bets_history: z.boolean().optional(),
  })
  .passthrough()

const betItemSchema = z
  .object({
    id: z.number().optional(),
    created_at: z.string().optional(),
    auction_id: z.number().optional(),
    subscriber_id: z.number().optional(),
    contact_name: z.string().optional(),
    contact_phone: z.string().optional(),
    price_with_vat: z.number().optional(),
    price_no_vat: z.number().optional(),
    organization_id: z.number().optional(),
    organization_inn: z.string().optional(),
    organization_name: z.string().optional(),
    transporter_comment: nullableString,
    is_rejected: z.boolean().optional(),
    is_counter: z.boolean().optional(),
    place: nullableNumber,
    is_win: z.boolean().optional(),
    run_number: z.number().optional(),
    cancel_reason: z.string().optional(),
    price_info: z
      .object({
        price_with_vat: nullableNumber,
        price_no_vat: nullableNumber,
        payment_type: nullableString,
        vat_rate: nullableString,
      })
      .passthrough()
      .optional(),
  })
  .passthrough()

export const betListResponseSchema = z
  .object({ bets: z.array(betItemSchema) })
  .passthrough()

export const problemDetailSchema = z
  .object({
    code: z.string(),
    title: z.string(),
    message: z.string(),
    trace_id: nullableString,
  })
  .passthrough()

export const validationProblemSchema = problemDetailSchema.extend({
  errors: z.array(
    z
      .object({
        field: z.string(),
        message: z.string(),
        code: nullableString,
      })
      .passthrough(),
  ),
})

export const apiProblemSchema = z.union([
  validationProblemSchema,
  problemDetailSchema,
])
