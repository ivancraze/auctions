import { z } from 'zod'

export interface BetConstraints {
  min?: number | null
  max?: number | null
  step?: number | null
}

function matchesStep(
  price: number,
  min: number | null | undefined,
  step: number,
) {
  const steps = (price - (min ?? 0)) / step
  return Math.abs(steps - Math.round(steps)) < 1e-8
}

export function createBetSchema({ min, max, step }: BetConstraints) {
  return z
    .object({
      price: z
        .number({ invalid_type_error: 'Введите цену ставки.' })
        .finite('Введите корректную цену.')
        .positive('Цена должна быть больше нуля.'),
    })
    .superRefine((values, context) => {
      if (min != null && values.price < min) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message: `Минимальная цена — ${min}.`,
        })
      }
      if (max != null && values.price > max) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message: `Максимальная цена — ${max}.`,
        })
      }
      if (step && !matchesStep(values.price, min, step)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['price'],
          message: `Цена должна учитывать шаг ${step}.`,
        })
      }
    })
}

export type BetFormValues = z.infer<ReturnType<typeof createBetSchema>>
