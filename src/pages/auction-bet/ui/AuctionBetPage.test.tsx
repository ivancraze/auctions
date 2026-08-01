import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppProviders } from '@/app/providers/AppProviders'
import { queryClient } from '@/app/providers/queryClient'
import { router } from '@/app/router/router'
import { server } from '@/mocks/server'
import { useToastStore } from '@/shared/ui'

const availableAuctionUuid = '550e8400-e29b-41d4-a716-446655440001'

beforeEach(() => {
  queryClient.clear()
})

describe('AuctionBetPage', () => {
  it('submits a bet and returns to the updated detail page', async () => {
    await router.navigate({
      to: '/auctions/$auctionUuid/bet',
      params: { auctionUuid: availableAuctionUuid },
      search: { page: 1 },
    })
    render(<AppProviders />)

    const input = await screen.findByLabelText('Цена ставки')
    expect(input).toHaveValue(119000)
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить ставку' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Ставка успешно принята',
    )
    expect(useToastStore.getState().toast).toMatchObject({
      kind: 'success',
      text: 'Ставка успешно принята',
    })
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        `/auctions/${availableAuctionUuid}`,
      )
    })
  })

  it.each([
    ['', 'Введите цену ставки.'],
    ['0', 'Цена должна быть больше нуля.'],
    ['9000', 'Минимальная цена — 10000.'],
    ['301000', 'Максимальная цена — 300000.'],
    ['119500', 'Цена должна учитывать шаг 1000.'],
  ])(
    'validates price %s locally without sending a mutation',
    async (price, message) => {
      const mutationSpy = vi.fn()
      server.use(
        http.post('/api/v1/auctions/:auctionUuid/bets', () => {
          mutationSpy()
          return new HttpResponse(null, { status: 200 })
        }),
      )
      await router.navigate({
        to: '/auctions/$auctionUuid/bet',
        params: { auctionUuid: availableAuctionUuid },
        search: { page: 1 },
      })
      render(<AppProviders />)

      const input = await screen.findByLabelText('Цена ставки')
      fireEvent.change(input, { target: { value: price } })
      fireEvent.click(
        screen.getByRole('button', { name: 'Подтвердить ставку' }),
      )

      expect(await screen.findByText(message)).toBeInTheDocument()
      expect(mutationSpy).not.toHaveBeenCalled()
    },
  )

  it('maps a backend 422 error to the price field', async () => {
    server.use(
      http.post('/api/v1/auctions/:auctionUuid/bets', () =>
        HttpResponse.json(
          {
            code: 'validation_failed',
            title: 'Ошибка валидации',
            message: 'Запрос содержит некорректные поля.',
            errors: [
              {
                field: 'price',
                message: 'Приём ставок уже завершён.',
                code: 'closed',
              },
            ],
          },
          { status: 422 },
        ),
      ),
    )
    await router.navigate({
      to: '/auctions/$auctionUuid/bet',
      params: { auctionUuid: availableAuctionUuid },
      search: { page: 1 },
    })
    render(<AppProviders />)

    await screen.findByLabelText('Цена ставки')
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить ставку' }))

    expect(
      await screen.findByText('Приём ставок уже завершён.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Ставка не была принята',
    )
    expect(useToastStore.getState().toast).toMatchObject({
      kind: 'error',
      text: 'Ставка не была принята',
    })
  })

  it('does not render a form when betting is unavailable', async () => {
    await router.navigate({
      to: '/auctions/$auctionUuid/bet',
      params: { auctionUuid: '550e8400-e29b-41d4-a716-446655440003' },
      search: { page: 1 },
    })
    render(<AppProviders />)

    expect(
      await screen.findByRole('heading', { name: 'Ставка недоступна' }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Цена ставки')).not.toBeInTheDocument()
  })
})
