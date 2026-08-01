import type { AuctionDetailsViewModel } from '@/entities/auction'
import { FieldText } from '@/shared/ui'

import styles from './AuctionDetailsPage.module.scss'

function RouteSection({ routes }: Pick<AuctionDetailsViewModel, 'routes'>) {
  return (
    <section className={`${styles.section} ${styles.wide}`}>
      <h2>Маршрут</h2>
      <ol className={styles.timeline}>
        {routes.map((route) => (
          <li key={route.key}>
            <span aria-hidden="true" className={styles.timelineMarker} />
            <div>
              <FieldText variant="label">{route.operation}</FieldText>
              <h3>{route.city}</h3>
              {route.address ? <p>{route.address}</p> : null}
              <FieldText variant="note">{route.interval}</FieldText>
              <FieldText variant="note">{route.cargo}</FieldText>
              {route.contact ? (
                <FieldText variant="note">Контакт: {route.contact}</FieldText>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function TradingSection({
  trading,
  userStatus,
}: Pick<AuctionDetailsViewModel, 'trading' | 'userStatus'>) {
  return (
    <section className={styles.section}>
      <h2>Торги</h2>
      <dl className={styles.detailsList}>
        <div>
          <dt>
            <b>Ваш статус</b>
          </dt>
          <dd>{userStatus}</dd>
        </div>
        <div>
          <dt>
            <b>Ваша ставка</b>
          </dt>
          <dd>{trading.ownBet}</dd>
        </div>
        <div>
          <dt>Начало</dt>
          <dd>{trading.start}</dd>
        </div>
        <div>
          <dt>Окончание</dt>
          <dd>{trading.stop}</dd>
        </div>
        <div>
          <dt>Текущая цена</dt>
          <dd>{trading.current}</dd>
        </div>
        <div>
          <dt>Без НДС</dt>
          <dd>{trading.currentNoVat}</dd>
        </div>
        <div>
          <dt>Доступная цена</dt>
          <dd>{trading.available}</dd>
        </div>
        <div>
          <dt>Диапазон</dt>
          <dd>
            {trading.min} — {trading.max}
          </dd>
        </div>
        <div>
          <dt>Шаг</dt>
          <dd>{trading.step}</dd>
        </div>
        <div>
          <dt>Цена за км</dt>
          <dd>{trading.pricePerKm}</dd>
        </div>
      </dl>
    </section>
  )
}

function CargoSection({ cargo }: Pick<AuctionDetailsViewModel, 'cargo'>) {
  return (
    <section className={styles.section}>
      <h2>Груз и транспорт</h2>
      <dl className={styles.detailsList}>
        <div>
          <dt>Груз</dt>
          <dd>{cargo.name}</dd>
        </div>
        <div>
          <dt>Характеристики</dt>
          <dd>{cargo.characteristics}</dd>
        </div>
        <div>
          <dt>Тип кузова</dt>
          <dd>{cargo.bodyType}</dd>
        </div>
        <div>
          <dt>Температура</dt>
          <dd>{cargo.temperature}</dd>
        </div>
        <div>
          <dt>Требования к ТС</dt>
          <dd>{cargo.car}</dd>
        </div>
      </dl>
    </section>
  )
}

function OrganizerSection({
  contacts,
  hideContacts,
  organizer,
}: Pick<AuctionDetailsViewModel, 'contacts' | 'hideContacts' | 'organizer'>) {
  return (
    <section className={styles.section}>
      <h2>Организатор</h2>
      <dl className={styles.detailsList}>
        <div>
          <dt>Организация</dt>
          <dd>{organizer.name}</dd>
        </div>
        <div>
          <dt>ИНН</dt>
          <dd>{organizer.inn}</dd>
        </div>
        <div>
          <dt>КПП</dt>
          <dd>{organizer.kpp}</dd>
        </div>
      </dl>
      {!hideContacts ? (
        <div className={styles.contacts}>
          {contacts.length ? (
            contacts.map((contact, index) => (
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
  )
}

function PaymentSection({ payment }: Pick<AuctionDetailsViewModel, 'payment'>) {
  return (
    <section className={styles.section}>
      <h2>Условия оплаты</h2>
      <dl className={styles.detailsList}>
        <div>
          <dt>Форма</dt>
          <dd>{payment.form}</dd>
        </div>
        <div>
          <dt>Условие</dt>
          <dd>{payment.condition}</dd>
        </div>
        <div>
          <dt>Отсрочка</dt>
          <dd>{payment.delay}</dd>
        </div>
        <div>
          <dt>Предоплата</dt>
          <dd>{payment.prepay}</dd>
        </div>
      </dl>
    </section>
  )
}

interface AuctionDetailsSectionsProps {
  auction: AuctionDetailsViewModel
}

export function AuctionDetailsSections({
  auction,
}: AuctionDetailsSectionsProps) {
  return (
    <div className={styles.grid}>
      <RouteSection routes={auction.routes} />
      <TradingSection
        trading={auction.trading}
        userStatus={auction.userStatus}
      />
      <CargoSection cargo={auction.cargo} />
      <OrganizerSection
        contacts={auction.contacts}
        hideContacts={auction.hideContacts}
        organizer={auction.organizer}
      />
      <PaymentSection payment={auction.payment} />
    </div>
  )
}
