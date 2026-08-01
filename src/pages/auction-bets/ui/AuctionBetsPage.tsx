import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'

import { auctionQueries, mapBets } from '@/entities/auction'
import { ApiError } from '@/shared/api/client'
import {
  Badge,
  Breadcrumbs,
  buttonClassName,
  Eyebrow,
  PageHeading,
  PageSubtitle,
  StateCard,
  StateCardTitle,
} from '@/shared/ui'

import styles from './AuctionBetsPage.module.scss'

export function AuctionBetsPage() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bets' })
  const search = useSearch({ from: '/auctions/$auctionUuid/bets' })
  const navigate = useNavigate({ from: '/auctions/$auctionUuid/bets' })
  const detailQuery = useQuery(auctionQueries.detail(auctionUuid))
  const isHidden =
    detailQuery.data?.hide_bets_history ??
    detailQuery.data?.trading.hide_bets_history ??
    false
  const betsQuery = useQuery({
    ...auctionQueries.bets(auctionUuid, search.all ?? false),
    enabled: detailQuery.isSuccess && !isHidden,
  })

  if (detailQuery.isPending || (!isHidden && betsQuery.isPending)) {
    return <StateCard aria-busy="true">Загрузка истории ставок…</StateCard>
  }

  const error = detailQuery.error ?? betsQuery.error
  if (error) {
    const isNotFound = error instanceof ApiError && error.status === 404
    return (
      <StateCard role="alert" tone="error">
        <h1>
          {isNotFound ? 'Аукцион не найден' : 'Не удалось загрузить ставки'}
        </h1>
        <p>{error.message}</p>
      </StateCard>
    )
  }

  const cargoNumber = detailQuery.data?.main.cargo_num ?? 'Без номера'

  if (isHidden) {
    return (
      <StateCard as="section">
        <Eyebrow>Заявка № {cargoNumber}</Eyebrow>
        <h1>История ставок скрыта</h1>
        <p>Организатор ограничил просмотр ставок этого аукциона.</p>
        <Link
          className={buttonClassName('secondary')}
          params={{ auctionUuid }}
          to="/auctions/$auctionUuid"
        >
          Вернуться к аукциону
        </Link>
      </StateCard>
    )
  }

  const bets = mapBets(betsQuery.data?.bets ?? [])

  return (
    <section>
      <Breadcrumbs>
        <Link search={{ page: 1 }} to="/auctions">
          Аукционы
        </Link>
        <span>→</span>
        <Link params={{ auctionUuid }} to="/auctions/$auctionUuid">
          Заявка № {cargoNumber}
        </Link>
        <span>→</span>
        <span>Ставки</span>
      </Breadcrumbs>
      <PageHeading>
        <div>
          <Eyebrow>Заявка № {cargoNumber}</Eyebrow>
          <h1>История ставок</h1>
          <PageSubtitle>Участников: {bets.participants}</PageSubtitle>
        </div>
        <label className={styles.toggle}>
          <input
            checked={search.all ?? false}
            onChange={(event) =>
              void navigate({
                search: { all: event.target.checked || undefined },
              })
            }
            type="checkbox"
          />
          Показывать отменённые
        </label>
      </PageHeading>

      {bets.rows.length === 0 ? (
        <StateCard>
          <StateCardTitle>Ставок пока нет</StateCardTitle>
          <p>Будьте первым участником аукциона.</p>
        </StateCard>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Перевозчик</th>
                <th>С НДС</th>
                <th>Без НДС</th>
                <th>Место</th>
                <th>Дата</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {bets.rows.map((bet) => (
                <tr
                  className={bet.isCanceled ? styles.canceled : undefined}
                  key={bet.id}
                >
                  <td>
                    <strong>{bet.carrier}</strong>
                    <span>ИНН {bet.inn}</span>
                  </td>
                  <td>{bet.priceWithVat}</td>
                  <td>{bet.priceNoVat}</td>
                  <td>{bet.place}</td>
                  <td>{bet.createdAt}</td>
                  <td>
                    {bet.isWinner ? (
                      <Badge tone="success">Победитель</Badge>
                    ) : bet.isCanceled ? (
                      <span title={bet.cancelReason ?? undefined}>
                        Отменена
                      </span>
                    ) : (
                      'Активна'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
