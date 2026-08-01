import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AppProviders, queryClient } from '@/app/providers'
import { router } from '@/app/router'
import { auctionKeys } from '@/entities/auction'
import { server } from '@/mocks/server'
import { mockStore } from '@/mocks/store'

function getOptionValues(select: HTMLElement) {
  return Array.from(select.querySelectorAll('option'), (option) => option.value)
}

beforeEach(async () => {
  queryClient.clear()
  await router.navigate({ to: '/auctions', search: { page: 1 } })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AuctionsListPage', () => {
  /** Проверяет семантический заголовок маршрута и возврат фокуса после пагинации. */
  it('loads and renders auction cards', async () => {
    render(<AppProviders />)

    expect(await screen.findByText('Заявка № 00000002030')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Казань → Санкт-Петербург' }),
    ).toBeInTheDocument()
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
    expect(await screen.findByText('Заявка № 00000002024')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Далее →' })).toHaveFocus()
  })

  /** Проверяет понятное пустое состояние при отсутствии результатов. */
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

  /** Проверяет применение фильтра и сохранение его значения в URL. */
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

  /** Проверяет очистку URL, полей формы и выдачи кнопкой сброса фильтров. */
  it('resets applied filters and restores the default list', async () => {
    render(<AppProviders />)
    await screen.findByText('Заявка № 00000002030')

    fireEvent.change(screen.getByLabelText('Номер заявки'), {
      target: { value: '00000001002' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Применить' }))
    expect(await screen.findByText('Заявка № 00000001002')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Сбросить' }))

    await waitFor(() => {
      expect(router.state.location.search).toEqual({ page: 1 })
    })
    expect(await screen.findByText('Заявка № 00000002030')).toBeInTheDocument()
    expect(screen.getByLabelText('Номер заявки')).toHaveValue('')
  })

  /** Проверяет возврат к ранее отфильтрованному списку со скрытой истории. */
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

  /** Проверяет доступное сообщение API-ошибки и действие повторной загрузки. */
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

  /** Проверяет семантику модального окна и восстановление фокуса после Escape. */
  it('opens the mobile filters as a dialog and restores focus on Escape', async () => {
    render(<AppProviders />)
    await screen.findByText('Заявка № 00000002030')

    const trigger = screen.getByRole('button', { name: 'Фильтры' })
    trigger.focus()
    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'Фильтры' })
    const closeButton = within(dialog).getByRole('button', {
      name: 'Закрыть фильтры',
    })

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(closeButton).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(
      screen.queryByRole('dialog', { name: 'Фильтры' }),
    ).not.toBeInTheDocument()
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  /** Проверяет закрытие мобильной панели и снятие блокировки прокрутки при переходе на desktop. */
  it('closes the mobile filters after resizing to desktop', async () => {
    const width = vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(375)
    render(<AppProviders />)
    await screen.findByText('Заявка № 00000002030')

    fireEvent.click(screen.getByRole('button', { name: 'Фильтры' }))
    expect(screen.getByRole('dialog', { name: 'Фильтры' })).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')

    width.mockReturnValue(1024)
    fireEvent(window, new Event('resize'))

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Фильтры' }),
      ).not.toBeInTheDocument()
      expect(document.body.style.overflow).toBe('')
    })
  })

  /** Проверяет циклическое перемещение фокуса по интерактивным элементам панели. */
  it('keeps Tab focus inside the mobile filters dialog', async () => {
    render(<AppProviders />)
    await screen.findByText('Заявка № 00000002030')

    fireEvent.click(screen.getByRole('button', { name: 'Фильтры' }))

    const dialog = screen.getByRole('dialog', { name: 'Фильтры' })
    const closeButton = within(dialog).getByRole('button', {
      name: 'Закрыть фильтры',
    })
    const resetButton = within(dialog).getByRole('button', { name: 'Сбросить' })

    resetButton.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(closeButton).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(resetButton).toHaveFocus()
  })

  /** Проверяет наличие всех пользовательских и аукционных статусов из OpenAPI. */
  it('renders every status option supported by the list request', async () => {
    render(<AppProviders />)
    await screen.findByText('Заявка № 00000002030')

    const userStatus = screen.getByLabelText('Ваш статус')
    const auctionStatus = screen.getByLabelText('Статус аукциона')

    expect(getOptionValues(userStatus)).toEqual([
      '',
      'NotParticipating',
      'Leading',
      'Losing',
      'OnPending',
      'Confirmed',
      'ChoosingWinner',
      'Winner',
      'Accepted',
      'Unknown',
    ])
    expect(getOptionValues(auctionStatus)).toEqual([
      '',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
    ])
  })

  /** Проверяет коррекцию лишней страницы с сохранением выбранных фильтров. */
  it('replaces an excessive page with the last page and loads its data', async () => {
    const lastPage = 12
    const auction = mockStore.auctions[0]!
    const requestedPages: number[] = []

    server.use(
      http.post('/api/v1/auctions/list', async ({ request }) => {
        const body = (await request.json()) as { page?: number }
        const page = body.page ?? 1
        requestedPages.push(page)

        return HttpResponse.json({
          data: page === lastPage ? [auction] : [],
          meta: {
            current_page: page,
            from: page === lastPage ? 34 : 0,
            last_page: lastPage,
            per_page: 3,
            to: page === lastPage ? 34 : 0,
            total: 34,
          },
        })
      }),
    )
    await router.navigate({
      to: '/auctions',
      search: {
        page: 99,
        load_city: 'Самара',
        status: 'NotParticipating',
      },
    })

    render(<AppProviders />)

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        page: lastPage,
        load_city: 'Самара',
        status: 'NotParticipating',
      })
    })
    expect(
      await screen.findByText(`Заявка № ${auction.main?.cargo_num}`),
    ).toBeInTheDocument()
    expect(requestedPages).toEqual([99, lastPage])
  })
})
