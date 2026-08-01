import { z } from 'zod'

export const betsSearchSchema = z.object({
  all: z
    .preprocess((value) => {
      if (value === true || value === 'true') return true
      if (value === false || value === 'false') return false
      return undefined
    }, z.boolean().optional())
    .catch(undefined),
})
