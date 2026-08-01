import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { mapAuctionCard } from '../model/mapAuctionCard'
import { AuctionCard } from './AuctionCard'

describe('AuctionCard', () => {
  /** Проверяет, что перемещение фокуса внутри карточки не повторяет prefetch-намерение. */
  it('reports focus intent only when focus enters the card', () => {
    const onIntent = vi.fn()
    const auction = mapAuctionCard({
      main: { order_uid: 'auction-uuid' },
      trading: { can_set_bet: true },
    })

    render(
      <AuctionCard
        actions={
          <>
            <button type="button">Первое действие</button>
            <button type="button">Второе действие</button>
          </>
        }
        auction={auction}
        onIntent={onIntent}
      />,
    )

    const firstAction = screen.getByRole('button', {
      name: 'Первое действие',
    })
    const secondAction = screen.getByRole('button', {
      name: 'Второе действие',
    })

    fireEvent.focus(firstAction)
    fireEvent.focus(secondAction, { relatedTarget: firstAction })

    expect(onIntent).toHaveBeenCalledOnce()
    expect(onIntent).toHaveBeenCalledWith('auction-uuid')
  })
})
