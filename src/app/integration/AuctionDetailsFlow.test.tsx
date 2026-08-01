import { fireEvent, render, screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppProviders, queryClient } from '@/app/providers'
import { router } from '@/app/router'
import { server } from '@/mocks/server'
import { mockStore } from '@/mocks/store'

beforeEach(() => {
  queryClient.clear()
})

describe('auction detail and bets pages', () => {
  /** Проверяет отображение основных секций страницы из detail-ответа API. */
  it('renders detail sections from the detail endpoint', async () => {
    await router.navigate({
      to: '/auctions/$auctionUuid',
      params: { auctionUuid: '550e8400-e29b-41d4-a716-446655440001' },
      search: { page: 1 },
    })
    render(<AppProviders />)

    expect(
      await screen.findByRole('heading', { name: 'Самара → Москва' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Маршрут' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Торги' })).toBeInTheDocument()
    expect(screen.getByText('ООО Логистика')).toBeInTheDocument()

    const breadcrumbs = screen.getByRole('navigation', {
      name: 'Навигационная цепочка',
    })
    expect(
      within(breadcrumbs).getByText('Заявка № 00000001001'),
    ).toHaveAttribute('aria-current', 'page')
    within(breadcrumbs)
      .getAllByText('→')
      .forEach((separator) =>
        expect(separator).toHaveAttribute('aria-hidden', 'true'),
      )
  })

  /** Проверяет понятный 404 fallback непосредственно на странице аукциона. */
  it('shows a not-found state for an unknown auction detail', async () => {
    await router.navigate({
      to: '/auctions/$auctionUuid',
      params: { auctionUuid: '550e8400-e29b-41d4-a716-ffffffffffff' },
      search: { page: 1 },
    })
    render(<AppProviders />)

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Аукцион не найден' },
        { timeout: 3_000 },
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Вернуться к списку' }),
    ).toBeInTheDocument()
  })

  /** Проверяет доступное live-состояние во время загрузки истории ставок. */
  it('announces the bets loading state', async () => {
    const auctionUuid = '550e8400-e29b-41d4-a716-446655440002'
    let releaseResponse: () => void = () => undefined
    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve
    })
    server.use(
      http.get('/api/v1/auctions/:auctionUuid', async () => {
        await responseGate
        return HttpResponse.json(mockStore.details[auctionUuid])
      }),
    )
    await router.navigate({
      to: '/auctions/$auctionUuid/bets',
      params: { auctionUuid },
      search: { page: 1 },
    })
    render(<AppProviders />)

    expect(
      (await screen.findByText('Загрузка истории ставок…')).closest(
        '[role="status"]',
      ),
    ).toHaveAttribute('aria-busy', 'true')

    releaseResponse()
    expect(
      await screen.findByRole('heading', { name: 'История ставок' }),
    ).toBeInTheDocument()
  })

  /** Проверяет отдельное состояние страницы для скрытой истории ставок. */
  it('shows a dedicated state when the bets history is hidden', async () => {
    await router.navigate({
      to: '/auctions/$auctionUuid/bets',
      params: { auctionUuid: '550e8400-e29b-41d4-a716-446655440004' },
      search: { page: 1 },
    })
    render(<AppProviders />)

    expect(await screen.findByText('История ставок скрыта')).toBeInTheDocument()
  })

  /** Проверяет завершение загрузки сообщением об ошибке для неизвестного аукциона. */
  it('shows a not found error instead of an endless loader', async () => {
    await router.navigate({
      to: '/auctions/$auctionUuid/bets',
      params: { auctionUuid: '550e8400-e29b-41d4-a716-ffffffffffff' },
      search: { page: 1 },
    })
    render(<AppProviders />)

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Аукцион не найден' },
        { timeout: 3_000 },
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Загрузка истории ставок…'),
    ).not.toBeInTheDocument()
  })

  /** Проверяет скрытие истории по вложенному флагу без лишнего запроса ставок. */
  it('hides bets history when the trading flag requires it', async () => {
    const auctionUuid = '550e8400-e29b-41d4-a716-446655440002'
    const betsRequestSpy = vi.fn()
    server.use(
      http.get('/api/v1/auctions/:auctionUuid/bets', () => {
        betsRequestSpy()
        return HttpResponse.json({ bets: [] })
      }),
    )
    const details = mockStore.details[auctionUuid]
    expect(details).toBeDefined()
    details!.hide_bets_history = false
    details!.trading.hide_bets_history = true

    await router.navigate({
      to: '/auctions/$auctionUuid/bets',
      params: { auctionUuid },
      search: { page: 1 },
    })
    render(<AppProviders />)

    expect(await screen.findByText('История ставок скрыта')).toBeInTheDocument()
    expect(
      screen.queryByRole('columnheader', { name: 'Перевозчик' }),
    ).not.toBeInTheDocument()
    expect(betsRequestSpy).not.toHaveBeenCalled()
  })

  /** Проверяет удаление колонки мест, когда организатор скрывает позиции. */
  it('hides the place column when auction places are private', async () => {
    await router.navigate({
      to: '/auctions/$auctionUuid/bets',
      params: { auctionUuid: '550e8400-e29b-41d4-a716-446655441009' },
      search: { page: 1 },
    })
    render(<AppProviders />)

    expect(await screen.findByText('История ставок')).toBeInTheDocument()
    const table = screen.getByRole('table')
    const dataRows = within(table).getAllByRole('row').slice(1)

    expect(dataRows.length).toBeGreaterThan(0)
    expect(
      screen.getByRole('columnheader', { name: 'Перевозчик' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('columnheader', { name: 'Место' }),
    ).not.toBeInTheDocument()
    dataRows.forEach((row) => {
      expect(within(row).getAllByRole('cell')).toHaveLength(5)
    })
  })

  /** Проверяет загрузку отменённых ставок после изменения search-параметра all. */
  it('loads canceled bets after changing the all search parameter', async () => {
    await router.navigate({
      to: '/auctions/$auctionUuid/bets',
      params: { auctionUuid: '550e8400-e29b-41d4-a716-446655440002' },
      search: { page: 1 },
    })
    render(<AppProviders />)

    expect(
      await screen.findByRole('heading', { name: 'История ставок' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Отменена')).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Показывать отменённые' }),
    )

    expect(await screen.findByText('Отменена')).toBeInTheDocument()
    expect(
      screen.getByText('Причина: Ставка отозвана перевозчиком'),
    ).toBeInTheDocument()

    const tableRegion = screen.getByRole('region', {
      name: 'Таблица истории ставок',
    })
    expect(tableRegion).toHaveAttribute('tabindex', '0')
    tableRegion.focus()
    expect(tableRegion).toHaveFocus()

    const table = within(tableRegion).getByRole('table', {
      name: /История ставок по заявке №/,
    })
    within(table)
      .getAllByRole('columnheader')
      .forEach((header) => expect(header).toHaveAttribute('scope', 'col'))
  })
})
