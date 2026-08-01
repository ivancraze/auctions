import { z } from 'zod'

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value)
const optionalString = z
  .preprocess(emptyToUndefined, z.string().trim().min(1).optional())
  .catch(undefined)
const optionalNumber = z
  .preprocess(
    (value) => (value === '' || value == null ? undefined : Number(value)),
    z.number().finite().nonnegative().optional(),
  )
  .catch(undefined)
const optionalBoolean = z
  .preprocess((value) => {
    if (value === true || value === 'true') return true
    if (value === false || value === 'false') return false
    return undefined
  }, z.boolean().optional())
  .catch(undefined)
const optionalDate = z
  .preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  )
  .catch(undefined)

export const auctionSearchSchema = z.object({
  page: z.coerce.number().int().positive().catch(1).default(1),
  cargo_num: optionalString,
  status: z
    .preprocess(
      emptyToUndefined,
      z
        .enum(['NotParticipating', 'Leading', 'Losing', 'Winner', 'Confirmed'])
        .optional(),
    )
    .catch(undefined),
  statuses: z
    .preprocess(
      (value) => (value === '' || value == null ? undefined : Number(value)),
      z.number().int().min(1).max(8).optional(),
    )
    .catch(undefined),
  auc_type: z
    .preprocess(
      emptyToUndefined,
      z.enum(['Request', 'Up', 'Down', 'FixPrice']).optional(),
    )
    .catch(undefined),
  load_city: optionalString,
  unload_city: optionalString,
  load_date_from: optionalDate,
  load_date_to: optionalDate,
  is_available: optionalBoolean,
  is_bidder: optionalBoolean,
  current_price_from: optionalNumber,
  current_price_to: optionalNumber,
})

export type AuctionSearch = z.infer<typeof auctionSearchSchema>
export type AuctionSearchInput = z.input<typeof auctionSearchSchema>

export const defaultAuctionSearch: AuctionSearch = { page: 1 }
