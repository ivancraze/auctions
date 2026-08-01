import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'

import { useFilterUiStore } from '../model/filterUiStore'
import {
  type AuctionSearch,
  type AuctionSearchInput,
  auctionSearchSchema,
} from '../model/searchSchema'
import { mockCities } from '@/shared/config'
import { Button, FormField } from '@/shared/ui'

import styles from './AuctionFilters.module.scss'

interface AuctionFiltersProps {
  values: AuctionSearch
  onApply: (values: AuctionSearch) => void
  onReset: () => void
}

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value)
const stringToNumber = (value: unknown) =>
  value === '' ? undefined : Number(value)
const stringToBoolean = (value: unknown) =>
  value === '' ? undefined : value === 'true'
const filtersPanelId = 'auction-filters-panel'
const filtersTitleId = 'auction-filters-title'
const focusableElementSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function AuctionFilters({
  values,
  onApply,
  onReset,
}: AuctionFiltersProps) {
  const panelRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const isOpen = useFilterUiStore((state) => state.isOpen)
  const open = useFilterUiStore((state) => state.open)
  const close = useFilterUiStore((state) => state.close)
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

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : triggerRef.current
    const previousBodyOverflow = document.body.style.overflow

    closeButtonRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          focusableElementSelector,
        ) ?? [],
      )
      const firstElement = focusableElements.at(0)
      const lastElement = focusableElements.at(-1)

      if (!firstElement || !lastElement) {
        event.preventDefault()
        return
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
      previouslyFocusedElement?.focus()
    }
  }, [close, isOpen])

  useLayoutEffect(() => {
    let animationFrame = 0

    const updatePanelHeight = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        const panel = panelRef.current
        if (!panel) return

        if (window.innerWidth <= 640) {
          panel.style.removeProperty('--filters-panel-max-height')
          return
        }

        let documentTop = 0
        let element: HTMLElement | null = panel

        while (element) {
          documentTop += element.offsetTop
          element = element.offsetParent as HTMLElement | null
        }

        const availableHeight = Math.max(
          180,
          window.innerHeight - documentTop - 20,
        )
        panel.style.setProperty(
          '--filters-panel-max-height',
          `${availableHeight}px`,
        )
      })
    }

    updatePanelHeight()
    window.addEventListener('resize', updatePanelHeight)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', updatePanelHeight)
    }
  }, [])

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
            <FormField>
              <span>Номер заявки</span>
              <input placeholder="00000001001" {...register('cargo_num')} />
            </FormField>

            <FormField>
              <span>Ваш статус</span>
              <select {...register('status', { setValueAs: emptyToUndefined })}>
                <option value="">Любой</option>
                <option value="NotParticipating">Не участвую</option>
                <option value="Leading">Лидирую</option>
                <option value="Losing">Ставку перебили</option>
                <option value="OnPending">Ожидает решения</option>
                <option value="Confirmed">Подтверждён</option>
                <option value="ChoosingWinner">Выбор победителя</option>
                <option value="Winner">Победитель</option>
                <option value="Accepted">Ставка принята</option>
                <option value="Unknown">Неизвестный статус</option>
              </select>
            </FormField>

            <FormField>
              <span>Статус аукциона</span>
              <select {...register('statuses', { setValueAs: stringToNumber })}>
                <option value="">Любой</option>
                <option value="1">Планирование</option>
                <option value="2">Торги идут</option>
                <option value="3">Определение победителя</option>
                <option value="4">Ожидание сделки</option>
                <option value="5">В работе</option>
                <option value="6">Завершён</option>
                <option value="7">Остановлен</option>
              </select>
            </FormField>

            <FormField>
              <span>Тип аукциона</span>
              <select
                {...register('auc_type', { setValueAs: emptyToUndefined })}
              >
                <option value="">Любой</option>
                <option value="Request">Запрос предложений</option>
                <option value="Up">На повышение</option>
                <option value="Down">На понижение</option>
                <option value="FixPrice">Фиксированная цена</option>
              </select>
            </FormField>

            <FormField>
              <span>Город погрузки</span>
              <select
                {...register('load_city', { setValueAs: emptyToUndefined })}
              >
                <option value="">Любой</option>
                {mockCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField>
              <span>Город выгрузки</span>
              <select
                {...register('unload_city', { setValueAs: emptyToUndefined })}
              >
                <option value="">Любой</option>
                {mockCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </FormField>

            <div className={styles.row}>
              <FormField>
                <span>Погрузка от</span>
                <input type="date" {...register('load_date_from')} />
              </FormField>
              <FormField>
                <span>Погрузка до</span>
                <input type="date" {...register('load_date_to')} />
              </FormField>
            </div>

            <FormField>
              <span>Доступность ставки</span>
              <select
                {...register('is_available', { setValueAs: stringToBoolean })}
              >
                <option value="">Любая</option>
                <option value="true">Ставка доступна</option>
                <option value="false">Ставка недоступна</option>
              </select>
            </FormField>

            <FormField>
              <span>Участие</span>
              <select
                {...register('is_bidder', { setValueAs: stringToBoolean })}
              >
                <option value="">Любое</option>
                <option value="true">Участвую</option>
                <option value="false">Не участвую</option>
              </select>
            </FormField>

            <div className={styles.row}>
              <FormField>
                <span>Цена от</span>
                <input
                  min="0"
                  placeholder="0"
                  type="number"
                  {...register('current_price_from', {
                    setValueAs: stringToNumber,
                  })}
                />
              </FormField>
              <FormField>
                <span>Цена до</span>
                <input
                  min="0"
                  placeholder="300 000"
                  type="number"
                  {...register('current_price_to', {
                    setValueAs: stringToNumber,
                  })}
                />
              </FormField>
            </div>
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
