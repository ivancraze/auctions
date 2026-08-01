import { afterEach, describe, expect, it, vi } from 'vitest'

import { auctionApi } from './auctionApi'
import { ApiContractError, ApiError } from '@/shared/api'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('auctionApi', () => {
  it('sends the list request using the OpenAPI endpoint', async () => {
    const responseBody = {
      data: [],
      meta: {
        current_page: 1,
        from: 0,
        last_page: 1,
        per_page: 20,
        to: 0,
        total: 0,
      },
    }
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify(responseBody), { status: 200 }),
      )

    await expect(auctionApi.list({ page: 1, per_page: 20 })).resolves.toEqual(
      responseBody,
    )

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auctions/list',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ page: 1, per_page: 20 }),
      }),
    )
  })

  it('adds the all query parameter only for a boolean value', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ bets: [] }), { status: 200 }),
      )

    await auctionApi.getBets('auction/uuid', { all: true })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auctions/auction%2Fuuid/bets?all=true',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('preserves a validation problem from a 422 response', async () => {
    const validationProblem = {
      code: 'validation_failed',
      title: 'Ошибка валидации',
      message: 'Запрос содержит некорректные поля.',
      errors: [
        {
          field: 'price',
          message: 'Цена должна быть больше нуля.',
          code: 'min_value',
        },
      ],
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(validationProblem), {
        status: 422,
        headers: { 'Content-Type': 'application/problem+json' },
      }),
    )

    const result = auctionApi.setBet('auction-uuid', { price: 0 })

    await expect(result).rejects.toBeInstanceOf(ApiError)
    await expect(result).rejects.toMatchObject({
      status: 422,
      problem: validationProblem,
    })
  })

  it('rejects a successful response that violates the runtime schema', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: 'not-an-array' }), { status: 200 }),
    )

    const result = auctionApi.list()

    await expect(result).rejects.toBeInstanceOf(ApiContractError)
    await expect(result).rejects.toMatchObject({
      message: 'Ответ API не соответствует OpenAPI-контракту.',
    })
  })
})
