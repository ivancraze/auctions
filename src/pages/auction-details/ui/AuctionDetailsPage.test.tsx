import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/AppProviders'
import { queryClient } from '@/app/providers/queryClient'
import { router } from '@/app/router/router'

beforeEach(() => {
  queryClient.clear()
})

describe('auction detail and bets pages', () => {
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
  })

  it('shows a dedicated state when the bets history is hidden', async () => {
    await router.navigate({
      to: '/auctions/$auctionUuid/bets',
      params: { auctionUuid: '550e8400-e29b-41d4-a716-446655440004' },
      search: { page: 1 },
    })
    render(<AppProviders />)

    expect(await screen.findByText('История ставок скрыта')).toBeInTheDocument()
  })

  it('loads canceled bets after changing the all search parameter', async () => {
    await router.navigate({
      to: '/auctions/$auctionUuid/bets',
      params: { auctionUuid: '550e8400-e29b-41d4-a716-446655440002' },
      search: { page: 1 },
    })
    render(<AppProviders />)

    expect(await screen.findByText('История ставок')).toBeInTheDocument()
    expect(screen.queryByText('Отменена')).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Показывать отменённые' }),
    )

    expect(await screen.findByText('Отменена')).toBeInTheDocument()
  })
})
