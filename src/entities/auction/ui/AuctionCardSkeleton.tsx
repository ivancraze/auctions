import { Skeleton } from '@/shared/ui'

import cardStyles from './AuctionCard.module.scss'
import styles from './AuctionCardSkeleton.module.scss'

export function AuctionCardSkeleton() {
  return (
    <div className={`${cardStyles.card} ${styles.card}`}>
      <Skeleton className={styles.small} />
      <Skeleton variant="title" />
      <div className={styles.grid}>
        <Skeleton variant="block" />
        <Skeleton variant="block" />
        <Skeleton variant="block" />
      </div>
    </div>
  )
}
