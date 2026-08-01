import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'

import { AuctionDetailsSkeleton } from './AuctionDetailsSkeleton'
import { auctionQueries, mapAuctionDetails } from '@/entities/auction'
import { ApiError } from '@/shared/api/client'
import {
  Badge,
  BadgeGroup,
  Breadcrumbs,
  Button,
  buttonClassName,
  Eyebrow,
  FieldText,
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
        <span>→</span>
        <span>Заявка № {auction.cargoNumber}</span>
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
            <Button disabled type="button" variant="disabled">
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

      <div className={styles.grid}>
        <section className={`${styles.section} ${styles.wide}`}>
          <h2>Маршрут</h2>
          <ol className={styles.timeline}>
            {auction.routes.map((route) => (
              <li key={route.key}>
                <span className={styles.timelineMarker} />
                <div>
                  <FieldText variant="label">{route.operation}</FieldText>
                  <h3>{route.city}</h3>
                  {route.address ? <p>{route.address}</p> : null}
                  <FieldText variant="note">{route.interval}</FieldText>
                  <FieldText variant="note">{route.cargo}</FieldText>
                  {route.contact ? (
                    <FieldText variant="note">
                      Контакт: {route.contact}
                    </FieldText>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section}>
          <h2>Торги</h2>
          <dl className={styles.detailsList}>
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

        <section className={styles.section}>
          <h2>Груз и транспорт</h2>
          <dl className={styles.detailsList}>
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

        <section className={styles.section}>
          <h2>Организатор</h2>
          <dl className={styles.detailsList}>
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
            <div className={styles.contacts}>
              {auction.contacts.length ? (
                auction.contacts.map((contact, index) => (
                  <div key={`${contact.phone}-${index}`}>
                    <strong>{contact.name}</strong>
                    <span>{contact.phone}</span>
                    <span>{contact.email}</span>
                  </div>
                ))
              ) : (
                <FieldText variant="note">Контакты не указаны</FieldText>
              )}
            </div>
          ) : null}
        </section>

        <section className={styles.section}>
          <h2>Условия оплаты</h2>
          <dl className={styles.detailsList}>
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
