import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'

import { auctionQueries } from '@/entities/auction/api/auctionQueries'
import { mapBets } from '@/entities/auction/model/mapBets'
import { ApiError } from '@/shared/api/client'

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
    return (
      <div className="state-card" aria-busy="true">
        Загрузка истории ставок…
      </div>
    )
  }

  const error = detailQuery.error ?? betsQuery.error
  if (error) {
    const isNotFound = error instanceof ApiError && error.status === 404
    return (
      <div className="state-card state-card--error" role="alert">
        <h1>
          {isNotFound ? 'Аукцион не найден' : 'Не удалось загрузить ставки'}
        </h1>
        <p>{error.message}</p>
      </div>
    )
  }

  const cargoNumber = detailQuery.data?.main.cargo_num ?? 'Без номера'

  if (isHidden) {
    return (
      <section className="state-card">
        <p className="eyebrow">Заявка № {cargoNumber}</p>
        <h1>История ставок скрыта</h1>
        <p>Организатор ограничил просмотр ставок этого аукциона.</p>
        <Link
          className="button button--secondary"
          params={{ auctionUuid }}
          to="/auctions/$auctionUuid"
        >
          Вернуться к аукциону
        </Link>
      </section>
    )
  }

  const bets = mapBets(betsQuery.data?.bets ?? [])

  return (
    <section className="bets-page">
      <nav className="breadcrumbs" aria-label="Навигационная цепочка">
        <Link search={{ page: 1 }} to="/auctions">
          Аукционы
        </Link>
        <span>→</span>
        <Link params={{ auctionUuid }} to="/auctions/$auctionUuid">
          Заявка № {cargoNumber}
        </Link>
        <span>→</span>
        <span>Ставки</span>
      </nav>
      <header className="page-heading">
        <div>
          <p className="eyebrow">Заявка № {cargoNumber}</p>
          <h1>История ставок</h1>
          <p className="page-subtitle">Участников: {bets.participants}</p>
        </div>
        <label className="all-bets-toggle">
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
      </header>

      {bets.rows.length === 0 ? (
        <div className="state-card">
          <p className="state-card__title">Ставок пока нет</p>
          <p>Будьте первым участником аукциона.</p>
        </div>
      ) : (
        <div className="bets-table-wrap">
          <table className="bets-table">
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
                  className={bet.isCanceled ? 'bets-table__row--canceled' : ''}
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
                      <span className="status-badge status-badge--success">
                        Победитель
                      </span>
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
