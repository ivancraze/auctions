import { describe, expect, it } from 'vitest'

import { createBetSchema } from './betSchema'

const schema = createBetSchema({ min: 10000, max: 300000, step: 1000 })

describe('bet validation schema', () => {
  it.each([10000, 119000, 300000])(
    'accepts valid price %s including constraint boundaries',
    (price) => {
      expect(schema.safeParse({ price }).success).toBe(true)
    },
  )

  it.each([
    [{}, 'Введите цену ставки.'],
    [{ price: Number.NaN }, 'Введите цену ставки.'],
    [{ price: Number.POSITIVE_INFINITY }, 'Введите корректную цену.'],
    [{ price: -1000 }, 'Цена должна быть больше нуля.'],
    [{ price: 0 }, 'Цена должна быть больше нуля.'],
    [{ price: 9000 }, 'Минимальная цена — 10000.'],
    [{ price: 301000 }, 'Максимальная цена — 300000.'],
    [{ price: 119500 }, 'Цена должна учитывать шаг 1000.'],
  ])('rejects invalid input %#', (input, message) => {
    const result = schema.safeParse(input)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message === message),
      ).toBe(true)
    }
  })

  it('accepts any positive finite price when constraints are absent', () => {
    const unconstrainedSchema = createBetSchema({
      min: null,
      max: null,
      step: null,
    })

    expect(unconstrainedSchema.safeParse({ price: 0.01 }).success).toBe(true)
  })
})
