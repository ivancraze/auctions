import { AuctionCardSkeleton } from '@/entities/auction'

import styles from './AuctionsListPage.module.scss'

interface AuctionsListSkeletonProps {
  count: number
}

export function AuctionsListSkeleton({ count }: AuctionsListSkeletonProps) {
  return (
    <div aria-hidden="true" className={styles.list}>
      {Array.from({ length: count }, (_, index) => (
        <AuctionCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function AuctionsListLoader() {
  return (
    <div aria-hidden="true" className={styles.loader}>
      <span className={styles.spinner} aria-hidden="true" />
      <span>Обновляем аукционы…</span>
    </div>
  )
}
