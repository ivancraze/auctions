import type { ReactNode } from 'react'

import type { AuctionCardViewModel } from '../model/mapAuctionCard'
import { Badge, BadgeGroup, FieldText } from '@/shared/ui'

import styles from './AuctionCard.module.scss'

interface AuctionCardProps {
  actions: ReactNode
  auction: AuctionCardViewModel
  onIntent: (auctionUuid: string) => void
}

export function AuctionCard({ actions, auction, onIntent }: AuctionCardProps) {
  const handleIntent = () => {
    if (auction.uuid) onIntent(auction.uuid)
  }

  return (
    <article
      className={styles.card}
      onPointerEnter={handleIntent}
      onFocus={handleIntent}
    >
      <div className={styles.heading}>
        <div>
          <p className={styles.number}>Заявка № {auction.cargoNumber}</p>
          <h2 className={styles.route}>{auction.route}</h2>
        </div>
        <BadgeGroup>
          <Badge tone={auction.statusTone}>{auction.status}</Badge>
          <Badge tone="type">{auction.type}</Badge>
        </BadgeGroup>
      </div>

      <div className={styles.grid}>
        <div className={styles.section}>
          <FieldText variant="label">Погрузка</FieldText>
          <FieldText variant="value">{auction.loadDate}</FieldText>
          <FieldText spaced variant="label">
            Выгрузка
          </FieldText>
          <FieldText variant="value">{auction.unloadDate}</FieldText>
        </div>
        <div className={styles.section}>
          <FieldText variant="label">Груз</FieldText>
          <FieldText variant="value">{auction.cargoName}</FieldText>
          <FieldText variant="note">{auction.cargoDetails}</FieldText>
        </div>
        <div className={styles.section}>
          <FieldText variant="label">Текущая цена</FieldText>
          <FieldText variant="priceValue">{auction.currentPrice}</FieldText>
          <FieldText variant="note">{auction.pricePerKm}</FieldText>
          <FieldText variant="note">Шаг: {auction.step}</FieldText>
        </div>
      </div>

      <footer className={styles.footer}>
        <div>
          <FieldText variant="userStatus">{auction.userStatus}</FieldText>
          <FieldText variant="note">
            {auction.hasOwnBet ? 'Есть ваша ставка' : 'Вашей ставки пока нет'}
          </FieldText>
        </div>
        <div className={styles.actions}>{actions}</div>
      </footer>
    </article>
  )
}
