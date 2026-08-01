import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/AppProviders'
import { queryClient } from '@/app/providers/queryClient'
import { router } from '@/app/router/router'
import { auctionKeys } from '@/entities/auction'
import { server } from '@/mocks/server'

beforeEach(async () => {
  queryClient.clear()
  await router.navigate({ to: '/auctions', search: { page: 1 } })
})

describe('AuctionsListPage', () => {
  it('loads and renders auction cards', async () => {
    render(<AppProviders />)

    expect(await screen.findByText('Заявка № 00000002030')).toBeInTheDocument()
    expect(screen.getByText('Казань → Санкт-Петербург')).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Пагинация аукционов' }),
    ).toBeInTheDocument()

    const firstCard = screen
      .getByText('Заявка № 00000002030')
      .closest('article')
    expect(firstCard).not.toBeNull()
    fireEvent.pointerEnter(firstCard!)
    await waitFor(() => {
      expect(
        queryClient.getQueryData(
          auctionKeys.detail('550e8400-e29b-41d4-a716-446655441030'),
        ),
      ).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Далее →' }))
    expect(await screen.findByText('Заявка № 00000002027')).toBeInTheDocument()
  })

  it('renders the empty state', async () => {
    server.use(
      http.post('/api/v1/auctions/list', () =>
        HttpResponse.json({
          data: [],
          meta: {
            current_page: 1,
            from: 0,
            last_page: 1,
            per_page: 3,
            to: 0,
            total: 0,
          },
        }),
      ),
    )
    render(<AppProviders />)

    expect(await screen.findByText('Аукционы не найдены')).toBeInTheDocument()
  })

  it('applies filters and stores them in the URL search state', async () => {
    render(<AppProviders />)
    await screen.findByText('Заявка № 00000002030')

    fireEvent.change(screen.getByLabelText('Номер заявки'), {
      target: { value: '00000001002' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Применить' }))

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        page: 1,
        cargo_num: '00000001002',
      })
    })
    expect(
      await screen.findByText('Заявка № 00000001002', {}, { timeout: 2_500 }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Заявка № 00000002030')).not.toBeInTheDocument()
  })

  it('restores the filtered list after returning from hidden bets', async () => {
    await router.navigate({
      to: '/auctions',
      search: {
        page: 1,
        cargo_num: '00000002029',
        status: 'Confirmed',
      },
    })
    render(<AppProviders />)

    expect(await screen.findByText('Заявка № 00000002029')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Смотреть ставки' }))

    expect(await screen.findByText('История ставок скрыта')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Вернуться к списку' }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/auctions')
      expect(router.state.location.search).toMatchObject({
        page: 1,
        cargo_num: '00000002029',
        status: 'Confirmed',
      })
    })
    expect(await screen.findByText('Заявка № 00000002029')).toBeInTheDocument()
    expect(screen.getByLabelText('Номер заявки')).toHaveValue('00000002029')
    expect(screen.queryByText('Заявка № 00000002030')).not.toBeInTheDocument()
  })

  it('renders a contract error and retry action', async () => {
    server.use(
      http.post('/api/v1/auctions/list', () =>
        HttpResponse.json(
          {
            code: 'service_unavailable',
            title: 'Сервис недоступен',
            message: 'Попробуйте ещё раз позднее.',
          },
          { status: 503 },
        ),
      ),
    )
    render(<AppProviders />)

    expect(
      await screen.findByRole('alert', {}, { timeout: 2500 }),
    ).toHaveTextContent('Попробуйте ещё раз позднее.')
    expect(
      screen.getByRole('button', { name: 'Повторить' }),
    ).toBeInTheDocument()
  })
})
