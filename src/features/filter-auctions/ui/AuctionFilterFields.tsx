import type { UseFormRegister } from 'react-hook-form'

import type { AuctionSearchInput } from '../model/searchSchema'
import { mockCities } from '@/shared/config'
import { FormField } from '@/shared/ui'

import styles from './AuctionFilters.module.scss'

interface AuctionFilterFieldsProps {
  register: UseFormRegister<AuctionSearchInput>
}

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value)
const stringToNumber = (value: unknown) =>
  value === '' ? undefined : Number(value)
const stringToBoolean = (value: unknown) =>
  value === '' ? undefined : value === 'true'

export function AuctionFilterFields({ register }: AuctionFilterFieldsProps) {
  return (
    <>
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
        <select {...register('auc_type', { setValueAs: emptyToUndefined })}>
          <option value="">Любой</option>
          <option value="Request">Запрос предложений</option>
          <option value="Up">На повышение</option>
          <option value="Down">На понижение</option>
          <option value="FixPrice">Фиксированная цена</option>
        </select>
      </FormField>

      <FormField>
        <span>Город погрузки</span>
        <select {...register('load_city', { setValueAs: emptyToUndefined })}>
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
        <select {...register('unload_city', { setValueAs: emptyToUndefined })}>
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
        <select {...register('is_available', { setValueAs: stringToBoolean })}>
          <option value="">Любая</option>
          <option value="true">Ставка доступна</option>
          <option value="false">Ставка недоступна</option>
        </select>
      </FormField>

      <FormField>
        <span>Участие</span>
        <select {...register('is_bidder', { setValueAs: stringToBoolean })}>
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
    </>
  )
}
