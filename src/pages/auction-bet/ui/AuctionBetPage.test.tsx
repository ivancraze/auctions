import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppProviders } from '@/app/providers/AppProviders'
import { queryClient } from '@/app/providers/queryClient'
import { router } from '@/app/router/router'
import { server } from '@/mocks/server'
import { useToastStore } from '@/shared/ui'

const availableAuctionUuid = '550e8400-e29b-41d4-a716-446655440001'

function expectLinkedFieldError(input: HTMLElement, message: string) {
  const referencedIds = [
    input.getAttribute('aria-describedby'),
    input.getAttribute('aria-errormessage'),
  ]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(/\s+/))

  expect(input).toHaveAttribute('aria-invalid', 'true')
  expect(referencedIds).not.toHaveLength(0)
  expect(
    referencedIds.some((id) =>
      document.getElementById(id)?.textContent?.includes(message),
    ),
  ).toBe(true)
}

beforeEach(() => {
  queryClient.clear()
})

describe('AuctionBetPage', () => {
  /** Проверяет успешную отправку ставки и возврат к обновлённому аукциону. */
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

    expect(
      (await screen.findByText('Ставка успешно принята')).closest(
        '[role="status"]',
      ),
    ).toBeInTheDocument()
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

  /** Проверяет защиту от повторной отправки и состояние формы во время запроса. */
  it('sends only one request for two immediate submissions', async () => {
    let releaseResponse: () => void = () => undefined
    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = () => resolve()
    })
    const mutationSpy = vi.fn()
    server.use(
      http.post('/api/v1/auctions/:auctionUuid/bets', async () => {
        mutationSpy()
        await responseGate
        return new HttpResponse(null, { status: 204 })
      }),
    )
    await router.navigate({
      to: '/auctions/$auctionUuid/bet',
      params: { auctionUuid: availableAuctionUuid },
      search: { page: 1 },
    })
    render(<AppProviders />)

    await screen.findByLabelText('Цена ставки')
    const submitButton = screen.getByRole('button', {
      name: 'Подтвердить ставку',
    })
    const form = submitButton.closest('form')
    expect(form).not.toBeNull()

    fireEvent.submit(form!)
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalledTimes(1)
      expect(form).toHaveAttribute('aria-busy', 'true')
      expect(submitButton).toBeDisabled()
    })

    releaseResponse()
    expect(
      (await screen.findByText('Ставка успешно принята')).closest(
        '[role="status"]',
      ),
    ).toBeInTheDocument()
  })

  /** Проверяет клиентские ограничения цены без обращения к backend. */
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
      expectLinkedFieldError(input, message)
      expect(mutationSpy).not.toHaveBeenCalled()
    },
  )

  /** Проверяет отображение и доступность ошибки цены, полученной от backend. */
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

    const input = await screen.findByLabelText('Цена ставки')
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить ставку' }))

    expect(
      await screen.findByText('Приём ставок уже завершён.'),
    ).toBeInTheDocument()
    expectLinkedFieldError(input, 'Приём ставок уже завершён.')
    expect(
      screen.getByText('Ставка не была принята').closest('[role="alert"]'),
    ).toBeInTheDocument()
    expect(useToastStore.getState().toast).toMatchObject({
      kind: 'error',
      text: 'Ставка не была принята',
    })
  })

  /** Проверяет отсутствие формы, когда установка ставки запрещена. */
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
