import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { AppProviders, queryClient } from '@/app/providers'
import { router } from '@/app/router'

beforeEach(async () => {
  queryClient.clear()
  await router.navigate({ to: '/auctions', search: { page: 1 } })
})

describe('RootLayout', () => {
  /** Проверяет skip-link, объявление маршрута, title и перенос фокуса при навигации. */
  it('announces a pathname change and focuses the main content', async () => {
    render(<AppProviders />)

    expect(
      screen.getByRole('link', { name: 'Перейти к основному содержимому' }),
    ).toHaveAttribute('href', '#main-content')
    expect(screen.getByText('Открыта страница: Аукционы')).toBeInTheDocument()
    expect(document.title).toBe('Аукционы — Умная Логистика')

    await act(async () => {
      await router.navigate({
        to: '/auctions/$auctionUuid',
        params: { auctionUuid: '550e8400-e29b-41d4-a716-446655440001' },
        search: { page: 1 },
      })
    })

    await waitFor(() => {
      expect(document.title).toBe('Аукцион — Умная Логистика')
      expect(screen.getByText('Открыта страница: Аукцион')).toBeInTheDocument()
      expect(screen.getByRole('main')).toHaveFocus()
    })
  })

  /** Проверяет доступный fallback и возврат к списку для неизвестного URL. */
  it('renders the not-found page for an unknown route', async () => {
    render(<AppProviders />)

    await act(async () => {
      await router.navigate({ href: '/unknown-route' })
    })

    expect(
      await screen.findByRole('heading', { name: 'Страница не найдена' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Вернуться к аукционам' }),
    ).toHaveAttribute('href', '/auctions?page=1')
  })
})
