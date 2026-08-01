import { useEffect, useRef } from 'react'

import styles from './AuctionsListPage.module.scss'

interface AuctionPaginationProps {
  focusTarget: 'previous' | 'next' | null
  isUpdating: boolean
  lastPage: number
  onFocusRestored: () => void
  onPageChange: (target: 'previous' | 'next', page: number) => void
  page: number
}

export function AuctionPagination({
  focusTarget,
  isUpdating,
  lastPage,
  onFocusRestored,
  onPageChange,
  page,
}: AuctionPaginationProps) {
  const previousButtonRef = useRef<HTMLButtonElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  const statusRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (isUpdating || !focusTarget) return

    const targetButton =
      focusTarget === 'previous'
        ? previousButtonRef.current
        : nextButtonRef.current

    if (targetButton && !targetButton.disabled) {
      targetButton.focus()
    } else {
      statusRef.current?.focus()
    }
    onFocusRestored()
  }, [focusTarget, isUpdating, onFocusRestored, page])

  return (
    <nav className={styles.pagination} aria-label="Пагинация аукционов">
      <button
        className={styles.paginationButton}
        disabled={page <= 1 || isUpdating}
        onClick={() => {
          onPageChange('previous', Math.max(1, page - 1))
        }}
        ref={previousButtonRef}
        type="button"
      >
        ← Назад
      </button>
      <span className={styles.paginationStatus} ref={statusRef} tabIndex={-1}>
        Страница <strong>{page}</strong> из <strong>{lastPage}</strong>
      </span>
      <button
        className={styles.paginationButton}
        disabled={page >= lastPage || isUpdating}
        onClick={() => {
          onPageChange('next', page + 1)
        }}
        ref={nextButtonRef}
        type="button"
      >
        Далее →
      </button>
    </nav>
  )
}
