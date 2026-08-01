import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'

import { auctionQueries } from '@/entities/auction'
import { SetAuctionBetForm } from '@/features/set-auction-bet'
import { Breadcrumbs, buttonClassName, Eyebrow, StateCard } from '@/shared/ui'

import styles from './AuctionBetPage.module.scss'

export function AuctionBetPage() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' })
  const navigate = useNavigate({ from: '/auctions/$auctionUuid/bet' })
  const detailQuery = useQuery(auctionQueries.detail(auctionUuid))

  if (detailQuery.isPending) {
    return (
      <StateCard aria-busy="true" role="status">
        Загрузка параметров ставки…
      </StateCard>
    )
  }

  if (detailQuery.isError) {
    return (
      <StateCard role="alert" tone="error">
        <h1>Не удалось загрузить аукцион</h1>
        <p>{detailQuery.error.message}</p>
      </StateCard>
    )
  }

  if (!detailQuery.data.trading.can_set_bet) {
    return (
      <StateCard as="section">
        <Eyebrow>
          Заявка № {detailQuery.data.main.cargo_num ?? 'Без номера'}
        </Eyebrow>
        <h1>Ставка недоступна</h1>
        <p>Текущее состояние торгов не позволяет установить ставку.</p>
        <Link
          className={buttonClassName('secondary')}
          params={{ auctionUuid }}
          search={(current) => ({ ...current, page: current.page ?? 1 })}
          to="/auctions/$auctionUuid"
        >
          Вернуться к аукциону
        </Link>
      </StateCard>
    )
  }

  return (
    <section>
      <Breadcrumbs>
        <Link
          search={(current) => ({ ...current, page: current.page ?? 1 })}
          to="/auctions"
        >
          Аукционы
        </Link>
        <span aria-hidden="true">→</span>
        <Link
          params={{ auctionUuid }}
          search={(current) => ({ ...current, page: current.page ?? 1 })}
          to="/auctions/$auctionUuid"
        >
          Заявка № {detailQuery.data.main.cargo_num ?? 'Без номера'}
        </Link>
        <span aria-hidden="true">→</span>
        <span aria-current="page">Ставка</span>
      </Breadcrumbs>
      <div className={styles.panel}>
        <header>
          <Eyebrow>Участие в торгах</Eyebrow>
          <h1>
            {detailQuery.data.trading.your?.bet
              ? 'Изменить ставку'
              : 'Сделать ставку'}
          </h1>
          <p>Проверьте ограничения аукциона перед отправкой.</p>
        </header>
        <SetAuctionBetForm
          auctionUuid={auctionUuid}
          cancelAction={
            <Link
              className={buttonClassName('secondary')}
              params={{ auctionUuid }}
              search={(current) => ({ ...current, page: current.page ?? 1 })}
              to="/auctions/$auctionUuid"
            >
              Отмена
            </Link>
          }
          onSuccess={() => {
            void navigate({
              to: '/auctions/$auctionUuid',
              params: { auctionUuid },
              search: (current) => ({ ...current, page: current.page ?? 1 }),
            })
          }}
          trading={detailQuery.data.trading}
        />
      </div>
    </section>
  )
}
