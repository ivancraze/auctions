import { describe, expect, it } from 'vitest'

import { mapAuctionCard } from './mapAuctionCard'

describe('mapAuctionCard', () => {
  it('creates a bet action for an available auction without a user bet', () => {
    const result = mapAuctionCard({
      main: {
        cargo_num: '42',
        order_uid: 'auction-uuid',
        auc_type: 'Down',
      },
      trading: {
        status: 'Auction',
        status_mobile: 'NotParticipating',
        can_set_bet: true,
        your: { bet: false },
      },
    })

    expect(result).toMatchObject({
      cargoNumber: '42',
      status: 'Торги идут',
      action: {
        label: 'Сделать ставку',
        disabled: false,
        to: '/auctions/$auctionUuid/bet',
      },
    })
  })

  it('uses safe fallback values for a partial list DTO', () => {
    const result = mapAuctionCard({})

    expect(result).toMatchObject({
      uuid: null,
      cargoNumber: 'Без номера',
      route: 'Не указано → Не указано',
      currentPrice: 'Не указано',
      action: { label: 'Недоступно', disabled: true },
    })
  })
})
