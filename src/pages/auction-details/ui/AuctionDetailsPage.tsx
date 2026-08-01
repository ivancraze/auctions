import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'

import { auctionQueries } from '@/entities/auction/api/auctionQueries'
import { mapAuctionDetails } from '@/entities/auction/model/mapAuctionDetails'
import { ApiError } from '@/shared/api/client'

function DetailSkeleton() {
  return (
    <div
      className="detail-grid"
      aria-busy="true"
      aria-label="Загрузка аукциона"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div className="detail-section" key={index}>
          <span className="skeleton skeleton--title" />
          <span className="skeleton skeleton--block" />
        </div>
      ))}
    </div>
  )
}

export function AuctionDetailsPage() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid' })
  const detailQuery = useQuery(auctionQueries.detail(auctionUuid))

  if (detailQuery.isPending) return <DetailSkeleton />

  if (detailQuery.isError) {
    const isNotFound =
      detailQuery.error instanceof ApiError && detailQuery.error.status === 404
    return (
      <section className="state-card state-card--error" role="alert">
        <h1>
          {isNotFound ? 'Аукцион не найден' : 'Не удалось загрузить аукцион'}
        </h1>
        <p>{detailQuery.error.message}</p>
        <Link
          className="button button--secondary"
          search={{ page: 1 }}
          to="/auctions"
        >
          Вернуться к списку
        </Link>
      </section>
    )
  }

  const auction = mapAuctionDetails(detailQuery.data)

  return (
    <article className="auction-details">
      <nav className="breadcrumbs" aria-label="Навигационная цепочка">
        <Link search={{ page: 1 }} to="/auctions">
          Аукционы
        </Link>
        <span>→</span>
        <span>Заявка № {auction.cargoNumber}</span>
      </nav>

      <header className="detail-hero">
        <div>
          <p className="eyebrow">Заявка № {auction.cargoNumber}</p>
          <h1>
            {auction.routes[0]?.city ?? 'Погрузка'} →{' '}
            {auction.routes.at(-1)?.city ?? 'Выгрузка'}
          </h1>
          <div className="auction-card__badges">
            <span className="status-badge status-badge--active">
              {auction.status}
            </span>
            <span className="type-badge">{auction.type}</span>
          </div>
        </div>
        <div className="detail-actions">
          {!auction.hideBetsHistory ? (
            <Link
              className="button button--secondary"
              params={{ auctionUuid }}
              to="/auctions/$auctionUuid/bets"
            >
              История ставок
            </Link>
          ) : null}
          {auction.canSetBet ? (
            <Link
              className="button button--primary"
              params={{ auctionUuid }}
              to="/auctions/$auctionUuid/bet"
            >
              {auction.trading.ownBet === 'Ставки нет'
                ? 'Сделать ставку'
                : 'Изменить ставку'}
            </Link>
          ) : (
            <button className="button button--disabled" disabled type="button">
              Ставка недоступна
            </button>
          )}
        </div>
      </header>

      <div className="restriction-list">
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

      <div className="detail-grid">
        <section className="detail-section detail-section--wide">
          <h2>Маршрут</h2>
          <ol className="route-timeline">
            {auction.routes.map((route) => (
              <li key={route.key}>
                <span className="route-timeline__marker" />
                <div>
                  <p className="field-label">{route.operation}</p>
                  <h3>{route.city}</h3>
                  {route.address ? <p>{route.address}</p> : null}
                  <p className="field-note">{route.interval}</p>
                  <p className="field-note">{route.cargo}</p>
                  {route.contact ? (
                    <p className="field-note">Контакт: {route.contact}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="detail-section">
          <h2>Торги</h2>
          <dl className="details-list">
            <div>
              <dt>Ваш статус</dt>
              <dd>{auction.userStatus}</dd>
            </div>
            <div>
              <dt>Начало</dt>
              <dd>{auction.trading.start}</dd>
            </div>
            <div>
              <dt>Окончание</dt>
              <dd>{auction.trading.stop}</dd>
            </div>
            <div>
              <dt>Текущая цена</dt>
              <dd>{auction.trading.current}</dd>
            </div>
            <div>
              <dt>Без НДС</dt>
              <dd>{auction.trading.currentNoVat}</dd>
            </div>
            <div>
              <dt>Доступная цена</dt>
              <dd>{auction.trading.available}</dd>
            </div>
            <div>
              <dt>Диапазон</dt>
              <dd>
                {auction.trading.min} — {auction.trading.max}
              </dd>
            </div>
            <div>
              <dt>Шаг</dt>
              <dd>{auction.trading.step}</dd>
            </div>
            <div>
              <dt>Цена за км</dt>
              <dd>{auction.trading.pricePerKm}</dd>
            </div>
            <div>
              <dt>Ваша ставка</dt>
              <dd>{auction.trading.ownBet}</dd>
            </div>
          </dl>
        </section>

        <section className="detail-section">
          <h2>Груз и транспорт</h2>
          <dl className="details-list">
            <div>
              <dt>Груз</dt>
              <dd>{auction.cargo.name}</dd>
            </div>
            <div>
              <dt>Характеристики</dt>
              <dd>{auction.cargo.characteristics}</dd>
            </div>
            <div>
              <dt>Тип кузова</dt>
              <dd>{auction.cargo.bodyType}</dd>
            </div>
            <div>
              <dt>Температура</dt>
              <dd>{auction.cargo.temperature}</dd>
            </div>
            <div>
              <dt>Требования к ТС</dt>
              <dd>{auction.cargo.car}</dd>
            </div>
          </dl>
        </section>

        <section className="detail-section">
          <h2>Организатор</h2>
          <dl className="details-list">
            <div>
              <dt>Организация</dt>
              <dd>{auction.organizer.name}</dd>
            </div>
            <div>
              <dt>ИНН</dt>
              <dd>{auction.organizer.inn}</dd>
            </div>
            <div>
              <dt>КПП</dt>
              <dd>{auction.organizer.kpp}</dd>
            </div>
          </dl>
          {!auction.hideContacts ? (
            <div className="contacts-list">
              {auction.contacts.length ? (
                auction.contacts.map((contact, index) => (
                  <div key={`${contact.phone}-${index}`}>
                    <strong>{contact.name}</strong>
                    <span>{contact.phone}</span>
                    <span>{contact.email}</span>
                  </div>
                ))
              ) : (
                <p className="field-note">Контакты не указаны</p>
              )}
            </div>
          ) : null}
        </section>

        <section className="detail-section">
          <h2>Условия оплаты</h2>
          <dl className="details-list">
            <div>
              <dt>Форма</dt>
              <dd>{auction.payment.form}</dd>
            </div>
            <div>
              <dt>Условие</dt>
              <dd>{auction.payment.condition}</dd>
            </div>
            <div>
              <dt>Отсрочка</dt>
              <dd>{auction.payment.delay}</dd>
            </div>
            <div>
              <dt>Предоплата</dt>
              <dd>{auction.payment.prepay}</dd>
            </div>
          </dl>
        </section>
      </div>
    </article>
  )
}
