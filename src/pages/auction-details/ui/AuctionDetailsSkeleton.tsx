import { Skeleton } from '@/shared/ui'

import styles from './AuctionDetailsPage.module.scss'

export function AuctionDetailsSkeleton() {
  return (
    <div
      className={styles.grid}
      aria-busy="true"
      aria-label="Загрузка аукциона"
      role="status"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div className={styles.section} key={index}>
          <Skeleton variant="title" />
          <Skeleton variant="block" />
        </div>
      ))}
    </div>
  )
}
