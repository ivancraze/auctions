import { describe, expect, it } from 'vitest'

import { createBetSchema } from './betSchema'

const schema = createBetSchema({ min: 10000, max: 300000, step: 1000 })

describe('bet validation schema', () => {
  it('accepts a positive price inside bounds that matches the step', () => {
    expect(schema.safeParse({ price: 119000 }).success).toBe(true)
  })

  it.each([
    [0, 'Цена должна быть больше нуля.'],
    [9000, 'Минимальная цена — 10000.'],
    [301000, 'Максимальная цена — 300000.'],
    [119500, 'Цена должна учитывать шаг 1000.'],
  ])('rejects price %s', (price, message) => {
    const result = schema.safeParse({ price })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message === message),
      ).toBe(true)
    }
  })
})
