import { describe, expect, it } from 'vitest'

import { mapAuctionCard } from './mapAuctionCard'

describe('mapAuctionCard', () => {
  /**
   * Проверяет формирование доступного действия установки ставки без привязки
   * ViewModel к маршрутам приложения.
   */
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
        kind: 'set-bet',
      },
    })
  })

  /**
   * Проверяет формирование действия просмотра ставок, когда новая ставка
   * недоступна, но у пользователя уже есть собственная ставка.
   */
  it('creates a view-bets action for an auction with an existing user bet', () => {
    const result = mapAuctionCard({
      main: {
        order_uid: 'auction-uuid',
      },
      trading: {
        can_set_bet: false,
        your: { bet: true },
      },
    })

    expect(result.action).toEqual({
      label: 'Смотреть ставки',
      disabled: false,
      kind: 'view-bets',
    })
  })

  /** Проверяет действие изменения ставки для уже участвующего пользователя. */
  it('creates an edit-bet action when another bet is allowed', () => {
    const result = mapAuctionCard({
      main: { order_uid: 'auction-uuid' },
      trading: { can_set_bet: true, your: { bet: true } },
    })

    expect(result.action).toEqual({
      label: 'Изменить ставку',
      disabled: false,
      kind: 'set-bet',
    })
  })

  /** Проверяет недоступное действие при запрете ставок и отсутствии участия. */
  it('disables betting when the auction rejects new bets', () => {
    const result = mapAuctionCard({
      main: { order_uid: 'auction-uuid' },
      trading: { can_set_bet: false, your: { bet: false } },
    })

    expect(result.action).toEqual({
      label: 'Ставки недоступны',
      disabled: true,
    })
  })

  /**
   * Проверяет безопасные значения ViewModel для неполного DTO и отсутствие
   * навигационной цели у недоступного действия.
   */
  it('uses safe fallback values for a partial list DTO', () => {
    const result = mapAuctionCard({})

    expect(result).toMatchObject({
      uuid: null,
      cargoNumber: 'Без номера',
      route: 'Не указано → Не указано',
      currentPrice: 'Не указано',
      action: { label: 'Недоступно', disabled: true },
    })
    expect(result.action).not.toHaveProperty('kind')
    expect(result.action).not.toHaveProperty('to')
  })
})
