import { useState } from 'react'

import { AuctionListCard } from './AuctionListCard'
import { AuctionPagination } from './AuctionPagination'
import { AuctionsListLoader, AuctionsListSkeleton } from './AuctionsListLoading'
import type { AuctionListItem } from '@/entities/auction'
import { mapAuctionCard } from '@/entities/auction'
import { ApiError } from '@/shared/api'
import { Button, StateCard, StateCardTitle } from '@/shared/ui'

import styles from './AuctionsListPage.module.scss'

interface AuctionsListContentProps {
  error: Error | null
  isOutOfRange: boolean
  isPending: boolean
  isUpdating: boolean
  items: AuctionListItem[]
  lastPage: number
  onIntent: (auctionUuid: string) => void
  onPageChange: (page: number) => void
  onRetry: () => void
  page: number
  pageSize: number
}

export function AuctionsListContent({
  error,
  isOutOfRange,
  isPending,
  isUpdating,
  items,
  lastPage,
  onIntent,
  onPageChange,
  onRetry,
  page,
  pageSize,
}: AuctionsListContentProps) {
  const [paginationFocusTarget, setPaginationFocusTarget] = useState<
    'previous' | 'next' | null
  >(null)

  if (isPending) return <AuctionsListSkeleton count={pageSize} />
  if (isUpdating || isOutOfRange) return <AuctionsListLoader />

  if (error) {
    return (
      <StateCard role="alert" tone="error">
        <StateCardTitle>Не удалось загрузить аукционы</StateCardTitle>
        <p>
          {error instanceof ApiError ? error.problem.message : error.message}
        </p>
        <Button onClick={onRetry} type="button" variant="secondary">
          Повторить
        </Button>
      </StateCard>
    )
  }

  if (items.length === 0) {
    return (
      <StateCard>
        <StateCardTitle>Аукционы не найдены</StateCardTitle>
        <p>Попробуйте изменить условия поиска.</p>
      </StateCard>
    )
  }

  return (
    <>
      <div className={styles.list}>
        {items.map((item, index) => {
          const auction = mapAuctionCard(item)

          return (
            <AuctionListCard
              auction={auction}
              key={auction.uuid ?? `${auction.cargoNumber}-${index}`}
              onIntent={onIntent}
            />
          )
        })}
      </div>

      <AuctionPagination
        focusTarget={paginationFocusTarget}
        isUpdating={isUpdating}
        lastPage={lastPage}
        onFocusRestored={() => setPaginationFocusTarget(null)}
        onPageChange={(target, nextPage) => {
          setPaginationFocusTarget(target)
          onPageChange(nextPage)
        }}
        page={page}
      />
    </>
  )
}
