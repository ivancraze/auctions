import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'

import { AuctionDetailsSections } from './AuctionDetailsSections'
import { AuctionDetailsSkeleton } from './AuctionDetailsSkeleton'
import { auctionQueries, mapAuctionDetails } from '@/entities/auction'
import { ApiError } from '@/shared/api'
import {
  Badge,
  BadgeGroup,
  Breadcrumbs,
  Button,
  buttonClassName,
  Eyebrow,
  StateCard,
} from '@/shared/ui'

import styles from './AuctionDetailsPage.module.scss'

export function AuctionDetailsPage() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid' })
  const detailQuery = useQuery(auctionQueries.detail(auctionUuid))

  if (detailQuery.isPending) return <AuctionDetailsSkeleton />

  if (detailQuery.isError) {
    const isNotFound =
      detailQuery.error instanceof ApiError && detailQuery.error.status === 404
    return (
      <StateCard as="section" role="alert" tone="error">
        <h1>
          {isNotFound ? 'Аукцион не найден' : 'Не удалось загрузить аукцион'}
        </h1>
        <p>{detailQuery.error.message}</p>
        <Link
          className={buttonClassName('secondary')}
          search={(current) => ({ ...current, page: current.page ?? 1 })}
          to="/auctions"
        >
          Вернуться к списку
        </Link>
      </StateCard>
    )
  }

  const auction = mapAuctionDetails(detailQuery.data)

  return (
    <article>
      <Breadcrumbs>
        <Link
          search={(current) => ({ ...current, page: current.page ?? 1 })}
          to="/auctions"
        >
          Аукционы
        </Link>
        <span aria-hidden="true">→</span>
        <span aria-current="page">Заявка № {auction.cargoNumber}</span>
      </Breadcrumbs>

      <header className={styles.hero}>
        <div>
          <Eyebrow>Заявка № {auction.cargoNumber}</Eyebrow>
          <h1>
            {auction.routes[0]?.city ?? 'Погрузка'} →{' '}
            {auction.routes.at(-1)?.city ?? 'Выгрузка'}
          </h1>
          <BadgeGroup>
            <Badge tone="active">{auction.status}</Badge>
            <Badge tone="type">{auction.type}</Badge>
          </BadgeGroup>
        </div>
        <div className={styles.actions}>
          <Link
            className={buttonClassName('secondary')}
            params={{ auctionUuid }}
            search={(current) => ({ ...current, page: current.page ?? 1 })}
            to="/auctions/$auctionUuid/bets"
          >
            История ставок
          </Link>
          {auction.canSetBet ? (
            <Link
              className={buttonClassName('primary')}
              params={{ auctionUuid }}
              search={(current) => ({ ...current, page: current.page ?? 1 })}
              to="/auctions/$auctionUuid/bet"
            >
              {auction.trading.ownBet === 'Ставки нет'
                ? 'Сделать ставку'
                : 'Изменить ставку'}
            </Link>
          ) : (
            <Button disabled type="button">
              Ставка недоступна
            </Button>
          )}
        </div>
      </header>

      <div className={styles.restrictions}>
        {auction.hideContacts ? (
          <p>Точные адреса и контакты скрыты организатором.</p>
        ) : null}
        {auction.hideBetsHistory ? (
          <p>История ставок скрыта организатором.</p>
        ) : null}
        {auction.noViewCargoPrice ? (
          <p>Стоимость груза недоступна для просмотра.</p>
        ) : null}
      </div>

      <AuctionDetailsSections auction={auction} />
    </article>
  )
}
