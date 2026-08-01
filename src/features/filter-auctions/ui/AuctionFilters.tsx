import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { mockCities } from '@/shared/config/cities'
import { useFilterUiStore } from '../model/filterUiStore'
import {
  auctionSearchSchema,
  type AuctionSearch,
  type AuctionSearchInput,
} from '../model/searchSchema'

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

export function AuctionFilters({
  values,
  onApply,
  onReset,
}: AuctionFiltersProps) {
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

  return (
    <>
      <button className="filter-trigger" onClick={open} type="button">
        Фильтры
      </button>
      {isOpen ? (
        <button
          aria-label="Закрыть фильтры"
          className="filter-backdrop"
          onClick={close}
          type="button"
        />
      ) : null}
      <aside className={`filters-panel ${isOpen ? 'filters-panel--open' : ''}`}>
        <div className="filters-panel__heading">
          <h2>Фильтры</h2>
          <button
            aria-label="Закрыть фильтры"
            className="filters-panel__close"
            onClick={close}
            type="button"
          >
            ×
          </button>
        </div>
        <form className="filters-form" onSubmit={(event) => void submit(event)}>
          <label className="form-field">
            <span>Номер заявки</span>
            <input placeholder="00000001001" {...register('cargo_num')} />
          </label>

          <label className="form-field">
            <span>Ваш статус</span>
            <select {...register('status', { setValueAs: emptyToUndefined })}>
              <option value="">Любой</option>
              <option value="NotParticipating">Не участвую</option>
              <option value="Leading">Лидирую</option>
              <option value="Losing">Ставку перебили</option>
              <option value="Winner">Победитель</option>
              <option value="Confirmed">Подтверждён</option>
            </select>
          </label>

          <label className="form-field">
            <span>Статус аукциона</span>
            <select {...register('statuses', { setValueAs: stringToNumber })}>
              <option value="">Любой</option>
              <option value="1">Планирование</option>
              <option value="2">Торги идут</option>
              <option value="3">Определение победителя</option>
              <option value="6">Завершён</option>
              <option value="8">Отменён</option>
            </select>
          </label>

          <label className="form-field">
            <span>Тип аукциона</span>
            <select {...register('auc_type', { setValueAs: emptyToUndefined })}>
              <option value="">Любой</option>
              <option value="Request">Запрос предложений</option>
              <option value="Up">На повышение</option>
              <option value="Down">На понижение</option>
              <option value="FixPrice">Фиксированная цена</option>
            </select>
          </label>

          <label className="form-field">
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
          </label>

          <label className="form-field">
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
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Погрузка от</span>
              <input type="date" {...register('load_date_from')} />
            </label>
            <label className="form-field">
              <span>Погрузка до</span>
              <input type="date" {...register('load_date_to')} />
            </label>
          </div>

          <label className="form-field">
            <span>Доступность ставки</span>
            <select
              {...register('is_available', { setValueAs: stringToBoolean })}
            >
              <option value="">Любая</option>
              <option value="true">Ставка доступна</option>
              <option value="false">Ставка недоступна</option>
            </select>
          </label>

          <label className="form-field">
            <span>Участие</span>
            <select {...register('is_bidder', { setValueAs: stringToBoolean })}>
              <option value="">Любое</option>
              <option value="true">Участвую</option>
              <option value="false">Не участвую</option>
            </select>
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Цена от</span>
              <input
                min="0"
                placeholder="0"
                type="number"
                {...register('current_price_from', {
                  setValueAs: stringToNumber,
                })}
              />
            </label>
            <label className="form-field">
              <span>Цена до</span>
              <input
                min="0"
                placeholder="300 000"
                type="number"
                {...register('current_price_to', {
                  setValueAs: stringToNumber,
                })}
              />
            </label>
          </div>

          <div className="filters-form__actions">
            <button className="button button--primary" type="submit">
              Применить
            </button>
            <button
              className="button button--secondary"
              onClick={() => {
                onReset()
                close()
              }}
              type="button"
            >
              Сбросить
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}
