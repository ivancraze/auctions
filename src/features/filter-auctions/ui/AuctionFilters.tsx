import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  type AuctionSearch,
  type AuctionSearchInput,
  auctionSearchSchema,
} from '../model/searchSchema'
import { AuctionFilterFields } from './AuctionFilterFields'
import { useAuctionFiltersPanel } from './useAuctionFiltersPanel'
import { Button } from '@/shared/ui'

import styles from './AuctionFilters.module.scss'

interface AuctionFiltersProps {
  values: AuctionSearch
  onApply: (values: AuctionSearch) => void
  onReset: () => void
}

const filtersPanelId = 'auction-filters-panel'
const filtersTitleId = 'auction-filters-title'

export function AuctionFilters({
  values,
  onApply,
  onReset,
}: AuctionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const { closeButtonRef, panelRef, triggerRef } = useAuctionFiltersPanel(
    isOpen,
    close,
  )
  const { register, handleSubmit } = useForm<
    AuctionSearchInput,
    unknown,
    AuctionSearch
  >({
    resolver: zodResolver(auctionSearchSchema),
    values,
  })

  const submit = handleSubmit((formValues) => {
    onApply({ ...formValues, page: 1 })
    close()
  })

  return (
    <>
      <button
        aria-controls={filtersPanelId}
        aria-expanded={isOpen}
        className={styles.trigger}
        onClick={open}
        ref={triggerRef}
        type="button"
      >
        Фильтры
      </button>
      {isOpen ? (
        <button
          aria-label="Закрыть фильтры"
          className={styles.backdrop}
          onClick={close}
          type="button"
        />
      ) : null}
      <aside
        aria-labelledby={filtersTitleId}
        aria-modal={isOpen || undefined}
        className={`${styles.panel} ${isOpen ? styles.open : ''}`}
        id={filtersPanelId}
        ref={panelRef}
        role={isOpen ? 'dialog' : undefined}
      >
        <div className={styles.heading}>
          <h2 id={filtersTitleId}>Фильтры</h2>
          <button
            aria-label="Закрыть фильтры"
            className={styles.close}
            onClick={close}
            ref={closeButtonRef}
            type="button"
          >
            ×
          </button>
        </div>
        <form className={styles.form} onSubmit={(event) => void submit(event)}>
          <div className={styles.fields}>
            <AuctionFilterFields register={register} />
          </div>

          <div className={styles.actions}>
            <Button type="submit">Применить</Button>
            <Button
              onClick={() => {
                onReset()
                close()
              }}
              type="button"
              variant="secondary"
            >
              Сбросить
            </Button>
          </div>
        </form>
      </aside>
    </>
  )
}
